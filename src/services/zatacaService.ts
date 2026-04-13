import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import {
  IZatacaConfig, IZatacaProduct, IZatacaType, IZatacaTransaction,
  ICreateZatacaProductDto, IUpdateZatacaProductDto,
  ICreateZatacaTypeDto, IUpdateZatacaTypeDto,
  IUpdateZatacaConfigDto,
} from '../types/zataca';

export const zatacaService = {
  // Config
  async getConfig(): Promise<ApiResponse<IZatacaConfig>> {
    return apiGet<IZatacaConfig>(buildApiUrl('zataca/config'));
  },
  async createConfig(data: Partial<IZatacaConfig>): Promise<ApiResponse<IZatacaConfig>> {
    return apiPost<IZatacaConfig>(buildApiUrl('zataca/config'), data);
  },
  async updateConfig(companyId: number, data: IUpdateZatacaConfigDto): Promise<ApiResponse<IZatacaConfig>> {
    return apiPut<IZatacaConfig>(buildApiUrl(`zataca/config/${companyId}`), data);
  },
  async deleteConfig(companyId: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`zataca/config/${companyId}`));
  },

  // Products
  async getProducts(): Promise<ApiResponse<IZatacaProduct[]>> {
    return apiGet<IZatacaProduct[]>(buildApiUrl('zataca/products'));
  },
  async getProductById(zProductId: number): Promise<ApiResponse<IZatacaProduct>> {
    return apiGet<IZatacaProduct>(buildApiUrl(`zataca/products/${zProductId}`));
  },
  async createProduct(data: ICreateZatacaProductDto): Promise<ApiResponse<IZatacaProduct>> {
    return apiPost<IZatacaProduct>(buildApiUrl('zataca/products'), data);
  },
  async updateProduct(zProductId: number, data: IUpdateZatacaProductDto): Promise<ApiResponse<IZatacaProduct>> {
    return apiPut<IZatacaProduct>(buildApiUrl(`zataca/products/${zProductId}`), data);
  },
  async deleteProduct(zProductId: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`zataca/products/${zProductId}`));
  },

  // Types
  async getTypes(): Promise<ApiResponse<IZatacaType[]>> {
    return apiGet<IZatacaType[]>(buildApiUrl('zataca/types'));
  },
  async getTypeById(zTypeId: number): Promise<ApiResponse<IZatacaType>> {
    return apiGet<IZatacaType>(buildApiUrl(`zataca/types/${zTypeId}`));
  },
  async createType(data: ICreateZatacaTypeDto): Promise<ApiResponse<IZatacaType>> {
    return apiPost<IZatacaType>(buildApiUrl('zataca/types'), data);
  },
  async updateType(zTypeId: number, data: IUpdateZatacaTypeDto): Promise<ApiResponse<IZatacaType>> {
    return apiPut<IZatacaType>(buildApiUrl(`zataca/types/${zTypeId}`), data);
  },
  async deleteType(zTypeId: number): Promise<ApiResponse<any>> {
    return apiDelete(buildApiUrl(`zataca/types/${zTypeId}`));
  },

  // Transactions
  async getTransactions(transNumber?: string): Promise<ApiResponse<IZatacaTransaction[]>> {
    const url = transNumber
      ? buildApiUrl(`zataca/transactions?transNumber=${transNumber}`)
      : buildApiUrl('zataca/transactions');
    return apiGet<IZatacaTransaction[]>(url);
  },
};
