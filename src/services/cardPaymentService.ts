/**
 * Tipos para el dominio de card payments.
 * Los métodos CRUD viven ahora en `src/store/api/cardPaymentsApi.ts` (RTK Query).
 */

export type CardPaymentStatus =
  | 'Staged' | 'Approved' | 'LinkedToTrans' | 'Voided' | 'Refunded' | 'Declined' | 'Error';

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
