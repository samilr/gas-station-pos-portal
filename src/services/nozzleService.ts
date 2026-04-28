/**
 * Tipos para el dominio de nozzles.
 * Los métodos CRUD viven ahora en `src/store/api/nozzlesApi.ts` (RTK Query).
 */

export interface Nozzle {
  nozzleId: number;
  dispenserId: number;
  nozzleNumber: number;
  productId: string;
  productName: string | null;
  price: number;
  tankNumber: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateNozzleRequest {
  dispenserId: number;
  nozzleNumber: number;
  productId: string;
  tankNumber?: number | null;
}

export interface UpdateNozzleRequest {
  productId?: string;
  tankNumber?: number | null;
  unassignTank?: boolean;
  active?: boolean;
}
