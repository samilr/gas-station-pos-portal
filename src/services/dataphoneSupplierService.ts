/**
 * Tipos para el dominio de dataphone suppliers.
 * Los métodos CRUD viven ahora en `src/store/api/dataphoneSuppliersApi.ts` (RTK Query).
 */

export interface DataphoneSupplier {
  dataphoneSupplierId: number;
  name: string;
  comment: string | null;
  posRequestPort: number;
  dataphoneResponsePort: number;
  transTimeout: number;
  active: boolean;
}

export interface CreateDataphoneSupplierRequest {
  dataphoneSupplierId: number;
  name: string;
  comment?: string | null;
  posRequestPort: number;
  dataphoneResponsePort: number;
  transTimeout: number;
  active: boolean;
}

export type UpdateDataphoneSupplierRequest = Partial<Omit<CreateDataphoneSupplierRequest, 'dataphoneSupplierId'>>;
