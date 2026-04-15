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

// ============================================================
// Dashboard de combustible
// ============================================================

export interface FuelDashboardFilters {
  startDate?: string;
  endDate?: string;
  siteId?: string | null;
  excludeOffline?: boolean;
}

export interface FuelSummary {
  txCount: number;
  totalVolume: number;
  totalAmount: number;
  avgTicket: number;
  uniquePumps: number;
  uniqueSites: number;
}

export interface FuelDailyTrendRow {
  date: string;
  txCount: number;
  volume: number;
  amount: number;
}

export interface FuelByPumpRow {
  pump: number;
  txCount: number;
  volume: number;
  amount: number;
}

export interface FuelByFuelGradeRow {
  fuelGradeId: number;
  fuelGradeName: string;
  txCount: number;
  volume: number;
  amount: number;
}

export interface FuelHourlyRow {
  hour: number;
  txCount: number;
  volume: number;
  amount: number;
}

export interface FuelBySiteRow {
  siteId: string;
  txCount: number;
  volume: number;
  amount: number;
}

export interface FuelTopTransactionRow {
  transactionId: number;
  pump: number;
  nozzle: number;
  fuelGradeName: string;
  volume: number;
  amount: number;
  price: number;
  transactionDate: string;
  siteId: string | null;
  ptsId: string | null;
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

  // ============================================================
  // Dashboard endpoints
  // ============================================================

  private async fetchDashboard<T>(
    path: string,
    filters?: FuelDashboardFilters,
    extra?: Record<string, string | number | undefined>,
  ): Promise<T> {
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
    const query = qs.toString();
    const url = buildApiUrl(`fuel-transactions/dashboard/${path}${query ? `?${query}` : ''}`);
    const res = await apiGet<any>(url);
    if (!res.successful) throw new Error(res.error || `Error al obtener ${path}`);
    // El backend envuelve: { successful, filters, data }
    const body = res.data;
    return (body?.data ?? body) as T;
  }

  async getDashboardSummary(filters?: FuelDashboardFilters): Promise<FuelSummary> {
    return this.fetchDashboard<FuelSummary>('summary', filters);
  }

  async getDashboardDailyTrend(filters?: FuelDashboardFilters): Promise<FuelDailyTrendRow[]> {
    return this.fetchDashboard<FuelDailyTrendRow[]>('daily-trend', filters);
  }

  async getDashboardBySite(filters?: FuelDashboardFilters): Promise<FuelBySiteRow[]> {
    return this.fetchDashboard<FuelBySiteRow[]>('by-site', filters);
  }

  async getDashboardByPump(filters?: FuelDashboardFilters): Promise<FuelByPumpRow[]> {
    return this.fetchDashboard<FuelByPumpRow[]>('by-pump', filters);
  }

  async getDashboardByFuelGrade(filters?: FuelDashboardFilters): Promise<FuelByFuelGradeRow[]> {
    return this.fetchDashboard<FuelByFuelGradeRow[]>('by-fuel-grade', filters);
  }

  async getDashboardHourly(filters?: FuelDashboardFilters): Promise<FuelHourlyRow[]> {
    return this.fetchDashboard<FuelHourlyRow[]>('hourly', filters);
  }

  async getDashboardTopTransactions(
    filters?: FuelDashboardFilters,
    limit: number = 20,
  ): Promise<FuelTopTransactionRow[]> {
    return this.fetchDashboard<FuelTopTransactionRow[]>('top-transactions', filters, { limit });
  }
}

const fuelTransactionService = new FuelTransactionService();
export default fuelTransactionService;

