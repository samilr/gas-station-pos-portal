import { api, unwrapArray } from './baseApi';
import {
  Dispenser,
  CreateDispenserRequest,
  UpdateDispenserRequest,
} from '../../services/dispensersConfigService';

type Filters = { siteId?: string; ptsId?: string };

const buildQuery = (filters?: Filters): string => {
  const qs = new URLSearchParams();
  if (filters?.siteId) qs.append('siteId', filters.siteId);
  if (filters?.ptsId) qs.append('ptsId', filters.ptsId);
  const s = qs.toString();
  return s ? `?${s}` : '';
};

export const dispensersConfigApi = api.injectEndpoints({
  endpoints: (build) => ({
    listDispensersConfig: build.query<Dispenser[], Filters | void>({
      query: (filters) => `dispensers-config${buildQuery(filters || undefined)}`,
      transformResponse: unwrapArray<Dispenser>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: 'DispenserConfig' as const, id: d.dispenserId })),
              { type: 'DispenserConfig' as const, id: 'LIST' },
            ]
          : [{ type: 'DispenserConfig' as const, id: 'LIST' }],
    }),

    createDispenserConfig: build.mutation<unknown, CreateDispenserRequest>({
      query: (body) => ({ url: 'dispensers-config', method: 'POST', body }),
      invalidatesTags: [{ type: 'DispenserConfig', id: 'LIST' }],
    }),

    updateDispenserConfig: build.mutation<unknown, { id: number; body: UpdateDispenserRequest }>({
      query: ({ id, body }) => ({ url: `dispensers-config/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'DispenserConfig', id: arg.id },
        { type: 'DispenserConfig', id: 'LIST' },
      ],
    }),

    deleteDispenserConfig: build.mutation<unknown, number>({
      query: (id) => ({ url: `dispensers-config/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'DispenserConfig', id },
        { type: 'DispenserConfig', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListDispensersConfigQuery,
  useCreateDispenserConfigMutation,
  useUpdateDispenserConfigMutation,
  useDeleteDispenserConfigMutation,
} = dispensersConfigApi;
