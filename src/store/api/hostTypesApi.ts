import { api, unwrapArray } from './baseApi';
import { IHostType } from '../../services/hostTypeService';

interface CreateHostTypeRequest {
  name: string;
  description?: string;
  active: boolean;
  code?: string;
  hasPrinter?: boolean;
}

interface UpdateHostTypeRequest {
  name?: string;
  description?: string;
  active?: boolean;
  code?: string;
  hasPrinter?: boolean;
}

export const hostTypesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listHostTypes: build.query<IHostType[], void>({
      query: () => 'host-types',
      transformResponse: unwrapArray<IHostType>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((h) => ({ type: 'HostType' as const, id: h.hostTypeId })),
              { type: 'HostType' as const, id: 'LIST' },
            ]
          : [{ type: 'HostType' as const, id: 'LIST' }],
    }),

    createHostType: build.mutation<IHostType, CreateHostTypeRequest>({
      query: (body) => ({ url: 'host-types', method: 'POST', body }),
      invalidatesTags: [{ type: 'HostType', id: 'LIST' }],
    }),

    updateHostType: build.mutation<IHostType, { id: number; body: UpdateHostTypeRequest }>({
      query: ({ id, body }) => ({ url: `host-types/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'HostType', id: arg.id },
        { type: 'HostType', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListHostTypesQuery,
  useCreateHostTypeMutation,
  useUpdateHostTypeMutation,
} = hostTypesApi;
