import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiInterceptor';
import { Dispenser } from './dispensersConfigService';

export interface FuelIslandTerminalSummary {
  siteId: string;
  terminalId: number;
  name: string;
  active: boolean;
}

export interface FuelIsland {
  fuelIslandId: number;
  siteId: string;
  name: string;
  active: boolean;
  dispensers?: Dispenser[];
  terminals?: FuelIslandTerminalSummary[];
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateFuelIslandRequest {
  siteId: string;
  name: string;
  dispenserIds?: number[];
}

export interface UpdateFuelIslandRequest {
  name?: string;
  active?: boolean;
}

export interface AssignDispensersRequest {
  dispenserIds: number[];
}

export interface FuelIslandListResponse {
  successful: boolean;
  data: FuelIsland[];
  error?: string;
}

export interface FuelIslandItemResponse {
  successful: boolean;
  data: FuelIsland | null;
  error?: string;
}

export interface UnassignedDispensersResponse {
  successful: boolean;
  data: Dispenser[];
  error?: string;
}

class FuelIslandService {
  async list(filters?: { siteId?: string }): Promise<FuelIslandListResponse> {
    const qs = new URLSearchParams();
    if (filters?.siteId) qs.append('siteId', filters.siteId);
    const query = qs.toString();
    const url = buildApiUrl(`fuel-islands${query ? `?${query}` : ''}`);
    const res = await apiGet<any>(url);
    return {
      successful: res.successful,
      data: Array.isArray(res.data) ? res.data : [],
      error: res.error,
    };
  }

  async getById(id: number): Promise<FuelIslandItemResponse> {
    const res = await apiGet<FuelIsland>(buildApiUrl(`fuel-islands/${id}`));
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async getUnassignedDispensers(siteId?: string): Promise<UnassignedDispensersResponse> {
    const qs = new URLSearchParams();
    if (siteId) qs.append('siteId', siteId);
    const query = qs.toString();
    const url = buildApiUrl(`fuel-islands/unassigned-dispensers${query ? `?${query}` : ''}`);
    const res = await apiGet<any>(url);
    return {
      successful: res.successful,
      data: Array.isArray(res.data) ? res.data : [],
      error: res.error,
    };
  }

  async create(payload: CreateFuelIslandRequest): Promise<FuelIslandItemResponse> {
    const res = await apiPost<FuelIsland>(buildApiUrl('fuel-islands'), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async update(id: number, payload: UpdateFuelIslandRequest): Promise<FuelIslandItemResponse> {
    const res = await apiPut<FuelIsland>(buildApiUrl(`fuel-islands/${id}`), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async remove(id: number): Promise<{ successful: boolean; error?: string }> {
    const res = await apiDelete(buildApiUrl(`fuel-islands/${id}`));
    return { successful: res.successful, error: res.error };
  }

  async assignDispensers(id: number, dispenserIds: number[]): Promise<{ successful: boolean; error?: string }> {
    const res = await apiPost(buildApiUrl(`fuel-islands/${id}/dispensers`), { dispenserIds });
    return { successful: res.successful, error: res.error };
  }

  async unassignDispenser(islandId: number, dispenserId: number): Promise<{ successful: boolean; error?: string }> {
    const res = await apiDelete(buildApiUrl(`fuel-islands/${islandId}/dispensers/${dispenserId}`));
    return { successful: res.successful, error: res.error };
  }
}

const fuelIslandService = new FuelIslandService();
export default fuelIslandService;
