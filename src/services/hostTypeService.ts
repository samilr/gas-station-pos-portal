import { buildApiUrl } from "../config/api";
import { apiGet, apiPost, apiPut, ApiResponse } from "./apiInterceptor";

export interface IHostType {
  hostTypeId: number;
  name: string;
  description?: string;
  active: boolean;
  code?: string;
  hasPrinter?: boolean;
}

interface CreateHostTypeRequest {
  name: string;
  description?: string;
  active: boolean;
  code?: string;
  hasPrinter?: boolean;
}

interface UpdateHostTypeRequest {
  name?: string;
  description?: string;
  active?: boolean;
  code?: string;
  hasPrinter?: boolean;
}

export const hostTypeService = {
  async getHostTypes(): Promise<ApiResponse<IHostType[]>> {
    return await apiGet<IHostType[]>(buildApiUrl('host-types'));
  },

  async getHostType(id: number): Promise<ApiResponse<IHostType>> {
    return await apiGet<IHostType>(buildApiUrl(`host-types/${id}`));
  },

  async createHostType(data: CreateHostTypeRequest): Promise<ApiResponse<IHostType>> {
    return await apiPost<IHostType>(buildApiUrl('host-types'), data);
  },

  async updateHostType(id: number, data: UpdateHostTypeRequest): Promise<ApiResponse<IHostType>> {
    return await apiPut<IHostType>(buildApiUrl(`host-types/${id}`), data);
  },
};
