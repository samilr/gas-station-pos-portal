import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '../../config/environment';

/**
 * Tags para invalidación de cache entre endpoints.
 * Cada dominio agrega los suyos via `api.enhanceEndpoints` si los necesita,
 * pero se centralizan aquí para evitar typos.
 */
export const API_TAGS = [
  'Category',
  'Product',
  'Site',
  'User',
  'Role',
  'HostType',
  'Device',
  'Terminal',
  'Dataphone',
  'DataphoneSupplier',
  'DataphoneTerminal',
  'FuelIsland',
  'DispenserConfig',
  'Nozzle',
  'TaxType',
  'TaxLine',
  'Job',
  'CardPayment',
  'Transaction',
  'Log',
] as const;

export type ApiTag = (typeof API_TAGS)[number];

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers, { endpoint }) => {
    headers.set('Accept', 'application/json');
    headers.set('X-site-ID', 'PORTAL');

    const isLoginEndpoint = endpoint === 'login';
    if (!isLoginEndpoint) {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Wrapper del baseQuery: si la API devuelve 401, limpia la sesión y redirige.
 * Además, desempaca el envelope `{ successful, data, pagination? }` del backend.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('tokenExpiresIn');
    window.location.href = '/login';
    return result;
  }

  // Normalizar envelope `{ successful, data, pagination? }` para que los endpoints
  // reciban directamente el payload útil sin tener que hacerlo caso por caso.
  if (!result.error && result.data && typeof result.data === 'object') {
    const body = result.data as { successful?: boolean; data?: unknown; pagination?: unknown; error?: string };
    if (body.successful === false) {
      return {
        error: {
          status: 'CUSTOM_ERROR',
          error: body.error || 'Error de la API',
          data: body,
        } as FetchBaseQueryError,
      };
    }
    if (body.pagination !== undefined) {
      return { data: body };
    }
    if (body.data !== undefined) {
      return { data: body.data };
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: API_TAGS,
  endpoints: () => ({}),
});

/** Normaliza la respuesta de lista: acepta `[]` o `{ data: [] }`. */
export const unwrapArray = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  const nested = (response as { data?: unknown })?.data;
  return Array.isArray(nested) ? (nested as T[]) : [];
};

/** Extrae mensaje de error legible de un FetchBaseQueryError. */
export const getErrorMessage = (error: unknown, fallback = 'Error al cargar datos'): string | null => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    const e = error as { error?: string; data?: { error?: string; message?: string }; status?: unknown };
    if (typeof e.error === 'string') return e.error;
    if (e.data?.error) return e.data.error;
    if (e.data?.message) return e.data.message;
  }
  return fallback;
};
