import { api } from './baseApi';
import {
  CardPayment,
  ListFilters,
  VoidCardPaymentResult,
  BatchCloseRequest,
  BatchCloseResult,
  LastApprovedRequest,
  LastApprovedResult,
  ReadCardRequest,
  ReadCardResult,
} from '../../services/cardPaymentService';

interface PaginatedCardPayments {
  data: CardPayment[];
  pagination?: { page: number; limit: number; total: number; totalPages?: number };
}

// Mapas de enums numéricos para normalización.
// Fuente de verdad: `src/GasStationPos.Domain/BusSale/CardPayment.cs` en el backend.
const STATUS_MAP: Record<number, string> = {
  0: 'Pending',
  1: 'Approved',
  2: 'Declined',
  3: 'Failed',
  4: 'Voided',
  5: 'Refunded',
  6: 'LinkedToTrans',
};

const OPERATION_MAP: Record<number, string> = {
  0: 'Sale',
  1: 'Refund',
  2: 'Void',
  3: 'Close',
};

const normalizeStatus = (s: unknown): string => {
  if (typeof s === 'number') return STATUS_MAP[s] ?? 'Error';
  if (typeof s === 'string') return s;
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
  status: normalizeStatus(raw.status) as CardPayment['status'],
  providerStatus: raw.providerStatus ?? null,
  operation: normalizeOperation(raw.operation) as CardPayment['operation'],
  message: raw.message ?? null,
  rawRequest: raw.rawRequest ?? null,
  rawResponse: raw.rawResponse ?? null,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt ?? null,
});

