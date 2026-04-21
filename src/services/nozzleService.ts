import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiInterceptor';

export interface Nozzle {
  nozzleId: number;
  dispenserId: number;
  nozzleNumber: number;
  productId: string;
  productName: string | null;
  price: number;
  tankNumber: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateNozzleRequest {
  dispenserId: number;
  nozzleNumber: number;
  productId: string;
  tankNumber?: number | null;
}

export interface UpdateNozzleRequest {
  productId?: string;
  tankNumber?: number | null;
  unassignTank?: boolean;
  active?: boolean;
}

export interface NozzleListResponse {
  successful: boolean;
  data: Nozzle[];
  error?: string;
}

export interface NozzleItemResponse {
  successful: boolean;
  data: Nozzle | null;
  error?: string;
}

class NozzleService {
  async list(filters?: { dispenserId?: number; productId?: string }): Promise<NozzleListResponse> {
    const qs = new URLSearchParams();
    if (filters?.dispenserId != null) qs.append('dispenserId', String(filters.dispenserId));
    if (filters?.productId) qs.append('productId', filters.productId);
    const query = qs.toString();
    const url = buildApiUrl(`nozzles${query ? `?${query}` : ''}`);
    const res = await apiGet<any>(url);
    return {
      successful: res.successful,
      data: Array.isArray(res.data) ? res.data : [],
      error: res.error,
    };
  }

  async getById(id: number): Promise<NozzleItemResponse> {
    const res = await apiGet<Nozzle>(buildApiUrl(`nozzles/${id}`));
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async create(payload: CreateNozzleRequest): Promise<NozzleItemResponse> {
    const res = await apiPost<Nozzle>(buildApiUrl('nozzles'), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async update(id: number, payload: UpdateNozzleRequest): Promise<NozzleItemResponse> {
    const res = await apiPut<Nozzle>(buildApiUrl(`nozzles/${id}`), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async remove(id: number): Promise<{ successful: boolean; error?: string }> {
    const res = await apiDelete(buildApiUrl(`nozzles/${id}`));
    return { successful: res.successful, error: res.error };
  }
}

const nozzleService = new NozzleService();
export default nozzleService;
