import { 
  ITransactionResume, 
  IPaginatedTransactionsResponse,
  ISalesAndReturnsSummary,
  IDailySales,
  ITopTransaction,
  ITopProduct,
  ISalesBySite
} from '../types/transaction';
import { buildApiUrl } from '../config/api';
import { apiGet, apiPost } from './apiInterceptor';

/**
 * Convierte YYYY-MM-DD a ISO datetime con offset GMT-4 (inicio del día en Santo Domingo).
 * Si ya incluye hora u offset, se devuelve sin cambios.
 * Evita que el backend interprete la fecha como UTC midnight y traiga transacciones
 * del día anterior en horario local.
 */
const toSantoDomingoStartOfDay = (date: string): string => {
  if (!date) return date;
  if (date.includes('T')) return date;
  return `${date}T00:00:00-04:00`;
};

class TransactionService {
  /**
   * Obtiene transacciones desde la API con filtros opcionales y paginación
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
    page?: number;
    limit?: number;
  }): Promise<IPaginatedTransactionsResponse> {
    try {
      // Construir URL usando la configuración global
      let url = buildApiUrl('trans');
      if (params) {
        const queryParams = new URLSearchParams();
        
        // Parámetros de paginación
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
        
        // Filtros existentes
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
        
      // Usar fetch directamente para obtener la respuesta completa sin que apiGet la modifique
      // porque apiGet hace data: data.data || data, lo que puede perder pagination y statistics
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-site-ID': 'PORTAL'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const fetchResponse = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (fetchResponse.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }
      
      if (!fetchResponse.ok) {
        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }
      
      const rawData = await fetchResponse.json();
      console.log('🔍 Respuesta raw de la API:', rawData);
      
      // La API devuelve directamente { successful: true, data: [...], pagination: {...}, statistics: {...} }
      let apiResponse: IPaginatedTransactionsResponse;
      
      if (rawData && typeof rawData === 'object') {
        // Verificar que tenga la estructura esperada
        if ('data' in rawData && 'pagination' in rawData && 'statistics' in rawData) {
          apiResponse = {
            successful: rawData.successful !== false,
            data: rawData.data,
            pagination: rawData.pagination,
            statistics: rawData.statistics
          };
        } 
        // Si es un array (formato antiguo)
        else if (Array.isArray(rawData)) {
          console.warn('La API devolvió un array simple, convirtiendo a formato paginado');
          apiResponse = {
            successful: true,
            data: rawData,
            pagination: {
              page: 1,
              limit: rawData.length,
              total: rawData.length,
              totalPages: 1,
              hasNext: false,
              hasPrev: false
            },
            statistics: {
              totalTransactions: rawData.length,
              totalSalesTransactions: rawData.filter((t: any) => !t.isReturn).length,
              totalReturnTransactions: rawData.filter((t: any) => t.isReturn).length,
              totalSales: rawData.filter((t: any) => !t.isReturn).reduce((sum: number, t: any) => sum + t.total, 0),
              totalReturn: rawData.filter((t: any) => t.isReturn).reduce((sum: number, t: any) => sum + t.total, 0),
              dgiiAcceptedTransactions: rawData.filter((t: any) => t.cfStatus === 2 || t.cfStatus === 3).length,
              dgiiRejectedTransactions: rawData.filter((t: any) => t.cfStatus === 4).length,
              dgiiPendingTransactions: rawData.filter((t: any) => !t.cfStatus || t.cfStatus === 0 || t.cfStatus === 1 || t.cfStatus === 5 || t.cfStatus === 6 || t.cfStatus === 7 || t.cfStatus === 8).length
            }
          };
        } else {
          console.error('❌ Formato de respuesta inesperado:', rawData);
          throw new Error('Formato de respuesta inesperado de la API');
        }
      } else {
        console.error('❌ rawData no es un objeto:', rawData);
        throw new Error('Formato de respuesta inesperado de la API');
      }
      
      console.log('✅ Respuesta parseada:', apiResponse);
      console.log('📄 Paginación:', apiResponse.pagination);
      console.log('📊 Estadísticas:', apiResponse.statistics);
      
      return apiResponse;
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

  /**
   * Obtiene un resumen de ventas y retornos desde una fecha específica
   */
  async getSalesAndReturnsSummary(startDate: string, siteId?: string): Promise<ISalesAndReturnsSummary> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', toSantoDomingoStartOfDay(startDate));
      if (siteId) queryParams.append('siteId', siteId);

      const url = buildApiUrl(`trans/dashboard/sales-returns-summary?${queryParams.toString()}`);
      const response = await apiGet<ISalesAndReturnsSummary>(url);

      if (!response.successful) {
        throw new Error(response.error || 'Error al obtener resumen de ventas y retornos');
      }

      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen de ventas y retornos:', error);
      throw error;
    }
  }

  /**
   * Obtiene las ventas diarias agrupadas por día desde una fecha específica
   */
  async getDailySales(startDate: string, siteId?: string): Promise<IDailySales[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', toSantoDomingoStartOfDay(startDate));
      if (siteId) queryParams.append('siteId', siteId);

      const url = buildApiUrl(`trans/dashboard/daily-sales?${queryParams.toString()}`);
      const response = await apiGet<IDailySales[]>(url);

      if (!response.successful) {
        throw new Error(response.error || 'Error al obtener ventas diarias');
      }

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener ventas diarias:', error);
      throw error;
    }
  }

  /**
   * Obtiene las transacciones más recientes ordenadas por fecha y número de transacción
   */
  async getTopTransactions(startDate: string, limit: number = 4, siteId?: string): Promise<ITopTransaction[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', toSantoDomingoStartOfDay(startDate));
      queryParams.append('limit', limit.toString());
      if (siteId) queryParams.append('siteId', siteId);

      const url = buildApiUrl(`trans/dashboard/top-transactions?${queryParams.toString()}`);
      const response = await apiGet<ITopTransaction[]>(url);

      if (!response.successful) {
        throw new Error(response.error || 'Error al obtener top transacciones');
      }

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener top transacciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene los productos más vendidos ordenados por monto total vendido
   */
  async getTopProducts(startDate: string, categoryId?: string, limit: number = 5, siteId?: string): Promise<ITopProduct[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', toSantoDomingoStartOfDay(startDate));
      queryParams.append('limit', limit.toString());

      if (categoryId) {
        queryParams.append('categoryId', categoryId);
      }
      if (siteId) queryParams.append('siteId', siteId);

      const url = buildApiUrl(`trans/dashboard/top-products?${queryParams.toString()}`);
      const response = await apiGet<ITopProduct[]>(url);

      if (!response.successful) {
        throw new Error(response.error || 'Error al obtener top productos');
      }

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener top productos:', error);
      throw error;
    }
  }

  /**
   * Obtiene las ventas agrupadas por sucursal ordenadas por monto total descendente
   */
  async getSalesBySite(startDate: string, siteId?: string): Promise<ISalesBySite[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('startDate', toSantoDomingoStartOfDay(startDate));
      if (siteId) queryParams.append('siteId', siteId);

      const url = buildApiUrl(`trans/dashboard/sales-by-site?${queryParams.toString()}`);
      const response = await apiGet<ISalesBySite[]>(url);

      if (!response.successful) {
        throw new Error(response.error || 'Error al obtener ventas por sucursal');
      }

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener ventas por sucursal:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const transactionService = new TransactionService();
export default transactionService;
