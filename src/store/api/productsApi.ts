import { api, unwrapArray } from './baseApi';
import { IProduct, ICreateProductDto, IUpdateProductDto } from '../../types/product';
import { IProductByCategory } from '../../services/productService';

export const productsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listProducts: build.query<IProduct[], void>({
      query: () => 'products',
      transformResponse: unwrapArray<IProduct>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: 'Product' as const, id: p.product_id })),
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
