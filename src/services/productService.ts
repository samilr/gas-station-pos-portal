/**
 * Tipos para el dominio de productos.
 * Los métodos CRUD viven ahora en `src/store/api/productsApi.ts` (RTK Query).
 */

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
