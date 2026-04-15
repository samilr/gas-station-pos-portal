import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiInterceptor';

export interface DataphoneSupplier {
  dataphoneSupplierId: number;
  name: string;
  comment: string | null;
  posRequestPort: number;
  dataphoneResponsePort: number;
  transTimeout: number;
  active: boolean;
}

export interface CreateDataphoneSupplierRequest {
  dataphoneSupplierId: number;
  name: string;
  comment?: string | null;
  posRequestPort: number;
  dataphoneResponsePort: number;
  transTimeout: number;
  active: boolean;
}

export type UpdateDataphoneSupplierRequest = Partial<Omit<CreateDataphoneSupplierRequest, 'dataphoneSupplierId'>>;

export interface ListResponse {
  successful: boolean;
  data: DataphoneSupplier[];
  error?: string;
}

export interface ItemResponse {
  successful: boolean;
  data: DataphoneSupplier | null;
  error?: string;
}

class DataphoneSupplierService {
  async list(): Promise<ListResponse> {
    const res = await apiGet<any>(buildApiUrl('dataphone-suppliers'));
    return { successful: res.successful, data: Array.isArray(res.data) ? res.data : [], error: res.error };
  }

  async getById(id: number): Promise<ItemResponse> {
    const res = await apiGet<DataphoneSupplier>(buildApiUrl(`dataphone-suppliers/${id}`));
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async create(payload: CreateDataphoneSupplierRequest): Promise<ItemResponse> {
    const res = await apiPost<DataphoneSupplier>(buildApiUrl('dataphone-suppliers'), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async update(id: number, payload: UpdateDataphoneSupplierRequest): Promise<ItemResponse> {
    const res = await apiPut<DataphoneSupplier>(buildApiUrl(`dataphone-suppliers/${id}`), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async remove(id: number): Promise<{ successful: boolean; error?: string }> {
    const res = await apiDelete(buildApiUrl(`dataphone-suppliers/${id}`));
    return { successful: res.successful, error: res.error };
  }
}

const dataphoneSupplierService = new DataphoneSupplierService();
export default dataphoneSupplierService;
