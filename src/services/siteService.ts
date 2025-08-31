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
    return await apiGet<ISite[]>(buildApiUrl('sites/all'));
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
