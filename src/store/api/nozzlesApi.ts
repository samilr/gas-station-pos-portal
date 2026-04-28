import { api, unwrapArray } from './baseApi';
import { Nozzle, CreateNozzleRequest, UpdateNozzleRequest } from '../../services/nozzleService';

type NozzleFilters = { dispenserId?: number; productId?: string };

const buildQuery = (f?: NozzleFilters): string => {
  const qs = new URLSearchParams();
  if (f?.dispenserId != null) qs.append('dispenserId', String(f.dispenserId));
  if (f?.productId) qs.append('productId', f.productId);
  const s = qs.toString();
  return s ? `?${s}` : '';
};

export const nozzlesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listNozzles: build.query<Nozzle[], NozzleFilters | void>({
      query: (filters) => `nozzles${buildQuery(filters || undefined)}`,
      transformResponse: unwrapArray<Nozzle>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((n) => ({ type: 'Nozzle' as const, id: n.nozzleId })),
              { type: 'Nozzle' as const, id: 'LIST' },
            ]
          : [{ type: 'Nozzle' as const, id: 'LIST' }],
    }),

    createNozzle: build.mutation<unknown, CreateNozzleRequest>({
      query: (body) => ({ url: 'nozzles', method: 'POST', body }),
      invalidatesTags: [{ type: 'Nozzle', id: 'LIST' }],
    }),

    updateNozzle: build.mutation<unknown, { id: number; body: UpdateNozzleRequest }>({
      query: ({ id, body }) => ({ url: `nozzles/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Nozzle', id: arg.id },
        { type: 'Nozzle', id: 'LIST' },
      ],
    }),

    deleteNozzle: build.mutation<unknown, number>({
      query: (id) => ({ url: `nozzles/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Nozzle', id },
        { type: 'Nozzle', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListNozzlesQuery,
  useCreateNozzleMutation,
  useUpdateNozzleMutation,
  useDeleteNozzleMutation,
} = nozzlesApi;
