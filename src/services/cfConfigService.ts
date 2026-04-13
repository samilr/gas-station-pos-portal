import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { ICfConfig, IUpdateCfConfigDto } from '../types/cfConfig';

export const cfConfigService = {
  async getCfConfig(): Promise<ApiResponse<ICfConfig>> {
    return apiGet<ICfConfig>(buildApiUrl('cf-config'));
  },
  async createCfConfig(data: Partial<ICfConfig>): Promise<ApiResponse<ICfConfig>> {
    return apiPost<ICfConfig>(buildApiUrl('cf-config'), data);
  },
  async updateCfConfig(data: IUpdateCfConfigDto): Promise<ApiResponse<ICfConfig>> {
    return apiPut<ICfConfig>(buildApiUrl('cf-config'), data);
  },
  async deleteCfConfig(companyId: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`cf-config/${companyId}`));
  },
};
