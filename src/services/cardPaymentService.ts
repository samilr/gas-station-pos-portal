import { buildApiUrl } from '../config/api';
import { apiGet, apiPost } from './apiInterceptor';

export type CardPaymentStatus =
  | 'Staged' | 'Approved' | 'LinkedToTrans' | 'Voided' | 'Refunded' | 'Declined' | 'Error';

// Mapas de enums numéricos (como devuelve el API) a strings legibles
const STATUS_MAP: Record<number, CardPaymentStatus> = {
  0: 'Staged',
  1: 'Approved',
  2: 'Error',
  3: 'LinkedToTrans',
  4: 'Voided',
  5: 'Refunded',
  6: 'Declined',
};

const OPERATION_MAP: Record<number, string> = {
  0: 'Sale',
  1: 'Refund',
  2: 'Void',
  3: 'Close',
};

const normalizeStatus = (s: unknown): CardPaymentStatus => {
  if (typeof s === 'number') return STATUS_MAP[s] ?? 'Error';
  if (typeof s === 'string') return s as CardPaymentStatus;
  return 'Error';
};

const normalizeOperation = (o: unknown): string => {
  if (typeof o === 'number') return OPERATION_MAP[o] ?? String(o);
  if (typeof o === 'string') return o;
  return '';
};

const normalizePayment = (raw: any): CardPayment => ({
  cardPaymentId: raw.cardPaymentId,
  siteId: raw.siteId,
  terminalId: raw.terminalId,
  posTransNumber: raw.posTransNumber ?? null,
  // API expone `linkedTransNumber`/`linkedTransPaymLine`; mantenemos alias legacy
  transNumber: raw.transNumber ?? raw.linkedTransNumber ?? null,
  transPaymLine: raw.transPaymLine ?? raw.linkedTransPaymLine ?? null,
  amountCents: raw.amountCents ?? 0,
  taxCents: raw.taxCents ?? 0,
  otherTaxesCents: raw.otherTaxesCents ?? 0,
  approved: raw.approved ?? (raw.status === 1 || raw.status === 'Approved'),
  authorizationNumber: raw.authorizationNumber ?? null,
  reference: raw.reference ?? null,
  host: raw.host ?? null,
  batch: raw.batch ?? null,
  cardProduct: raw.cardProduct ?? null,
  maskedPan: raw.maskedPan ?? null,
  status: normalizeStatus(raw.status),
  operation: normalizeOperation(raw.operation),
  message: raw.message ?? null,
  rawRequest: raw.rawRequest ?? null,
  rawResponse: raw.rawResponse ?? null,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt ?? null,
});

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
      const list = Array.isArray(raw.data) ? raw.data.map(normalizePayment) : [];
      return { successful: true, data: list, pagination: raw.pagination };
    }
    const list = Array.isArray(raw) ? raw.map(normalizePayment) : [];
    return { successful: true, data: list };
  }

  async getOrphaned(siteId?: string): Promise<{ successful: boolean; data: CardPayment[]; error?: string }> {
    const url = buildApiUrl(`card-payments/orphaned${siteId ? `?siteId=${encodeURIComponent(siteId)}` : ''}`);
    const res = await apiGet<any>(url);
    const list = Array.isArray(res.data) ? res.data.map(normalizePayment) : [];
    return { successful: res.successful, data: list, error: res.error };
  }

  async getById(id: string): Promise<{ successful: boolean; data: CardPayment | null; error?: string }> {
    const res = await apiGet<any>(buildApiUrl(`card-payments/${id}`));
    const data = res.data ? normalizePayment(res.data) : null;
    return { successful: res.successful, data, error: res.error };
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
