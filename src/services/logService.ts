import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiDelete, ApiResponse } from './apiInterceptor';
import { IActionLog, IErrorLog } from '../types/logs';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedLogsResponse<T> {
  successful: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// La API devuelve { successful, data: [...], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }
// Usamos fetch directo para obtener la respuesta completa sin que apiGet modifique la estructura.
async function fetchPaginatedLogs<T>(url: string): Promise<PaginatedLogsResponse<T>> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-site-ID': 'PORTAL',
      'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`,
    },
  });
  const json = await response.json();

  const items: T[] = json.data || [];
  const pagination = json.pagination || {};
  const total = pagination.total ?? 0;
  const page = pagination.page || 1;
  const limit = pagination.limit || 50;
  const totalPages = pagination.totalPages || (limit > 0 ? Math.ceil(total / limit) : 1);

  return {
    successful: json.successful !== false,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: pagination.hasNext ?? page < totalPages,
      hasPrev: pagination.hasPrev ?? page > 1,
    },
  };
}

export interface LogsResponse {
  actionLogs: IActionLog[];
  errorLogs: IErrorLog[];
}

export const logService = {
  // Obtener logs de acciones
  async getActionLogs(params?: {
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedLogsResponse<IActionLog>> {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    const query = queryParams.toString();
    const url = `${buildApiUrl('audit/actions')}${query ? `?${query}` : ''}`;
    return fetchPaginatedLogs<IActionLog>(url);
  },

  // Obtener logs de errores
  async getErrorLogs(params?: {
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedLogsResponse<IErrorLog>> {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    const query = queryParams.toString();
    const url = `${buildApiUrl('audit/errors')}${query ? `?${query}` : ''}`;
    return fetchPaginatedLogs<IErrorLog>(url);
  },

  // Marcar error como resuelto
  async resolveError(errorId: string, resolvedBy: string): Promise<ApiResponse<boolean>> {
    return await apiPost<boolean>(
      buildApiUrl(`audit/errors/${errorId}/resolve`),
      { resolvedBy }
    );
  },

  // Exportar logs
  async exportLogs(type: 'actions' | 'errors', params?: {
    format?: 'csv' | 'json' | 'excel';
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<string>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.format) queryParams.append('format', params.format);
      if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params?.toDate) queryParams.append('toDate', params.toDate);

      const response = await fetch(`${buildApiUrl('audit')}/${type}/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'X-site-ID': 'PORTAL',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      return {
        successful: true,
        data: url
      };
    } catch (error) {
      console.error('Error exporting logs:', error);
      return {
        successful: false,
        data: '',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },
  // Eliminar action log
  async deleteActionLog(id: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`audit/actions/${id}`));
  },

  // Eliminar error log
  async deleteErrorLog(id: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`audit/errors/${id}`));
  },

  // Obtener action logs paginados (nuevo endpoint)
  async getAuditActionLogs(page = 1, limit = 50): Promise<any> {
    const response = await apiGet<any>(buildApiUrl(`audit/actions?page=${page}&limit=${limit}`));
    return response;
  },

  // Obtener error logs paginados (nuevo endpoint)
  async getAuditErrorLogs(page = 1, limit = 50): Promise<any> {
    const response = await apiGet<any>(buildApiUrl(`audit/errors?page=${page}&limit=${limit}`));
    return response;
  },
};
