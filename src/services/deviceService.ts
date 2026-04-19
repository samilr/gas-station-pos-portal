import { buildApiUrl } from "../config/api";
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from "./apiInterceptor";

interface HostResponse {
  successful: boolean;
  data: IHost[];
}

interface CreateHostRequest {
  name: string;
  description?: string;
  ipAddress?: string;
  siteId?: string;
  deviceId?: string;
  active: boolean;
  hostTypeId?: number;
}

interface UpdateHostRequest {
  name?: string;
  description?: string;
  ipAddress?: string;
  siteId?: string;
  deviceId?: string;
  active?: boolean;
  hostTypeId?: number;
}

export interface IHost {
  hostId: number;
  name: string;
  description?: string;
  ipAddress?: string;
  siteId?: string;
  deviceId?: string;
  connected: boolean;
  connectedLastTime?: string | Date;
  connectedLastUserId?: number;
  active: boolean;
  hostTypeId?: number;
  hostTypeName?: string;
  hostTypeDescription?: string;
  hostTypeCode?: string;
  hasPrinter?: boolean;
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

