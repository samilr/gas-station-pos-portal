import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, ApiResponse } from './apiInterceptor';
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
    const url = `${buildApiUrl('action-log')}${query ? `?${query}` : ''}`;

    const response = await apiGet<IActionLog[]>(url) as any;
    return response;
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
    const url = `${buildApiUrl('error-log')}${query ? `?${query}` : ''}`;

    const response = await apiGet<IErrorLog[]>(url) as any;
    return response;
  },

  // Marcar error como resuelto
  async resolveError(errorId: string, resolvedBy: string): Promise<ApiResponse<boolean>> {
    return await apiPost<boolean>(
      buildApiUrl(`logs/errors/${errorId}/resolve`),
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

      const response = await fetch(`${buildApiUrl('logs')}/${type}/export?${queryParams}`, {
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
  }
};
