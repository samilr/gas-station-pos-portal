import { api, unwrapArray } from './baseApi';
import { IProduct, ICreateProductDto, IUpdateProductDto } from '../../types/product';
import { IProductByCategory } from '../../services/productService';

export interface IProductsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IListProductsResponse {
  data: IProduct[];
  pagination: IProductsPagination | null;
}

const buildProductsQuery = (params?: IListProductsParams): string => {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.append('page', String(params.page));
  if (params.limit !== undefined) qs.append('limit', String(params.limit));
  if (params.search !== undefined && params.search.trim() !== '') {
    qs.append('search', params.search.trim());
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
};

const emptyPagination = (params?: IListProductsParams, total = 0): IProductsPagination => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? total;
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export const productsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listProducts: build.query<IListProductsResponse, IListProductsParams | void>({
      query: (params) => `products${buildProductsQuery(params ?? undefined)}`,
      transformResponse: (response: unknown, _meta, arg) => {
        const params = (arg ?? undefined) as IListProductsParams | undefined;
        const data = unwrapArray<IProduct>(response);
        const pagination =
          (response as { pagination?: IProductsPagination })?.pagination ??
          emptyPagination(params, data.length);
        return { data, pagination };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((p) => ({ type: 'Product' as const, id: p.productId })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    listProductsByCategory: build.query<IProductByCategory[], string>({
      query: (categoryId) => `products/category/${encodeURIComponent(categoryId)}`,
      transformResponse: unwrapArray<IProductByCategory>,
      providesTags: (_r, _e, categoryId) => [{ type: 'Product', id: `CAT-${categoryId}` }],
    }),

    createProduct: build.mutation<unknown, ICreateProductDto>({
      query: (body) => ({ url: 'products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: build.mutation<unknown, { productId: string; body: IUpdateProductDto }>({
      query: ({ productId, body }) => ({ url: `products/${productId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Product', id: arg.productId },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: build.mutation<unknown, string>({
      query: (productId) => ({ url: `products/${productId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, productId) => [
        { type: 'Product', id: productId },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListProductsQuery,
  useListProductsByCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
