import { api, unwrapArray } from './baseApi';
import { ITerminal } from '../../services/terminalService';

type TerminalFilters = { siteId?: string; search?: string; page?: number; limit?: number };

const buildQuery = (filters?: TerminalFilters): string => {
  const qs = new URLSearchParams();
  if (filters?.siteId) qs.append('siteId', filters.siteId);
  if (filters?.search) qs.append('search', filters.search);
  if (filters?.page !== undefined) qs.append('page', String(filters.page));
  if (filters?.limit !== undefined) qs.append('limit', String(filters.limit));
  const s = qs.toString();
  return s ? `?${s}` : '';
};

interface CreateTerminalRequest {
  siteId: string;
  terminalId: number;
  name: string;
  sectorId?: number;
  active?: boolean;
  fuelIslandId?: number | null;
  fuelIslandEnabled?: boolean;
  terminalType?: number;
  productList?: number;
  useCustomerDisplay?: boolean;
  openCashDrawer?: boolean;
  printDevice?: number;
  cashFund?: number;
  productListType?: number;
}

interface UpdateTerminalRequest {
  name?: string;
  sectorId?: number;
  active?: boolean;
  fuelIslandId?: number | null;
  unassignFuelIsland?: boolean;
  fuelIslandEnabled?: boolean;
  terminalType?: number;
  productList?: number;
  useCustomerDisplay?: boolean;
  openCashDrawer?: boolean;
  printDevice?: number;
  cashFund?: number;
  productListType?: number;
}

const tagId = (siteId: string, terminalId: number) => `${siteId}-${terminalId}`;

export const terminalsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listTerminals: build.query<ITerminal[], TerminalFilters | void>({
      query: (filters) => `terminals${buildQuery(filters || undefined)}`,
      transformResponse: unwrapArray<ITerminal>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: 'Terminal' as const, id: tagId(t.siteId, t.terminalId) })),
              { type: 'Terminal' as const, id: 'LIST' },
            ]
          : [{ type: 'Terminal' as const, id: 'LIST' }],
    }),

    getTerminal: build.query<ITerminal, { siteId: string; terminalId: number }>({
      query: ({ siteId, terminalId }) => `terminals/${siteId}/${terminalId}`,
      providesTags: (_r, _e, arg) => [{ type: 'Terminal', id: tagId(arg.siteId, arg.terminalId) }],
    }),

    createTerminal: build.mutation<unknown, CreateTerminalRequest>({
      query: (body) => ({ url: 'terminals', method: 'POST', body }),
      invalidatesTags: [{ type: 'Terminal', id: 'LIST' }],
    }),

    updateTerminal: build.mutation<
      unknown,
      { siteId: string; terminalId: number; body: UpdateTerminalRequest }
    >({
      query: ({ siteId, terminalId, body }) => ({
        url: `terminals/${siteId}/${terminalId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Terminal', id: tagId(arg.siteId, arg.terminalId) },
        { type: 'Terminal', id: 'LIST' },
      ],
    }),

    deleteTerminal: build.mutation<unknown, { siteId: string; terminalId: number }>({
      query: ({ siteId, terminalId }) => ({
        url: `terminals/${siteId}/${terminalId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Terminal', id: tagId(arg.siteId, arg.terminalId) },
        { type: 'Terminal', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListTerminalsQuery,
  useGetTerminalQuery,
  useCreateTerminalMutation,
  useUpdateTerminalMutation,
  useDeleteTerminalMutation,
} = terminalsApi;
