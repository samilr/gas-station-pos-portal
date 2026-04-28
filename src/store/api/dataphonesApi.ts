import { api, unwrapArray } from './baseApi';
import {
  Dataphone,
  CreateDataphoneRequest,
  UpdateDataphoneRequest,
  TestDataphoneRequest,
  TestDataphoneResult,
} from '../../services/dataphoneService';

type DataphoneFilters = { siteId?: string };

const buildQuery = (filters?: DataphoneFilters): string => {
  const qs = new URLSearchParams();
  if (filters?.siteId) qs.append('siteId', filters.siteId);
  const s = qs.toString();
  return s ? `?${s}` : '';
};

export const dataphonesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listDataphones: build.query<Dataphone[], DataphoneFilters | void>({
      query: (filters) => `dataphones${buildQuery(filters || undefined)}`,
      transformResponse: unwrapArray<Dataphone>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: 'Dataphone' as const, id: d.dataphoneId })),
              { type: 'Dataphone' as const, id: 'LIST' },
            ]
          : [{ type: 'Dataphone' as const, id: 'LIST' }],
    }),

    createDataphone: build.mutation<unknown, CreateDataphoneRequest>({
      query: (body) => ({ url: 'dataphones', method: 'POST', body }),
      invalidatesTags: [{ type: 'Dataphone', id: 'LIST' }],
    }),

    updateDataphone: build.mutation<unknown, { id: number; body: UpdateDataphoneRequest }>({
      query: ({ id, body }) => ({ url: `dataphones/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Dataphone', id: arg.id },
        { type: 'Dataphone', id: 'LIST' },
      ],
    }),

    deleteDataphone: build.mutation<unknown, number>({
      query: (id) => ({ url: `dataphones/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Dataphone', id },
        { type: 'Dataphone', id: 'LIST' },
      ],
    }),

    testDataphoneConnection: build.mutation<
      TestDataphoneResult,
      { id: number; body: TestDataphoneRequest }
    >({
      query: ({ id, body }) => ({
        url: `dataphones/${id}/test-connection`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useListDataphonesQuery,
  useCreateDataphoneMutation,
  useUpdateDataphoneMutation,
  useDeleteDataphoneMutation,
  useTestDataphoneConnectionMutation,
} = dataphonesApi;
