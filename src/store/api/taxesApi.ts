import { api, unwrapArray } from './baseApi';
import {
  ITax,
  ITaxType,
  ITaxLine,
  ICreateTaxDto,
  IUpdateTaxDto,
  ICreateTaxTypeDto,
  IUpdateTaxTypeDto,
  ICreateTaxLineDto,
  IUpdateTaxLineDto,
} from '../../types/tax';

export const taxesApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Taxes
    listTaxes: build.query<ITax[], void>({
      query: () => 'taxes',
      transformResponse: unwrapArray<ITax>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: 'TaxType' as const, id: `TAX-${t.taxId}` })),
              { type: 'TaxType' as const, id: 'TAX-LIST' },
            ]
          : [{ type: 'TaxType' as const, id: 'TAX-LIST' }],
    }),
    createTax: build.mutation<unknown, ICreateTaxDto>({
      query: (body) => ({ url: 'taxes', method: 'POST', body }),
      invalidatesTags: [{ type: 'TaxType', id: 'TAX-LIST' }],
    }),
    updateTax: build.mutation<unknown, { taxId: string; body: IUpdateTaxDto }>({
      query: ({ taxId, body }) => ({ url: `taxes/${taxId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'TaxType', id: `TAX-${arg.taxId}` },
        { type: 'TaxType', id: 'TAX-LIST' },
      ],
    }),
    deleteTax: build.mutation<unknown, string>({
      query: (taxId) => ({ url: `taxes/${taxId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, taxId) => [
        { type: 'TaxType', id: `TAX-${taxId}` },
        { type: 'TaxType', id: 'TAX-LIST' },
      ],
    }),

    // Tax Types
    listTaxTypes: build.query<ITaxType[], void>({
      query: () => 'tax-types',
      transformResponse: unwrapArray<ITaxType>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: 'TaxType' as const, id: t.taxTypeId })),
              { type: 'TaxType' as const, id: 'LIST' },
            ]
          : [{ type: 'TaxType' as const, id: 'LIST' }],
    }),
    createTaxType: build.mutation<unknown, ICreateTaxTypeDto>({
      query: (body) => ({ url: 'tax-types', method: 'POST', body }),
      invalidatesTags: [{ type: 'TaxType', id: 'LIST' }],
    }),
    updateTaxType: build.mutation<unknown, { taxTypeId: number; body: IUpdateTaxTypeDto }>({
      query: ({ taxTypeId, body }) => ({ url: `tax-types/${taxTypeId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'TaxType', id: arg.taxTypeId },
        { type: 'TaxType', id: 'LIST' },
      ],
    }),
    deleteTaxType: build.mutation<unknown, number>({
      query: (taxTypeId) => ({ url: `tax-types/${taxTypeId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, taxTypeId) => [
        { type: 'TaxType', id: taxTypeId },
        { type: 'TaxType', id: 'LIST' },
      ],
    }),

    // Tax Lines (por taxId)
    listTaxLines: build.query<ITaxLine[], string>({
      query: (taxId) => `tax-lines?taxId=${taxId}`,
      transformResponse: unwrapArray<ITaxLine>,
      providesTags: (_r, _e, taxId) => [{ type: 'TaxLine', id: `TAX-${taxId}` }],
    }),
    createTaxLine: build.mutation<unknown, ICreateTaxLineDto>({
      query: (body) => ({ url: 'tax-lines', method: 'POST', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'TaxLine', id: `TAX-${arg.taxId}` }],
    }),
    updateTaxLine: build.mutation<unknown, { taxId: string; line: number; body: IUpdateTaxLineDto }>({
      query: ({ taxId, line, body }) => ({ url: `tax-lines/${taxId}/${line}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'TaxLine', id: `TAX-${arg.taxId}` }],
    }),
    deleteTaxLine: build.mutation<unknown, { taxId: string; line: number }>({
      query: ({ taxId, line }) => ({ url: `tax-lines/${taxId}/${line}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, arg) => [{ type: 'TaxLine', id: `TAX-${arg.taxId}` }],
    }),
  }),
});

export const {
  useListTaxesQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
  useDeleteTaxMutation,
  useListTaxTypesQuery,
  useCreateTaxTypeMutation,
  useUpdateTaxTypeMutation,
  useDeleteTaxTypeMutation,
  useListTaxLinesQuery,
  useCreateTaxLineMutation,
  useUpdateTaxLineMutation,
  useDeleteTaxLineMutation,
} = taxesApi;
