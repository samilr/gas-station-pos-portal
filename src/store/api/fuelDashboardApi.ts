import { api } from './baseApi';
import {
  FuelDashboardFilters,
  FuelSummary,
  FuelDailyTrendRow,
  FuelByPumpRow,
  FuelByFuelGradeRow,
  FuelHourlyRow,
  FuelBySiteRow,
  FuelTopTransactionRow,
} from '../../services/fuelTransactionService';

const buildQuery = (
  filters?: FuelDashboardFilters,
  extra?: Record<string, string | number | undefined>
): string => {
  const qs = new URLSearchParams();
  if (filters?.startDate) qs.append('startDate', filters.startDate);
  if (filters?.endDate) qs.append('endDate', filters.endDate);
  if (filters?.siteId) qs.append('siteId', filters.siteId);
  if (filters?.excludeOffline !== undefined) qs.append('excludeOffline', String(filters.excludeOffline));
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined && v !== null) qs.append(k, String(v));
    });
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
};

// El backend envuelve { successful, filters, data } y el baseQuery ya extrae `data`.
// Pero a veces data puede ser el cuerpo completo. Defensivo.
const unwrapData = <T>(response: unknown): T => {
  const body = response as { data?: T } | T;
  if (body && typeof body === 'object' && 'data' in (body as object)) {
    return (body as { data: T }).data;
  }
  return body as T;
};

export const fuelDashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFuelSummary: build.query<FuelSummary, FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/summary${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<FuelSummary>,
    }),
    getFuelDailyTrend: build.query<FuelDailyTrendRow[], FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/daily-trend${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<FuelDailyTrendRow[]>,
    }),
    getFuelBySite: build.query<FuelBySiteRow[], FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/by-site${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<FuelBySiteRow[]>,
    }),
    getFuelByPump: build.query<FuelByPumpRow[], FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/by-pump${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<FuelByPumpRow[]>,
    }),
    getFuelByGrade: build.query<FuelByFuelGradeRow[], FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/by-fuel-grade${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<FuelByFuelGradeRow[]>,
    }),
    getFuelHourly: build.query<FuelHourlyRow[], FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/hourly${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<FuelHourlyRow[]>,
    }),
    getFuelTopTransactions: build.query<
      FuelTopTransactionRow[],
      { filters?: FuelDashboardFilters; limit?: number } | void
    >({
      query: (arg) =>
        `fuel-transactions/dashboard/top-transactions${buildQuery(arg?.filters, { limit: arg?.limit ?? 20 })}`,
      transformResponse: unwrapData<FuelTopTransactionRow[]>,
    }),
  }),
});

export const {
  useGetFuelSummaryQuery,
  useGetFuelDailyTrendQuery,
  useGetFuelBySiteQuery,
  useGetFuelByPumpQuery,
  useGetFuelByGradeQuery,
  useGetFuelHourlyQuery,
  useGetFuelTopTransactionsQuery,
} = fuelDashboardApi;
