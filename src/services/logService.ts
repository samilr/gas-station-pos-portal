import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, ApiResponse } from './apiInterceptor';
import { IActionLog, IErrorLog } from '../types/logs';

export interface LogsResponse {
  actionLogs: IActionLog[];
  errorLogs: IErrorLog[];
}

export const logService = {
  // Obtener logs de acciones
  async getActionLogs(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<IActionLog[]>> {
    let url = buildApiUrl('action-log');
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    return await apiGet<IActionLog[]>(url);
  },

  // Obtener logs de errores
  async getErrorLogs(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<IErrorLog[]>> {
    let url = buildApiUrl('error-log');
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    return await apiGet<IErrorLog[]>(url);
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
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<string>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.format) queryParams.append('format', params.format);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

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
