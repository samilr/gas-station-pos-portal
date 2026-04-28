/**
 * Tipos para el dominio de host types.
 * Los métodos CRUD viven ahora en `src/store/api/hostTypesApi.ts` (RTK Query).
 */

export interface IHostType {
  hostTypeId: number;
  name: string;
  description?: string;
  active: boolean;
  code?: string;
  hasPrinter?: boolean;
}
