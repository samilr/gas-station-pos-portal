/**
 * Tipos para el dominio de categorías.
 * Los métodos CRUD viven ahora en `src/store/api/categoriesApi.ts` (RTK Query).
 */

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
