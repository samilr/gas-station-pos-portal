import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './apiInterceptor';
import { IProduct, ICreateProductDto, IUpdateProductDto } from '../types/product';

export interface IProductByCategory {
  productId: string;
  product: string;
  price: number;
  priceIsTaxed: boolean;
  barcodeId: string;
  productName: string | null;
  categoryId: string;
  category: string;
  taxId: string;
  taxName: string | null;
  taxTypeId: number | null;
  taxTypeName: string | null;
  taxRate: number | null;
}

export const getAllProducts = async (): Promise<IProduct[]> => {
  const response = await apiGet<IProduct[]>(buildApiUrl('products'));

  if (!response.successful) {
    throw new Error(response.error || 'Error fetching products');
  }

  return response.data;
};

export const getProductsByCategory = async (categoryId: string): Promise<IProductByCategory[]> => {
  const response = await apiGet<any>(
    buildApiUrl(`products/category/${encodeURIComponent(categoryId)}`)
  );

  if (!response.successful) {
    throw new Error(response.error || 'Error fetching products by category');
  }

  const raw = response.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
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
