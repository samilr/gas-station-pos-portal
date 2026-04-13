import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import {
  ITax, ITaxType, ITaxLine,
  ICreateTaxDto, IUpdateTaxDto,
  ICreateTaxTypeDto, IUpdateTaxTypeDto,
  ICreateTaxLineDto, IUpdateTaxLineDto,
} from '../types/tax';

export const taxService = {
  // Taxes
  async getTaxes(): Promise<ApiResponse<ITax[]>> {
    return apiGet<ITax[]>(buildApiUrl('taxes'));
  },
  async getTaxById(taxId: string): Promise<ApiResponse<ITax>> {
    return apiGet<ITax>(buildApiUrl(`taxes/${taxId}`));
  },
  async createTax(data: ICreateTaxDto): Promise<ApiResponse<ITax>> {
    return apiPost<ITax>(buildApiUrl('taxes'), data);
  },
  async updateTax(taxId: string, data: IUpdateTaxDto): Promise<ApiResponse<ITax>> {
    return apiPut<ITax>(buildApiUrl(`taxes/${taxId}`), data);
  },
  async deleteTax(taxId: string): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`taxes/${taxId}`));
  },

  // Tax Types
  async getTaxTypes(): Promise<ApiResponse<ITaxType[]>> {
    return apiGet<ITaxType[]>(buildApiUrl('tax-types'));
  },
  async createTaxType(data: ICreateTaxTypeDto): Promise<ApiResponse<ITaxType>> {
    return apiPost<ITaxType>(buildApiUrl('tax-types'), data);
  },
  async updateTaxType(taxTypeId: number, data: IUpdateTaxTypeDto): Promise<ApiResponse<ITaxType>> {
    return apiPut<ITaxType>(buildApiUrl(`tax-types/${taxTypeId}`), data);
  },
  async deleteTaxType(taxTypeId: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`tax-types/${taxTypeId}`));
  },

  // Tax Lines
  async getTaxLines(taxId: string): Promise<ApiResponse<ITaxLine[]>> {
    return apiGet<ITaxLine[]>(buildApiUrl(`tax-lines?taxId=${taxId}`));
  },
  async createTaxLine(data: ICreateTaxLineDto): Promise<ApiResponse<ITaxLine>> {
    return apiPost<ITaxLine>(buildApiUrl('tax-lines'), data);
  },
  async updateTaxLine(taxId: string, line: number, data: IUpdateTaxLineDto): Promise<ApiResponse<ITaxLine>> {
    return apiPut<ITaxLine>(buildApiUrl(`tax-lines/${taxId}/${line}`), data);
  },
  async deleteTaxLine(taxId: string, line: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`tax-lines/${taxId}/${line}`));
  },
};