const buildQuery = (filters: ListFilters = {}): string => {
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

export const cardPaymentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listCardPayments: build.query<PaginatedCardPayments, ListFilters | void>({
      query: (filters) => `card-payments${buildQuery(filters || undefined)}`,
      transformResponse: (response: unknown): PaginatedCardPayments => {
        const body = response as { data?: unknown; pagination?: PaginatedCardPayments['pagination'] } | unknown[];
        if (Array.isArray(body)) {
          return { data: body.map(normalizePayment) };
        }
        const list = Array.isArray(body?.data) ? body.data.map(normalizePayment) : [];
        return { data: list, pagination: body?.pagination };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p) => ({ type: 'CardPayment' as const, id: p.cardPaymentId })),
              { type: 'CardPayment' as const, id: 'LIST' },
            ]
          : [{ type: 'CardPayment' as const, id: 'LIST' }],
    }),

    getCardPaymentById: build.query<CardPayment | null, string>({
      query: (id) => `card-payments/${id}`,
      transformResponse: (response: unknown): CardPayment | null => {
        if (!response) return null;
        const data = (response as { data?: unknown })?.data ?? response;
        return data ? normalizePayment(data) : null;
      },
      providesTags: (_r, _e, id) => [{ type: 'CardPayment', id }],
    }),

    listOrphanedCardPayments: build.query<CardPayment[], string | void>({
      query: (siteId) => `card-payments/orphaned${siteId ? `?siteId=${encodeURIComponent(siteId)}` : ''}`,
      transformResponse: (response: unknown): CardPayment[] => {
        const arr = Array.isArray(response)
          ? response
          : Array.isArray((response as { data?: unknown })?.data)
            ? ((response as { data: unknown[] }).data)
            : [];
        return arr.map(normalizePayment);
      },
      providesTags: [{ type: 'CardPayment', id: 'ORPHANED' }],
    }),

    voidCardPayment: build.mutation<VoidCardPaymentResult, string>({
      query: (id) => ({ url: `card-payments/${id}/void`, method: 'POST' }),
      transformResponse: (raw: unknown): VoidCardPaymentResult => {
        const d = (raw as { data?: unknown })?.data ?? raw;
        const r = d as Partial<VoidCardPaymentResult> & Record<string, unknown>;
        return {
          cardPaymentId: String(r.cardPaymentId ?? ''),
          status:
            typeof r.status === 'number'
              ? (STATUS_MAP[r.status] ?? 'Voided')
              : (r.status as string) ?? 'Voided',
          providerStatus: (r.providerStatus as string) ?? null,
          rawResponse: (r.rawResponse as string) ?? null,
          messages: Array.isArray(r.messages) ? (r.messages as string[]) : null,
        };
      },
      invalidatesTags: (_r, _e, id) => [
        { type: 'CardPayment', id },
        { type: 'CardPayment', id: 'LIST' },
      ],
    }),

    refundCardPayment: build.mutation<
      unknown,
      { id: string; body: { amountCents: number; taxCents?: number; otherTaxesCents?: number } }
    >({
      query: ({ id, body }) => ({ url: `card-payments/${id}/refund`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'CardPayment', id: arg.id },
        { type: 'CardPayment', id: 'LIST' },
      ],
    }),

    batchCloseCardPayments: build.mutation<BatchCloseResult, BatchCloseRequest>({
      query: (body) => ({ url: 'card-payments/batch-close', method: 'POST', body }),
      transformResponse: (raw: unknown): BatchCloseResult => {
        const d = (raw as { data?: unknown })?.data ?? raw;
        const r = d as Record<string, unknown>;
        return {
          cardPaymentId: (r.cardPaymentId as string) ?? null,
          success: Boolean(r.success),
          closureQuantity:
            typeof r.closureQuantity === 'number' ? (r.closureQuantity as number) : null,
          providerStatus: (r.providerStatus as string) ?? null,
          rawResponse: (r.rawResponse as string) ?? null,
          messages: Array.isArray(r.messages) ? (r.messages as string[]) : null,
        };
      },
      invalidatesTags: [
        { type: 'CardPayment', id: 'LIST' },
        { type: 'CardPayment', id: 'ORPHANED' },
      ],
    }),

    lastApprovedCardPayment: build.mutation<LastApprovedResult, LastApprovedRequest>({
      query: (body) => ({ url: 'card-payments/last-approved', method: 'POST', body }),
      transformResponse: (raw: unknown): LastApprovedResult => {
        const d = (raw as { data?: unknown })?.data ?? raw;
        const r = d as Record<string, unknown>;
        return {
          approved: Boolean(r.approved),
          authorizationNumber: (r.authorizationNumber as string) ?? null,
          reference: typeof r.reference === 'number' ? (r.reference as number) : null,
          retrievalReference:
            typeof r.retrievalReference === 'number' ? (r.retrievalReference as number) : null,
          host: typeof r.host === 'number' ? (r.host as number) : null,
          batch: typeof r.batch === 'number' ? (r.batch as number) : null,
          cardProduct: (r.cardProduct as string) ?? null,
          maskedPan: (r.maskedPan as string) ?? null,
          holderName: (r.holderName as string) ?? null,
          terminalId: (r.terminalId as string) ?? null,
          merchantId: (r.merchantId as string) ?? null,
          transactionDateTime: (r.transactionDateTime as string) ?? null,
          messages: Array.isArray(r.messages) ? (r.messages as string[]) : null,
          rawRequest: (r.rawRequest as string) ?? null,
          rawResponse: (r.rawResponse as string) ?? null,
          providerStatus: (r.providerStatus as string) ?? null,
        };
      },
    }),

    readCard: build.mutation<ReadCardResult, ReadCardRequest>({
      query: (body) => ({ url: 'card-payments/read-card', method: 'POST', body }),
      transformResponse: (raw: unknown): ReadCardResult => {
        const d = (raw as { data?: unknown })?.data ?? raw;
        const r = d as Record<string, unknown>;
        return {
          read: Boolean(r.read),
          cardProduct: (r.cardProduct as string) ?? null,
          maskedPan: (r.maskedPan as string) ?? null,
          holderName: (r.holderName as string) ?? null,
          bin: (r.bin as string) ?? null,
          messages: Array.isArray(r.messages) ? (r.messages as string[]) : null,
          rawRequest: (r.rawRequest as string) ?? null,
          rawResponse: (r.rawResponse as string) ?? null,
        };
      },
    }),

    linkCardPaymentTrans: build.mutation<
      unknown,
      { id: string; body: { transNumber: string; transPaymLine: number } }
    >({
      query: ({ id, body }) => ({ url: `card-payments/${id}/link-trans`, method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'CardPayment', id: arg.id },
        { type: 'CardPayment', id: 'LIST' },
        { type: 'CardPayment', id: 'ORPHANED' },
      ],
    }),
  }),
});

export const {
  useListCardPaymentsQuery,
  useGetCardPaymentByIdQuery,
  useListOrphanedCardPaymentsQuery,
  useVoidCardPaymentMutation,
  useRefundCardPaymentMutation,
  useBatchCloseCardPaymentsMutation,
  useLinkCardPaymentTransMutation,
  useLastApprovedCardPaymentMutation,
  useReadCardMutation,
} = cardPaymentsApi;
