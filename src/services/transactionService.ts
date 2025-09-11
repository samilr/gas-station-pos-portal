import { ITransactionResume } from '../types/transaction';
import { buildApiUrl } from '../config/api';
import { apiGet, apiPost } from './apiInterceptor';

class TransactionService {
  /**
   * Obtiene transacciones desde la API con filtros opcionales
   */
  async getTransactions(params?: {
    transNumber?: string;
    cfNumber?: string;
    siteId?: string;
    terminal?: number;
    cfType?: string;
    staftId?: number;
    taxpayerId?: string;
    shift?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ITransactionResume[]> {
    try {
      // Construir URL usando la configuración global
      let url = buildApiUrl('trans');
      if (params) {
        const queryParams = new URLSearchParams();
        
        if (params.transNumber) queryParams.append('transNumber', params.transNumber);
        if (params.cfNumber) queryParams.append('cfNumber', params.cfNumber);
        if (params.siteId) queryParams.append('siteId', params.siteId);
        if (params.terminal !== undefined) queryParams.append('terminal', params.terminal.toString());
        if (params.cfType) queryParams.append('cfType', params.cfType);
        if (params.staftId !== undefined) queryParams.append('staftId', params.staftId.toString());
        if (params.taxpayerId) queryParams.append('taxpayerId', params.taxpayerId);
        if (params.shift !== undefined) queryParams.append('shift', params.shift.toString());
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
        
      const response = await apiGet<ITransactionResume[]>(url);

      if (!response.successful) {
        throw new Error(response.error || 'Error al obtener transacciones');
      }
      
      // Asegurar que siempre devolvemos un array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('La API no devolvió un array de transacciones:', response.data);
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
      const response = await apiGet<ITransactionResume>(buildApiUrl(`transactions/${transNumber}`));

      if (!response.successful) {
        throw new Error(response.error|| 'Error al obtener transacción');
      }

      return response.data;
    } catch (error) {
      console.error('Error al obtener transacción:', error);
      throw error;
    }
  }

  /**
   * Busca transacciones con filtros específicos
   */
  async searchTransactions(params: {
    transNumber?: string;
    cfNumber?: string;
    siteId?: string;
    terminal?: number;
    cfType?: string;
    staftId?: number;
    taxpayerId?: string;
    shift?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ITransactionResume[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.transNumber) queryParams.append('transNumber', params.transNumber);
      if (params.cfNumber) queryParams.append('cfNumber', params.cfNumber);
      if (params.siteId) queryParams.append('siteId', params.siteId);
      if (params.terminal !== undefined) queryParams.append('terminal', params.terminal.toString());
      if (params.cfType) queryParams.append('cfType', params.cfType);
      if (params.staftId !== undefined) queryParams.append('staftId', params.staftId.toString());
      if (params.taxpayerId) queryParams.append('taxpayerId', params.taxpayerId);
      if (params.shift !== undefined) queryParams.append('shift', params.shift.toString());
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiGet<ITransactionResume[]>(buildApiUrl(`transactions/search?${queryParams}`));

      if (!response.successful) {
        throw new Error(response.error || 'Error al buscar transacciones');
      }

      return response.data || [];
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
      const response = await apiGet(buildApiUrl('trans/stats'));

      if (!response.successful) {
        throw new Error(response.error || 'Error al obtener estadísticas');
      }

      return response.data;
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
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.status !== undefined) queryParams.append('status', params.status.toString());

      const response = await fetch(buildApiUrl(`transactions/export?${queryParams}`), {
        method: 'GET',
        headers: {
          'X-site-ID': 'PORTAL',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al exportar: ${response.statusText}`);
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
      const response = await apiPost(buildApiUrl(`trans/return/${transNumber}`));

      if (!response.successful) {
        throw new Error(response.error || 'Error al reversar transacción');
      }

      return {
        successful: response.successful,
        data: response.data,
        message: response.error || 'Respuesta del servidor'
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
