import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { IAppConfig, ICreateAppConfigDto, IUpdateAppConfigDto } from '../types/appConfig';

export const appConfigService = {
  async getAppConfig(): Promise<ApiResponse<IAppConfig>> {
    return apiGet<IAppConfig>(buildApiUrl('app-config'));
  },
  async createAppConfig(data: ICreateAppConfigDto): Promise<ApiResponse<IAppConfig>> {
    return apiPost<IAppConfig>(buildApiUrl('app-config'), data);
  },
  async updateAppConfig(id: number, data: IUpdateAppConfigDto): Promise<ApiResponse<IAppConfig>> {
    return apiPut<IAppConfig>(buildApiUrl(`app-config/${id}`), data);
  },
  async deleteAppConfig(id: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`app-config/${id}`));
  },
};
