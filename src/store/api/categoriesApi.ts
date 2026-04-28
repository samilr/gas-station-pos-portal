import { api } from './baseApi';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../services/categoryService';

export const categoriesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listCategories: build.query<Category[], void>({
      query: () => 'categories',
      transformResponse: (response: unknown): Category[] => {
        if (Array.isArray(response)) return response;
        const nested = (response as { data?: unknown })?.data;
        return Array.isArray(nested) ? (nested as Category[]) : [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: 'Category' as const, id: c.categoryId })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),

    createCategory: build.mutation<Category | null, CreateCategoryRequest>({
      query: (body) => ({ url: 'categories', method: 'POST', body }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updateCategory: build.mutation<Category | null, { categoryId: string; body: UpdateCategoryRequest }>({
      query: ({ categoryId, body }) => ({
        url: `categories/${encodeURIComponent(categoryId)}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Category', id: arg.categoryId },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    deleteCategory: build.mutation<void, string>({
      query: (categoryId) => ({
        url: `categories/${encodeURIComponent(categoryId)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, categoryId) => [
        { type: 'Category', id: categoryId },
        { type: 'Category', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
