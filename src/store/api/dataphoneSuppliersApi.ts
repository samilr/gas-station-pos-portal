import { api, unwrapArray } from './baseApi';
import {
  DataphoneSupplier,
  CreateDataphoneSupplierRequest,
  UpdateDataphoneSupplierRequest,
} from '../../services/dataphoneSupplierService';

export const dataphoneSuppliersApi = api.injectEndpoints({
  endpoints: (build) => ({
    listDataphoneSuppliers: build.query<DataphoneSupplier[], void>({
      query: () => 'dataphone-suppliers',
      transformResponse: unwrapArray<DataphoneSupplier>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({ type: 'DataphoneSupplier' as const, id: s.dataphoneSupplierId })),
              { type: 'DataphoneSupplier' as const, id: 'LIST' },
            ]
          : [{ type: 'DataphoneSupplier' as const, id: 'LIST' }],
    }),

    createDataphoneSupplier: build.mutation<unknown, CreateDataphoneSupplierRequest>({
      query: (body) => ({ url: 'dataphone-suppliers', method: 'POST', body }),
      invalidatesTags: [{ type: 'DataphoneSupplier', id: 'LIST' }],
    }),

    updateDataphoneSupplier: build.mutation<unknown, { id: number; body: UpdateDataphoneSupplierRequest }>({
      query: ({ id, body }) => ({ url: `dataphone-suppliers/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'DataphoneSupplier', id: arg.id },
        { type: 'DataphoneSupplier', id: 'LIST' },
      ],
    }),

    deleteDataphoneSupplier: build.mutation<unknown, number>({
      query: (id) => ({ url: `dataphone-suppliers/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'DataphoneSupplier', id },
        { type: 'DataphoneSupplier', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListDataphoneSuppliersQuery,
  useCreateDataphoneSupplierMutation,
  useUpdateDataphoneSupplierMutation,
  useDeleteDataphoneSupplierMutation,
} = dataphoneSuppliersApi;
