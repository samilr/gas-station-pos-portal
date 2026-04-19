import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { IStaftGroup, ICreateStaftGroupDto, IUpdateStaftGroupDto } from '../types/staftGroup';

export const staftGroupService = {
  async getStaftGroups(): Promise<ApiResponse<IStaftGroup[]>> {
    const res = await apiGet<any>(buildApiUrl('staft-groups'));
    const raw = res.data;
    const items: IStaftGroup[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data) ? raw.data : [];
    return { successful: res.successful, data: items, error: res.error };
  },
  async getStaftGroupById(id: number): Promise<ApiResponse<IStaftGroup>> {
    return apiGet<IStaftGroup>(buildApiUrl(`staft-groups/${id}`));
  },
  async createStaftGroup(data: ICreateStaftGroupDto): Promise<ApiResponse<IStaftGroup>> {
    return apiPost<IStaftGroup>(buildApiUrl('staft-groups'), data);
  },
  async updateStaftGroup(id: number, data: IUpdateStaftGroupDto): Promise<ApiResponse<IStaftGroup>> {
    return apiPut<IStaftGroup>(buildApiUrl(`staft-groups/${id}`), data);
  },
  async deleteStaftGroup(id: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`staft-groups/${id}`));
  },
};
