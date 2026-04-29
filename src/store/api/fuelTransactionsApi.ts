import { api } from './baseApi';
import {
  FuelTransaction,
  FuelTransactionsResponse,
  FuelTransactionsPagination,
  FuelStats,
} from '../../services/fuelTransactionService';
import {
  FuelTransactionAdmin,
  FuelAdminPagination,
  FuelAdminStats,
  FuelAdminResponse,
} from '../../services/fuelTransactionAdminService';
import { IShiftCandidatesResponse } from '../../types/periodStaft';

export interface ListFuelTransactionsParams {
  siteId?: string;
  pump?: number;
  nozzle?: number;
  fuelGradeId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListFuelTransactionsAdminParams {
  siteId?: string;
  ptsId?: string;
  startDate?: string;
  endDate?: string;
  staftId?: number;
  pump?: number;
  nozzle?: number;
  fuelGradeId?: number;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const buildQuery = (params?: ListFuelTransactionsParams): string => {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.siteId) qs.append('siteId', params.siteId);
  if (params.pump !== undefined) qs.append('pump', String(params.pump));
  if (params.nozzle !== undefined) qs.append('nozzle', String(params.nozzle));
  if (params.fuelGradeId !== undefined) qs.append('fuelGradeId', String(params.fuelGradeId));
  if (params.startDate) qs.append('startDate', params.startDate);
  if (params.endDate) qs.append('endDate', params.endDate);
  if (params.page !== undefined) qs.append('page', String(params.page));
  if (params.limit !== undefined) qs.append('limit', String(params.limit));
  if (params.sortBy) qs.append('sortBy', params.sortBy);
  if (params.sortOrder) qs.append('sortOrder', params.sortOrder);
  const s = qs.toString();
  return s ? `?${s}` : '';
};

const buildAdminQuery = (params?: ListFuelTransactionsAdminParams): string => {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.siteId) qs.append('siteId', params.siteId);
  if (params.ptsId) qs.append('ptsId', params.ptsId);
  if (params.startDate) qs.append('startDate', params.startDate);
  if (params.endDate) qs.append('endDate', params.endDate);
  if (params.staftId !== undefined) qs.append('staftId', String(params.staftId));
  if (params.pump !== undefined) qs.append('pump', String(params.pump));
  if (params.nozzle !== undefined) qs.append('nozzle', String(params.nozzle));
  if (params.fuelGradeId !== undefined) qs.append('fuelGradeId', String(params.fuelGradeId));
  if (params.minAmount !== undefined) qs.append('minAmount', String(params.minAmount));
  if (params.maxAmount !== undefined) qs.append('maxAmount', String(params.maxAmount));
  if (params.page !== undefined) qs.append('page', String(params.page));
  if (params.limit !== undefined) qs.append('limit', String(params.limit));
  if (params.sortBy) qs.append('sortBy', params.sortBy);
  if (params.sortOrder) qs.append('sortOrder', params.sortOrder);
  const s = qs.toString();
  return s ? `?${s}` : '';
};

interface ListResult {
  data: FuelTransaction[];
  pagination?: FuelTransactionsPagination;
  statistics?: FuelStats;
}

interface AdminListResult {
  data: FuelTransactionAdmin[];
  pagination?: FuelAdminPagination;
  statistics?: FuelAdminStats;
}

export const fuelTransactionsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listFuelTransactions: build.query<ListResult, ListFuelTransactionsParams | void>({
      query: (params) => `fuel-transactions${buildQuery(params || undefined)}`,
      transformResponse: (response: unknown): ListResult => {
        const body = response as Partial<FuelTransactionsResponse> | FuelTransaction[];
        if (Array.isArray(body)) {
          return { data: body };
        }
        return {
          data: Array.isArray(body?.data) ? body.data : [],
          pagination: body?.pagination,
          statistics: body?.statistics,
        };
      },
      providesTags: [{ type: 'Transaction', id: 'FUEL-LIST' }],
    }),

    listFuelTransactionsAdmin: build.query<AdminListResult, ListFuelTransactionsAdminParams | void>({
      query: (params) => `fuel-transactions/admin${buildAdminQuery(params || undefined)}`,
      transformResponse: (response: unknown): AdminListResult => {
        const body = response as Partial<FuelAdminResponse> | FuelTransactionAdmin[];
        if (Array.isArray(body)) {
          return { data: body };
        }
        return {
          data: Array.isArray(body?.data) ? body.data : [],
          pagination: body?.pagination,
          statistics: body?.statistics,
        };
      },
      providesTags: [{ type: 'Transaction', id: 'FUEL-ADMIN-LIST' }],
    }),

    getFuelTransactionShiftCandidates: build.query<IShiftCandidatesResponse | null, number>({
      query: (id) => `fuel-transactions/${id}/shift-candidates`,
      transformResponse: (r: unknown) => (r ? (r as IShiftCandidatesResponse) : null),
      providesTags: (_r, _e, id) => [{ type: 'Transaction', id: `FUEL-SHIFT-${id}` }],
    }),

    assignStaftToFuelTransaction: build.mutation<unknown, { id: number; staftId: number | null }>({
      query: ({ id, staftId }) => ({
        url: `fuel-transactions/${id}/assign-staft`,
        method: 'POST',
        body: { staftId },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Transaction', id: 'FUEL-LIST' },
        { type: 'Transaction', id: `FUEL-SHIFT-${arg.id}` },
      ],
    }),
  }),
});

export const {
  useListFuelTransactionsQuery,
  useListFuelTransactionsAdminQuery,
  useGetFuelTransactionShiftCandidatesQuery,
  useAssignStaftToFuelTransactionMutation,
} = fuelTransactionsApi;
