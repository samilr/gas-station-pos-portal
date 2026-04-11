import { buildApiUrl } from '../config/api';
import { apiGet } from './apiInterceptor';

export interface FuelTransaction {
  transaction_id: number;
  trans_number: string | null;
  pump: number;
  nozzle: number;
  hardware_transaction_id: number;
  volume: number;
  amount: number;
  price: number;
  total_volume: number;
  total_amount: number;
  transaction_date: string;
  tag: string | null;
  pts_id: string;
  fuel_grade_id: number;
  fuel_grade_name: string;
  product_name: string;
  tank: number;
  user_id: number;
  transaction_date_start: string;
  tc_volume: number;
  flow_rate: number;
  is_offline: boolean;
  pump_transactions_uploaded: number;
  pump_transactions_total: number;
  configuration_id: string;
  created_at: string;
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
      let url = buildApiUrl('pts-controllers/pump-transactions');
      
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
      
      // Si la respuesta tiene paginación, extraerla
      let pagination: FuelTransactionsPagination | undefined;
      let data: FuelTransaction[] = [];
      
      if (response.successful) {
        if (response.data && Array.isArray(response.data)) {
          // Si es un array directo
          data = response.data;
        } else if (response.data && response.data.data) {
          // Si tiene estructura { data: [], pagination: {} }
          data = response.data.data || [];
          if (response.data.pagination) {
            pagination = response.data.pagination;
          }
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
}

const fuelTransactionService = new FuelTransactionService();
export default fuelTransactionService;

