/**
 * Tipos para el dominio de card payments.
 * Los métodos CRUD viven ahora en `src/store/api/cardPaymentsApi.ts` (RTK Query).
 */

// Refleja el enum del backend `CardPaymentStatus` (Domain/BusSale/CardPayment.cs).
// `LinkedToTrans` existe solo por back-compat con filas viejas; la API no lo asigna
// en registros nuevos — una venta aprobada queda con `status = Approved` y el vínculo
// se refleja en `linkedTransNumber`.
export type CardPaymentStatus =
  | 'Pending' | 'Approved' | 'Declined' | 'Failed' | 'Voided' | 'Refunded' | 'LinkedToTrans';

export interface CardPayment {
  cardPaymentId: string;
  siteId: string;
  terminalId: number;
  posTransNumber: string | null;
  transNumber: string | null;
  transPaymLine: number | null;
  amountCents: number;
  taxCents: number;
  otherTaxesCents: number;
  approved: boolean;
  authorizationNumber: string | null;
  reference: number | null;
  host: number | null;
  batch: number | null;
  cardProduct: string | null;
  maskedPan: string | null;
  status: CardPaymentStatus;
  providerStatus: string | null;
  operation: 'Sale' | 'Refund' | 'Void' | 'Close' | string;
  message: string | null;
  rawRequest: string | null;
  rawResponse: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ListFilters {
  siteId?: string;
  terminalId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  successful: boolean;
  data: T[];
  pagination?: { page: number; limit: number; total: number; totalPages?: number };
  error?: string;
}

export interface VoidCardPaymentResult {
  cardPaymentId: string;
  status: CardPaymentStatus | string;
  providerStatus: string | null;
  rawResponse: string | null;
  messages: string[] | null;
}

export interface BatchCloseRequest {
  siteId: string;
  terminalId: number;
}

export interface BatchCloseResult {
  cardPaymentId: string | null;
  success: boolean;
  closureQuantity: number | null;
  providerStatus: string | null;
  rawResponse: string | null;
  messages: string[] | null;
}

export interface ReadCardRequest {
  siteId: string;
  terminalId: number;
}

export interface ReadCardResult {
  read: boolean;
  cardProduct: string | null;
  maskedPan: string | null;
  holderName: string | null;
  bin: string | null;
  messages: string[] | null;
  rawRequest?: string | null;
  rawResponse?: string | null;
}

export interface LastApprovedRequest {
  siteId: string;
  terminalId: number;
}

export interface LastApprovedResult {
  approved: boolean;
  authorizationNumber?: string | null;
  reference?: number | null;
  retrievalReference?: number | null;
  host?: number | null;
  batch?: number | null;
  cardProduct?: string | null;
  maskedPan?: string | null;
  holderName?: string | null;
  terminalId?: string | null;
  merchantId?: string | null;
  transactionDateTime?: string | null;
  messages: string[] | null;
  rawRequest?: string | null;
  rawResponse?: string | null;
  providerStatus: string | null;
}
