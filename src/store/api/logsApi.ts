import { api } from './baseApi';
import { IActionLog, IErrorLog } from '../../types/logs';
import { PaginationMeta } from '../../services/logService';

interface LogsQueryParams {
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

interface PaginatedLogs<T> {
  data: T[];
  pagination: PaginationMeta;
}

const buildQuery = (params?: LogsQueryParams): string => {
  const qs = new URLSearchParams();
  if (params?.fromDate) qs.append('fromDate', params.fromDate);
  if (params?.toDate) qs.append('toDate', params.toDate);
  if (params?.page) qs.append('page', String(params.page));
  if (params?.limit) qs.append('limit', String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
};

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

function normalizePaginated<T>(response: unknown): PaginatedLogs<T> {
  const body = response as { data?: T[]; pagination?: Partial<PaginationMeta> } | T[];
  if (Array.isArray(body)) {
    return { data: body, pagination: DEFAULT_PAGINATION };
  }
  const items = body?.data ?? [];
  const pag = body?.pagination ?? {};
  const page = pag.page ?? 1;
  const limit = pag.limit ?? 20;
  const total = pag.total ?? 0;
  const totalPages = pag.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1);
  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: pag.hasNext ?? page < totalPages,
      hasPrev: pag.hasPrev ?? page > 1,
    },
  };
}

export const logsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getActionLogs: build.query<PaginatedLogs<IActionLog>, LogsQueryParams | void>({
      query: (params) => `audit/actions${buildQuery(params || undefined)}`,
      transformResponse: (r: unknown) => normalizePaginated<IActionLog>(r),
      providesTags: [{ type: 'Log', id: 'ACTIONS' }],
    }),

    getErrorLogs: build.query<PaginatedLogs<IErrorLog>, LogsQueryParams | void>({
      query: (params) => `audit/errors${buildQuery(params || undefined)}`,
      transformResponse: (r: unknown) => normalizePaginated<IErrorLog>(r),
      providesTags: [{ type: 'Log', id: 'ERRORS' }],
    }),

    resolveError: build.mutation<unknown, { errorId: string; resolvedBy: string }>({
      query: ({ errorId, resolvedBy }) => ({
        url: `audit/errors/${errorId}/resolve`,
        method: 'POST',
        body: { resolvedBy },
      }),
      invalidatesTags: [{ type: 'Log', id: 'ERRORS' }],
    }),

    deleteActionLog: build.mutation<unknown, number>({
      query: (id) => ({ url: `audit/actions/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Log', id: 'ACTIONS' }],
    }),

    deleteErrorLog: build.mutation<unknown, number>({
      query: (id) => ({ url: `audit/errors/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Log', id: 'ERRORS' }],
    }),
  }),
});

export const {
  useGetActionLogsQuery,
  useGetErrorLogsQuery,
  useResolveErrorMutation,
  useDeleteActionLogMutation,
  useDeleteErrorLogMutation,
} = logsApi;
