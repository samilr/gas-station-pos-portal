/**
 * Tipos para el dominio de logs (audit actions + error logs).
 * Los métodos CRUD viven ahora en `src/store/api/logsApi.ts` (RTK Query).
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedLogsResponse<T> {
  successful: boolean;
  data: T[];
  pagination: PaginationMeta;
}
