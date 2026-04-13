import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { IStaft, ICreateStaftDto, IUpdateStaftDto } from '../types/staft';

export const staftService = {
  async getStaftByPista(siteId: string): Promise<ApiResponse<IStaft[]>> {
    return apiGet<IStaft[]>(buildApiUrl(`staft/pista?siteId=${siteId}`));
  },
  async getStaftAdmin(): Promise<ApiResponse<IStaft[]>> {
    return apiGet<IStaft[]>(buildApiUrl('staft/admin'));
  },
  async createStaft(data: ICreateStaftDto): Promise<ApiResponse<IStaft>> {
    return apiPost<IStaft>(buildApiUrl('staft'), data);
  },
  async updateStaft(staftId: number, data: IUpdateStaftDto): Promise<ApiResponse<IStaft>> {
    return apiPut<IStaft>(buildApiUrl(`staft/${staftId}`), data);
  },
  async deleteStaft(staftId: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`staft/${staftId}`));
  },
};
