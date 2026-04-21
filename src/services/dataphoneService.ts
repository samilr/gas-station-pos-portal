import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiInterceptor';

export interface Dataphone {
  dataphoneId: number;
  name: string;
  siteId: string;
  dataphoneSupplierId: number;
  dataphoneIpAddress: string;
  dataphoneResponsePort: number;
  terminalRequestPort: number;
  transTimeout: number;
  comment: string | null;
  active: boolean;
}

export interface CreateDataphoneRequest {
  dataphoneId: number;
  name: string;
  siteId: string;
  dataphoneSupplierId: number;
  dataphoneIpAddress: string;
  dataphoneResponsePort: number;
  terminalRequestPort: number;
  transTimeout: number;
  comment?: string | null;
  active: boolean;
}

export type UpdateDataphoneRequest = Partial<Omit<CreateDataphoneRequest, 'dataphoneId'>>;

export interface ListResponse {
  successful: boolean;
  data: Dataphone[];
  error?: string;
}
export interface ItemResponse {
  successful: boolean;
  data: Dataphone | null;
  error?: string;
}

export interface TestConnectionRequest {
  siteId: string;
  terminalId: number;
  amountCents?: number;
}

export interface CardPaymentResult {
  approved: boolean;
  authorizationNumber: string | null;
  reference: number | null;
  retrievalReference: number | null;
  host: number | null;
  batch: number | null;
  cardProduct: string | null;
  maskedPan: string | null;
  holderName: string | null;
  terminalId: string | null;
  merchantId: string | null;
  transactionDateTime: string | null;
  messages: string[];
  rawRequest: string | null;
  rawResponse: string | null;
}

export interface TestConnectionResponse {
  successful: boolean;
  data: CardPaymentResult | null;
  error?: string;
}

class DataphoneService {
  async list(filters?: { siteId?: string }): Promise<ListResponse> {
    const qs = new URLSearchParams();
    if (filters?.siteId) qs.append('siteId', filters.siteId);
    const query = qs.toString();
    const url = buildApiUrl(`dataphones${query ? `?${query}` : ''}`);
    const res = await apiGet<any>(url);
    const raw = res.data;
    const items: Dataphone[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data) ? raw.data : [];
    return { successful: res.successful, data: items, error: res.error };
  }

  async getById(id: number): Promise<ItemResponse> {
    const res = await apiGet<Dataphone>(buildApiUrl(`dataphones/${id}`));
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async create(payload: CreateDataphoneRequest): Promise<ItemResponse> {
    const res = await apiPost<Dataphone>(buildApiUrl('dataphones'), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async update(id: number, payload: UpdateDataphoneRequest): Promise<ItemResponse> {
    const res = await apiPut<Dataphone>(buildApiUrl(`dataphones/${id}`), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async remove(id: number): Promise<{ successful: boolean; error?: string }> {
    const res = await apiDelete(buildApiUrl(`dataphones/${id}`));
    return { successful: res.successful, error: res.error };
  }

  async testConnection(id: number, payload: TestConnectionRequest): Promise<TestConnectionResponse> {
    const res = await apiPost<CardPaymentResult>(buildApiUrl(`dataphones/${id}/test-connection`), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }
}

const dataphoneService = new DataphoneService();
export default dataphoneService;
