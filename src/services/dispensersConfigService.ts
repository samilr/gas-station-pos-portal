import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiInterceptor';

export type ConnectionType = 'TCP' | 'SERIAL' | 'RS485' | 'RS422';
export type Parity = 'None' | 'Even' | 'Odd';
export type StopBits = '1' | '1.5' | '2';

export interface Dispenser {
  dispenserId: number;
  siteId: string;
  ptsId: string | null;
  pumpNumber: number;
  nozzlesCount: number;
  name: string | null;
  active: boolean;

  brand: string | null;
  model: string | null;
  serialNumber: string | null;

  connectionType: ConnectionType;
  ipAddress: string | null;
  tcpPort: number | null;
  serialPort: string | null;
  baudRate: number | null;
  dataBits: number | null;
  parity: Parity | null;
  stopBits: StopBits | null;

  protocol: string | null;
  protocolVersion: string | null;
  busAddress: number | null;
  timeoutMs: number;

  createdAt: string;
  updatedAt: string | null;
}

export interface CreateDispenserRequest {
  siteId: string;
  pumpNumber: number;
  ptsId?: string | null;
  nozzlesCount: number;
  name?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  connectionType: ConnectionType;
  ipAddress?: string | null;
  tcpPort?: number | null;
  serialPort?: string | null;
  baudRate?: number | null;
  dataBits?: number | null;
  parity?: Parity | null;
  stopBits?: StopBits | null;
  protocol?: string | null;
  protocolVersion?: string | null;
  busAddress?: number | null;
  timeoutMs: number;
}

export type UpdateDispenserRequest = Partial<Omit<CreateDispenserRequest, 'siteId' | 'pumpNumber'>> & {
  active?: boolean | null;
};

export interface DispenserListResponse {
  successful: boolean;
  data: Dispenser[];
  error?: string;
}

export interface DispenserItemResponse {
  successful: boolean;
  data: Dispenser | null;
  error?: string;
}

class DispensersConfigService {
  async list(filters?: { siteId?: string; ptsId?: string }): Promise<DispenserListResponse> {
    const qs = new URLSearchParams();
    if (filters?.siteId) qs.append('siteId', filters.siteId);
    if (filters?.ptsId) qs.append('ptsId', filters.ptsId);
    const query = qs.toString();
    const url = buildApiUrl(`dispensers-config${query ? `?${query}` : ''}`);
    const res = await apiGet<any>(url);
    return {
      successful: res.successful,
      data: Array.isArray(res.data) ? res.data : [],
      error: res.error,
    };
  }

  async getById(id: number): Promise<DispenserItemResponse> {
    const res = await apiGet<Dispenser>(buildApiUrl(`dispensers-config/${id}`));
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async create(payload: CreateDispenserRequest): Promise<DispenserItemResponse> {
    const res = await apiPost<Dispenser>(buildApiUrl('dispensers-config'), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async update(id: number, payload: UpdateDispenserRequest): Promise<DispenserItemResponse> {
    const res = await apiPut<Dispenser>(buildApiUrl(`dispensers-config/${id}`), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async remove(id: number): Promise<{ successful: boolean; error?: string }> {
    const res = await apiDelete(buildApiUrl(`dispensers-config/${id}`));
    return { successful: res.successful, error: res.error };
  }
}

const dispensersConfigService = new DispensersConfigService();
export default dispensersConfigService;
