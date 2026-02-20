import { buildApiUrl } from "../config/api";
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from "./apiInterceptor";

interface HostResponse {
  successful: boolean;
  data: IHost[];
}

interface CreateHostRequest {
  hostId: number;
  name: string;
  description?: string;
  ipAddress?: string;
  siteId?: string;
  deviceId?: string;
  connected: boolean;
  connectedLastTime?: Date;
  connectedLastUserId?: number;
  active: boolean;
  hostTypeId?: number;
}

interface UpdateHostRequest {
  hostId?: number;
  name?: string;
  description?: string;
  ipAddress?: string;
  siteId?: string;
  deviceId?: string;
  connected?: boolean;
  connectedLastTime?: Date;
  connectedLastUserId?: number;
  active?: boolean;
  hostTypeId?: number;
}

export interface IHost {
  host_id: number;
  name: string;
  description?: string;
  ip_address?: string;
  site_id?: string;
  device_id?: string;
  connected: boolean;
  connected_last_time?: Date;
  connected_last_user_id?: number;
  active: boolean;
  host_type_id?: number;
}

export const hostService = {
  async getHosts(): Promise<HostResponse> {
    const response = await apiGet<IHost[]>(buildApiUrl('hosts'));
    return {
      successful: response.successful,
      data: response.data || []
    };
  },

  async createHost(hostData: CreateHostRequest): Promise<ApiResponse<IHost[]>> {
    return await apiPost<IHost[]>(buildApiUrl('hosts'), hostData);
  },

  async updateHost(hostId: number, hostData: UpdateHostRequest): Promise<ApiResponse<IHost[]>> {
    return await apiPut<IHost[]>(buildApiUrl(`hosts/${hostId}`), hostData);
  },

  async deleteHost(hostId: number): Promise<ApiResponse<IHost[]>> {
    return await apiDelete<IHost[]>(buildApiUrl(`hosts/${hostId}`));
  }
};

// Alias para compatibilidad
export interface IDevice extends IHost {}

