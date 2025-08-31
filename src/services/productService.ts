import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { IProduct, ICreateProductDto, IUpdateProductDto } from '../types/product';

export const getAllProducts = async (): Promise<IProduct[]> => {
  const response = await apiGet<IProduct[]>(buildApiUrl('products'));
  
  if (!response.successful) {
    throw new Error(response.error || 'Error fetching products');
  }

  return response.data;
};

export const createProduct = async (productData: ICreateProductDto): Promise<ApiResponse<any>> => {
  return await apiPost(buildApiUrl('products'), productData);
};

export const updateProduct = async (productId: string, productData: IUpdateProductDto): Promise<ApiResponse<any>> => {
  return await apiPut(buildApiUrl(`products/${productId}`), productData);
};

export const deleteProduct = async (productId: string): Promise<ApiResponse<any>> => {
  return await apiDelete(buildApiUrl(`products/${productId}`));
};
