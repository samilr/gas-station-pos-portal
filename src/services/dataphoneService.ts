/**
 * Tipos para el dominio de dataphones.
 * Los métodos CRUD viven ahora en `src/store/api/dataphonesApi.ts` (RTK Query).
 */

export interface Dataphone {
  dataphoneId: number;
  name: string;
  siteId: string;
  dataphoneSupplierId: number;
  dataphoneIpAddress: string;
  dataphoneResponsePort: number;
  terminalRequestPort: number;
  transTimeout: number;
  comment: string | null;
  active: boolean;
}

export interface CreateDataphoneRequest {
  dataphoneId: number;
  name: string;
  siteId: string;
  dataphoneSupplierId: number;
  dataphoneIpAddress: string;
  dataphoneResponsePort: number;
  terminalRequestPort: number;
  transTimeout: number;
  comment?: string | null;
  active: boolean;
}

export type UpdateDataphoneRequest = Partial<Omit<CreateDataphoneRequest, 'dataphoneId'>>;
