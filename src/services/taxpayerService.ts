import { buildApiUrl } from '../config/api';
import { apiRequest, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { ITaxpayer, ITaxpayerListResponse, ICreateTaxpayerDto, IUpdateTaxpayerDto } from '../types/taxpayer';

export const taxpayerService = {
  async getTaxpayers(page = 1, limit = 50, search = ''): Promise<ITaxpayerListResponse> {
    let url = `taxpayer?page=${page}&limit=${limit}`;
    if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

    const response = await apiRequest<any>(buildApiUrl(url), { method: 'GET' });
    if (!response.successful) {
      return { successful: false, data: [], total: 0, totalPages: 0, hasNext: false, hasPrev: false, page, limit };
    }

    // El interceptor devuelve el body completo cuando detecta `pagination`
    const body = response.data;
    const pagination = body.pagination || {};
    return {
      successful: true,
      data: Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []),
      total: pagination.total || 0,
      totalPages: pagination.totalPages || 0,
      hasNext: pagination.hasNext ?? false,
      hasPrev: pagination.hasPrev ?? false,
      page: pagination.page || page,
      limit: pagination.limit || limit,
    };
  },

  async getTaxpayerById(taxpayerId: string): Promise<ApiResponse<ITaxpayer>> {
    return apiRequest<ITaxpayer>(buildApiUrl(`taxpayer/${taxpayerId}`), { method: 'GET' });
  },

  async createTaxpayer(data: ICreateTaxpayerDto): Promise<ApiResponse<ITaxpayer>> {
    return apiPost<ITaxpayer>(buildApiUrl('taxpayer'), data);
  },

  async updateTaxpayer(taxpayerId: string, data: IUpdateTaxpayerDto): Promise<ApiResponse<ITaxpayer>> {
    return apiPut<ITaxpayer>(buildApiUrl(`taxpayer/${taxpayerId}`), data);
  },

  async deleteTaxpayer(taxpayerId: string): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`taxpayer/${taxpayerId}`));
  },

  async importFromDGII(): Promise<ApiResponse<any>> {
    return apiPost(buildApiUrl('taxpayer/updateTaxpayerFromDGII'));
  },
};
