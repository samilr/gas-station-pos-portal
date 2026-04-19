import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiInterceptor';

export interface DataphoneTerminal {
  dataphoneId: number;
  siteId: string;
  terminalId: number;
  dataphoneIp: string;
  terminalIp: string;
  closingManually: boolean;
  active: boolean;
}

export interface CreateDataphoneTerminalRequest {
  dataphoneId: number;
  siteId: string;
  terminalId: number;
  dataphoneIp: string;
  terminalIp: string;
  closingManually: boolean;
  active: boolean;
}

export type UpdateDataphoneTerminalRequest = Partial<Omit<CreateDataphoneTerminalRequest, 'dataphoneId' | 'siteId' | 'terminalId'>>;

export interface ListResponse {
  successful: boolean;
  data: DataphoneTerminal[];
  error?: string;
}
export interface ItemResponse {
  successful: boolean;
  data: DataphoneTerminal | null;
  error?: string;
}

export interface CompositeKey {
  dataphoneId: number;
  siteId: string;
  terminalId: number;
}

const toPath = (k: CompositeKey) =>
  `dataphone-terminals/${k.dataphoneId}/${encodeURIComponent(k.siteId)}/${k.terminalId}`;

class DataphoneTerminalService {
  async list(filters?: { siteId?: string }): Promise<ListResponse> {
    const qs = new URLSearchParams();
    if (filters?.siteId) qs.append('siteId', filters.siteId);
    const query = qs.toString();
    const url = buildApiUrl(`dataphone-terminals${query ? `?${query}` : ''}`);
    const res = await apiGet<any>(url);
    const raw = res.data;
    const items: DataphoneTerminal[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data) ? raw.data : [];
    return { successful: res.successful, data: items, error: res.error };
  }

  async getByKey(key: CompositeKey): Promise<ItemResponse> {
    const res = await apiGet<DataphoneTerminal>(buildApiUrl(toPath(key)));
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async create(payload: CreateDataphoneTerminalRequest): Promise<ItemResponse> {
    const res = await apiPost<DataphoneTerminal>(buildApiUrl('dataphone-terminals'), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async update(key: CompositeKey, payload: UpdateDataphoneTerminalRequest): Promise<ItemResponse> {
    const res = await apiPut<DataphoneTerminal>(buildApiUrl(toPath(key)), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async remove(key: CompositeKey): Promise<{ successful: boolean; error?: string }> {
    const res = await apiDelete(buildApiUrl(toPath(key)));
    return { successful: res.successful, error: res.error };
  }
}

const dataphoneTerminalService = new DataphoneTerminalService();
export default dataphoneTerminalService;
