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

export interface TestDataphoneRequest {
  siteId: string;
  terminalId: number;
  amountCents?: number;
}

export interface TestDataphoneResult {
  approved: boolean;
  authorizationNumber: string | null;
  reference: number | null;
  retrievalReference: number | null;
  host: number | null;
  batch: number | null;
  cardProduct: string | null;
  maskedPan: string | null;
  holderName: string | null;
  terminalId: string | null;
  merchantId: string | null;
  transactionDateTime: string | null;
  messages: string[] | null;
  rawRequest?: string | null;
  rawResponse?: string | null;
}
