import { buildApiUrl } from '../config/api';
import { apiGet, apiPut, apiDelete } from './apiInterceptor';

export interface FuelTransaction {
  transactionId: number;
  pump: number;
  nozzle: number;
  hardwareTransactionId: number;
  volume: number;
  amount: number;
  price: number;
  totalVolume: number;
  totalAmount: number;
  transactionDate: string;
  transactionDateStart: string;
  tag: string | null;
  ptsId: string;
  fuelGradeId: number;
  fuelGradeName: string;
  tank: number;
  userId: number;
  tcVolume: number;
  flowRate: number;
  isOffline: boolean;
  pumpTransactionsUploaded: number;
  pumpTransactionsTotal: number;
  configurationId: string;
  createdAt: string;
}

export interface FuelTransactionsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FuelTransactionsResponse {
  successful: boolean;
  data: FuelTransaction[];
  pagination?: FuelTransactionsPagination;
  error?: string;
}

class FuelTransactionService {
  /**
   * Obtiene las transacciones de combustible con filtros opcionales
   */
  async getFuelTransactions(params?: {
    pump?: number;
    nozzle?: number;
    fuelGradeId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<FuelTransactionsResponse> {
    try {
      let url = buildApiUrl('fuel-transactions');
      
      if (params) {
        const queryParams = new URLSearchParams();
        
        if (params.pump !== undefined) queryParams.append('pump', params.pump.toString());
        if (params.nozzle !== undefined) queryParams.append('nozzle', params.nozzle.toString());
        if (params.fuelGradeId !== undefined) queryParams.append('fuelGradeId', params.fuelGradeId.toString());
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.page !== undefined) queryParams.append('page', params.page.toString());
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await apiGet<any>(url);

      let pagination: FuelTransactionsPagination | undefined;
      let data: FuelTransaction[] = [];

      if (response.successful) {
        // El interceptor devuelve el body completo cuando detecta `pagination`
        // Estructura: { data: [...], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }
        const body = response.data;
        data = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
        if (body?.pagination) {
          pagination = body.pagination;
        }
      }

      return {
        successful: response.successful,
        data: data,
        pagination: pagination,
        error: response.error
      };
    } catch (error) {
      console.error('Error al obtener transacciones de combustible:', error);
      return {
        successful: false,
        data: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
  async getRecentFuelTransactions(): Promise<FuelTransactionsResponse> {
    try {
      const response = await apiGet<any>(buildApiUrl('fuel-transactions'));
      return {
        successful: response.successful,
        data: Array.isArray(response.data) ? response.data : [],
        error: response.error,
      };
    } catch (error) {
      return { successful: false, data: [], error: 'Error de conexión' };
    }
  }

  async getFuelTransactionById(id: number): Promise<{ successful: boolean; data: FuelTransaction | null; error?: string }> {
    const response = await apiGet<FuelTransaction>(buildApiUrl(`fuel-transactions/${id}`));
    return { successful: response.successful, data: response.data || null, error: response.error };
  }

  async updateFuelTransaction(id: number, data: Partial<FuelTransaction>): Promise<{ successful: boolean; error?: string }> {
    const response = await apiPut(buildApiUrl(`fuel-transactions/${id}`), data);
    return { successful: response.successful, error: response.error };
  }

  async deleteFuelTransaction(id: number): Promise<{ successful: boolean; error?: string }> {
    const response = await apiDelete(buildApiUrl(`fuel-transactions/${id}`));
    return { successful: response.successful, error: response.error };
  }
}

const fuelTransactionService = new FuelTransactionService();
export default fuelTransactionService;

