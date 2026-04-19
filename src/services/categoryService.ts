import { buildApiUrl } from '../config/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiInterceptor';

export interface Category {
  categoryId: string;
  categoryName: string;
  image: string | null;
  unitId: string;
  ctrlCategoryId?: string | null;
  inputUnitId?: string | null;
  outputUnitId?: string | null;
  priceIsTaxed?: boolean;
  costingMethod?: number;
  allowDiscount?: boolean;
  active?: boolean;
}

export interface CreateCategoryRequest {
  categoryId: string;
  name: string;
  ctrlCategoryId: string;
  unitId: string;
  inputUnitId: string;
  outputUnitId: string;
  priceIsTaxed: boolean;
  costingMethod: number;
  allowDiscount: boolean;
  active: boolean;
  image?: string | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  ctrlCategoryId?: string;
  unitId?: string;
  inputUnitId?: string;
  outputUnitId?: string;
  priceIsTaxed?: boolean;
  costingMethod?: number;
  allowDiscount?: boolean;
  active?: boolean;
  image?: string | null;
}

export interface ListResponse {
  successful: boolean;
  data: Category[];
  error?: string;
}

export interface ItemResponse {
  successful: boolean;
  data: Category | null;
  error?: string;
}

class CategoryService {
  async list(): Promise<ListResponse> {
    const res = await apiGet<any>(buildApiUrl('categories'));
    const raw = res.data;
    const items: Category[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data) ? raw.data : [];
    return { successful: res.successful, data: items, error: res.error };
  }

  async create(payload: CreateCategoryRequest): Promise<ItemResponse> {
    const res = await apiPost<Category>(buildApiUrl('categories'), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async update(categoryId: string, payload: UpdateCategoryRequest): Promise<ItemResponse> {
    const res = await apiPut<Category>(buildApiUrl(`categories/${encodeURIComponent(categoryId)}`), payload);
    return { successful: res.successful, data: res.data || null, error: res.error };
  }

  async remove(categoryId: string): Promise<{ successful: boolean; error?: string }> {
    const res = await apiDelete(buildApiUrl(`categories/${encodeURIComponent(categoryId)}`));
    return { successful: res.successful, error: res.error };
  }
}

const categoryService = new CategoryService();
export default categoryService;
