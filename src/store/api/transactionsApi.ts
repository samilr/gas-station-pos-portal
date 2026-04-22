import { api } from './baseApi';
import {
  IPaginatedTransactionsResponse,
  ISalesAndReturnsSummary,
  IDailySales,
  ITopTransaction,
  ITopProduct,
  ISalesBySite,
} from '../../types/transaction';

// Convierte YYYY-MM-DD a ISO datetime con offset GMT-4 (start-of-day Santo Domingo).
// Evita que el backend interprete la fecha como UTC midnight.
const toSantoDomingoStartOfDay = (date: string): string => {
  if (!date) return date;
  if (date.includes('T')) return date;
  return `${date}T00:00:00-04:00`;
};

export interface GetTransactionsParams {
  transNumber?: string;
  cfNumber?: string;
  siteId?: string;
  terminal?: number;
  cfType?: string;
  staftId?: number;
  taxpayerId?: string;
  shift?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

const buildQuery = (params?: GetTransactionsParams): string => {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.append('page', String(params.page));
  if (params.limit !== undefined) qs.append('limit', String(params.limit));
  if (params.transNumber) qs.append('transNumber', params.transNumber);
  if (params.cfNumber) qs.append('cfNumber', params.cfNumber);
  if (params.siteId) qs.append('siteId', params.siteId);
  if (params.terminal !== undefined) qs.append('terminal', String(params.terminal));
  if (params.cfType) qs.append('cfType', params.cfType);
  if (params.staftId !== undefined) qs.append('staftId', String(params.staftId));
  if (params.taxpayerId) qs.append('taxpayerId', params.taxpayerId);
  if (params.shift !== undefined) qs.append('shift', String(params.shift));
  if (params.startDate) qs.append('startDate', params.startDate);
  if (params.endDate) qs.append('endDate', params.endDate);
  const s = qs.toString();
  return s ? `?${s}` : '';
};

export const transactionsApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Endpoint principal — paginado, recibe filtros.
    // El baseQuery devuelve el body completo cuando hay pagination.
    getTransactions: build.query<IPaginatedTransactionsResponse, GetTransactionsParams | void>({
      query: (params) => `trans${buildQuery(params || undefined)}`,
      transformResponse: (response: unknown): IPaginatedTransactionsResponse => {
        const body = response as Partial<IPaginatedTransactionsResponse>;
        return {
          successful: body.successful ?? true,
          data: Array.isArray(body.data) ? body.data : [],
          pagination: body.pagination ?? {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          statistics: body.statistics ?? {
            totalTransactions: 0,
            totalSales: 0,
            totalReturns: 0,
            dgiiAcceptedTransactions: 0,
            dgiiPendingTransactions: 0,
            dgiiRejectedTransactions: 0,
            totalCash: 0,
            totalCard: 0,
            totalTransfer: 0,
            totalZataca: 0,
            totalOther: 0,
          } as IPaginatedTransactionsResponse['statistics'],
        };
      },
      providesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),

    // Dashboard endpoints (todos aceptan siteId opcional)
    getSalesAndReturnsSummary: build.query<
      ISalesAndReturnsSummary,
      { startDate: string; siteId?: string }
    >({
      query: ({ startDate, siteId }) => {
        const qs = new URLSearchParams();
        qs.append('startDate', toSantoDomingoStartOfDay(startDate));
        if (siteId) qs.append('siteId', siteId);
        return `trans/dashboard/sales-returns-summary?${qs.toString()}`;
      },
      providesTags: [{ type: 'Transaction', id: 'SUMMARY' }],
    }),

    getDailySales: build.query<IDailySales[], { startDate: string; siteId?: string }>({
      query: ({ startDate, siteId }) => {
        const qs = new URLSearchParams();
        qs.append('startDate', toSantoDomingoStartOfDay(startDate));
        if (siteId) qs.append('siteId', siteId);
        return `trans/dashboard/daily-sales?${qs.toString()}`;
      },
      transformResponse: (r: unknown) => (Array.isArray(r) ? (r as IDailySales[]) : []),
      providesTags: [{ type: 'Transaction', id: 'DAILY-SALES' }],
    }),

    getTopTransactions: build.query<
      ITopTransaction[],
      { startDate: string; limit?: number; siteId?: string }
    >({
      query: ({ startDate, limit = 4, siteId }) => {
        const qs = new URLSearchParams();
        qs.append('startDate', toSantoDomingoStartOfDay(startDate));
        qs.append('limit', String(limit));
        if (siteId) qs.append('siteId', siteId);
        return `trans/dashboard/top-transactions?${qs.toString()}`;
      },
      transformResponse: (r: unknown) => (Array.isArray(r) ? (r as ITopTransaction[]) : []),
      providesTags: [{ type: 'Transaction', id: 'TOP' }],
    }),

    getTopProducts: build.query<
      ITopProduct[],
      { startDate: string; categoryId?: string; limit?: number; siteId?: string }
    >({
      query: ({ startDate, categoryId, limit = 5, siteId }) => {
        const qs = new URLSearchParams();
        qs.append('startDate', toSantoDomingoStartOfDay(startDate));
        qs.append('limit', String(limit));
        if (categoryId) qs.append('categoryId', categoryId);
        if (siteId) qs.append('siteId', siteId);
        return `trans/dashboard/top-products?${qs.toString()}`;
      },
      transformResponse: (r: unknown) => (Array.isArray(r) ? (r as ITopProduct[]) : []),
      providesTags: [{ type: 'Transaction', id: 'TOP-PRODUCTS' }],
    }),

    getSalesBySite: build.query<ISalesBySite[], { startDate: string; siteId?: string }>({
      query: ({ startDate, siteId }) => {
        const qs = new URLSearchParams();
        qs.append('startDate', toSantoDomingoStartOfDay(startDate));
        if (siteId) qs.append('siteId', siteId);
        return `trans/dashboard/sales-by-site?${qs.toString()}`;
      },
      transformResponse: (r: unknown) => (Array.isArray(r) ? (r as ISalesBySite[]) : []),
      providesTags: [{ type: 'Transaction', id: 'BY-SITE' }],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useLazyGetTransactionsQuery,
  useGetSalesAndReturnsSummaryQuery,
  useGetDailySalesQuery,
  useGetTopTransactionsQuery,
  useGetTopProductsQuery,
  useGetSalesBySiteQuery,
} = transactionsApi;
