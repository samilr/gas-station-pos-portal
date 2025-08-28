import { ITransactionResume } from '../types/transaction';
import { buildApiUrl, getAuthHeaders, handleApiError } from '../config/api';

class TransactionService {
  private baseUrl: string;

  constructor() {
    // Usar la configuración global de la API
    this.baseUrl = buildApiUrl('');
  }

  /**
   * Obtiene transacciones desde la API con filtros opcionales
   */
  async getTransactions(params?: {
    startDate?: string;
    endDate?: string;
    status?: number;
    taxpayerId?: string;
    cfNumber?: string;
    cfType?: string;
    siteId?: string;
    terminal?: number;
    staftId?: number;
    shift?: number;
  }): Promise<ITransactionResume[]> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Construir URL usando la configuración global
      let url = buildApiUrl('/trans');
      if (params) {
        const queryParams = new URLSearchParams();
        
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.status !== undefined) queryParams.append('status', params.status.toString());
        if (params.taxpayerId) queryParams.append('taxpayerId', params.taxpayerId);
        if (params.cfNumber) queryParams.append('cfNumber', params.cfNumber);
        if (params.cfType) queryParams.append('cfType', params.cfType);
        if (params.siteId) queryParams.append('siteId', params.siteId);
        if (params.terminal !== undefined) queryParams.append('terminal', params.terminal.toString());
        if (params.staftId !== undefined) queryParams.append('staftId', params.staftId.toString());
        if (params.shift !== undefined) queryParams.append('shift', params.shift.toString());
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
        
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(handleApiError({ response }));
      }

      const data = await response.json();
      console.log('Respuesta de la API:', data); // Para debugging
      
      // Asegurar que siempre devolvemos un array
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.transactions)) {
        return data.transactions;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn('La API no devolvió un array de transacciones:', data);
        return [];
      }
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene una transacción específica por ID
   */
  async getTransactionById(transNumber: string): Promise<ITransactionResume> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/transactions/${transNumber}`), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(handleApiError({ response }));
      }

      const data = await response.json();
      return data.transaction || data; // Maneja tanto {transaction: {}} como {}
    } catch (error) {
      console.error('Error al obtener transacción:', error);
      throw error;
    }
  }

  /**
   * Busca transacciones por criterios específicos
   */
  async searchTransactions(params: {
    startDate?: string;
    endDate?: string;
    status?: number;
    taxpayerId?: string;
    cfNumber?: string;
    cfType?: string;
    siteId?: string;
    terminal?: number;
    staftId?: number;
    shift?: number;
  }): Promise<ITransactionResume[]> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.status !== undefined) queryParams.append('status', params.status.toString());
      if (params.taxpayerId) queryParams.append('taxpayerId', params.taxpayerId);
      if (params.cfNumber) queryParams.append('cfNumber', params.cfNumber);
      if (params.cfType) queryParams.append('cfType', params.cfType);
      if (params.siteId) queryParams.append('siteId', params.siteId);
      if (params.terminal !== undefined) queryParams.append('terminal', params.terminal.toString());
      if (params.staftId !== undefined) queryParams.append('staftId', params.staftId.toString());
      if (params.shift !== undefined) queryParams.append('shift', params.shift.toString());

      const response = await fetch(buildApiUrl(`/transactions/search?${queryParams}`), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(handleApiError({ response }));
      }

      const data = await response.json();
      return data.transactions || data; // Maneja tanto {transactions: []} como []
    } catch (error) {
      console.error('Error al buscar transacciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de transacciones
   */
  async getTransactionStats(): Promise<{
    totalSales: number;
    completedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    totalTransactions: number;
  }> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl('/trans/stats'), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(handleApiError({ response }));
      }

      const data = await response.json();
      return data.stats || data; // Maneja tanto {stats: {}} como {}
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Exporta transacciones a diferentes formatos
   */
  async exportTransactions(format: 'pdf' | 'excel' | 'csv', params?: {
    startDate?: string;
    endDate?: string;
    status?: number;
  }): Promise<Blob> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.status !== undefined) queryParams.append('status', params.status.toString());

      const response = await fetch(buildApiUrl(`/transactions/export?${queryParams}`), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(handleApiError({ response }));
      }

      return await response.blob();
    } catch (error) {
      console.error('Error al exportar transacciones:', error);
      throw error;
    }
  }

  /**
   * Reversa una transacción específica
   */
  async reverseTransaction(transNumber: string): Promise<{ successful: boolean; message?: string; data: {transNumber: string, encf: string} }> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(buildApiUrl(`/trans/return/${transNumber}`), {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(handleApiError({ response }));
      }

      const data = await response.json();
      return {
        successful: data.successful || false,
        data: data.data,
        message: data?.message || 'Respuesta del servidor'
      };
    } catch (error) {
      console.error('Error al reversar transacción:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const transactionService = new TransactionService();
export default transactionService;
