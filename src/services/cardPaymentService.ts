import { buildApiUrl } from '../config/api';
import { apiGet, apiPost } from './apiInterceptor';

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

const buildQuery = (filters: ListFilters): string => {
  const qs = new URLSearchParams();
  if (filters.siteId) qs.append('siteId', filters.siteId);
  if (filters.terminalId !== undefined) qs.append('terminalId', String(filters.terminalId));
  if (filters.from) qs.append('from', filters.from);
  if (filters.to) qs.append('to', filters.to);
  if (filters.page) qs.append('page', String(filters.page));
  if (filters.limit) qs.append('limit', String(filters.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
};

class CardPaymentService {
  async list(filters: ListFilters = {}): Promise<PaginatedResponse<CardPayment>> {
    const res = await apiGet<any>(buildApiUrl(`card-payments${buildQuery(filters)}`));
    const raw: any = res.data;
    if (!res.successful) return { successful: false, data: [], error: res.error };
    if (raw?.pagination) {
      return { successful: true, data: Array.isArray(raw.data) ? raw.data : [], pagination: raw.pagination };
    }
    return { successful: true, data: Array.isArray(raw) ? raw : [] };
  }

  async getOrphaned(siteId?: string): Promise<{ successful: boolean; data: CardPayment[]; error?: string }> {
    const url = buildApiUrl(`card-payments/orphaned${siteId ? `?siteId=${encodeURIComponent(siteId)}` : ''}`);
    const res = await apiGet<any>(url);
    return { successful: res.successful, data: Array.isArray(res.data) ? res.data : [], error: res.error };
  }

  async getById(id: string): Promise<{ successful: boolean; data: CardPayment | null; error?: string }> {
    const res = await apiGet<CardPayment>(buildApiUrl(`card-payments/${id}`));
    return { successful: res.successful, data: (res.data as CardPayment) || null, error: res.error };
  }

  async voidPayment(id: string): Promise<{ successful: boolean; data: any; error?: string }> {
    const res = await apiPost<any>(buildApiUrl(`card-payments/${id}/void`));
    return { successful: res.successful, data: res.data, error: res.error };
  }

  async refund(id: string, body: { amountCents: number; taxCents?: number; otherTaxesCents?: number }) {
    const res = await apiPost<any>(buildApiUrl(`card-payments/${id}/refund`), body);
    return { successful: res.successful, data: res.data, error: res.error };
  }

  async batchClose(body: { siteId: string; terminalId: number }) {
    const res = await apiPost<any>(buildApiUrl('card-payments/batch-close'), body);
    return { successful: res.successful, data: res.data, error: res.error };
  }

  async linkTrans(id: string, body: { transNumber: string; transPaymLine: number }) {
    const res = await apiPost<any>(buildApiUrl(`card-payments/${id}/link-trans`), body);
    return { successful: res.successful, data: res.data, error: res.error };
  }
}

const cardPaymentService = new CardPaymentService();
export default cardPaymentService;
