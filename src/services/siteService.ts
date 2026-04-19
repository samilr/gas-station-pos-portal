import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { ISite, ICreateSiteDto, IUpdateSiteDto } from '../types/site';

export interface SiteApiResponse<T> {
  successful: boolean;
  data: T;
  error?: string;
}

export const siteService = {
  async getAllSites(): Promise<SiteApiResponse<ISite[]>> {
    const res = await apiGet<any>(buildApiUrl('sites/all'));
    const raw = res.data;
    const items: ISite[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data) ? raw.data : [];
    return { successful: res.successful, data: items, error: res.error };
  },

  async createSite(siteData: ICreateSiteDto): Promise<SiteApiResponse<ISite>> {
    return await apiPost<ISite>(buildApiUrl('sites'), siteData);
  },

  async updateSite(siteId: string, siteData: IUpdateSiteDto): Promise<SiteApiResponse<ISite>> {
    return await apiPut<ISite>(buildApiUrl(`sites/${siteId}`), siteData);
  },

  async deleteSite(siteId: string): Promise<SiteApiResponse<boolean>> {
    return await apiDelete<boolean>(buildApiUrl(`sites/${siteId}`));
  }
};
