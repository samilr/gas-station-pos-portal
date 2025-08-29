import { buildApiUrl } from '../config/api';
import { IActionLog, IErrorLog } from '../types/logs';

export interface ApiResponse<T> {
  successful: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LogsResponse {
  actionLogs: IActionLog[];
  errorLogs: IErrorLog[];
}

const API_BASE_URL = buildApiUrl('');

export const logService = {
  // Obtener logs de acciones
  async getActionLogs(): Promise<ApiResponse<IActionLog[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}action-log`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        successful: true,
        data: data.data || []
      };
    } catch (error) {
      console.error('Error fetching action logs:', error);
      return {
        successful: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  // Obtener logs de errores
  async getErrorLogs(): Promise<ApiResponse<IErrorLog[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}error-log`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        successful: true,
        data: data.data || []
      };
    } catch (error) {
      console.error('Error fetching error logs:', error);
      return {
        successful: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  // Marcar error como resuelto
  async resolveError(errorId: string, resolvedBy: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${API_BASE_URL}/logs/errors/${errorId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ resolvedBy })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        successful: true,
        data: true
      };
    } catch (error) {
      console.error('Error resolving error log:', error);
      return {
        successful: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
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

      const response = await fetch(`${API_BASE_URL}/logs/${type}/export?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
};
