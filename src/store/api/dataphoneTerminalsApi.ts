import { api, unwrapArray } from './baseApi';
import {
  DataphoneTerminal,
  CreateDataphoneTerminalRequest,
  UpdateDataphoneTerminalRequest,
  CompositeKey,
} from '../../services/dataphoneTerminalService';

type Filters = { siteId?: string };

const buildQuery = (filters?: Filters): string => {
  const qs = new URLSearchParams();
  if (filters?.siteId) qs.append('siteId', filters.siteId);
  const s = qs.toString();
  return s ? `?${s}` : '';
};

const toPath = (k: CompositeKey) =>
  `dataphone-terminals/${k.dataphoneId}/${encodeURIComponent(k.siteId)}/${k.terminalId}`;

const tagId = (k: CompositeKey) => `${k.dataphoneId}-${k.siteId}-${k.terminalId}`;

export const dataphoneTerminalsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listDataphoneTerminals: build.query<DataphoneTerminal[], Filters | void>({
      query: (filters) => `dataphone-terminals${buildQuery(filters || undefined)}`,
      transformResponse: unwrapArray<DataphoneTerminal>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({
                type: 'DataphoneTerminal' as const,
                id: tagId({ dataphoneId: t.dataphoneId, siteId: t.siteId, terminalId: t.terminalId }),
              })),
              { type: 'DataphoneTerminal' as const, id: 'LIST' },
            ]
          : [{ type: 'DataphoneTerminal' as const, id: 'LIST' }],
    }),

    createDataphoneTerminal: build.mutation<unknown, CreateDataphoneTerminalRequest>({
      query: (body) => ({ url: 'dataphone-terminals', method: 'POST', body }),
      invalidatesTags: [{ type: 'DataphoneTerminal', id: 'LIST' }],
    }),

    updateDataphoneTerminal: build.mutation<unknown, { key: CompositeKey; body: UpdateDataphoneTerminalRequest }>({
      query: ({ key, body }) => ({ url: toPath(key), method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'DataphoneTerminal', id: tagId(arg.key) },
        { type: 'DataphoneTerminal', id: 'LIST' },
      ],
    }),

    deleteDataphoneTerminal: build.mutation<unknown, CompositeKey>({
      query: (key) => ({ url: toPath(key), method: 'DELETE' }),
      invalidatesTags: (_r, _e, key) => [
        { type: 'DataphoneTerminal', id: tagId(key) },
        { type: 'DataphoneTerminal', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListDataphoneTerminalsQuery,
  useCreateDataphoneTerminalMutation,
  useUpdateDataphoneTerminalMutation,
  useDeleteDataphoneTerminalMutation,
} = dataphoneTerminalsApi;
