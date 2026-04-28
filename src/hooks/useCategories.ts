import { Category } from '../services/categoryService';
import { useListCategoriesQuery } from '../store/api/categoriesApi';

/**
 * Facade sobre RTK Query que mantiene el API original: `{ categories, loading, error, refresh }`.
 * La lista se cachea automáticamente y se revalida al mutar via RTK Query
 * (`useCreateCategoryMutation`, `useUpdateCategoryMutation`, `useDeleteCategoryMutation`).
 */
export function useCategories() {
  const { data, isLoading, error, refetch } = useListCategoriesQuery();

  const categories: Category[] = data ?? [];
  const errorMessage: string | null = error
    ? ('error' in error && typeof error.error === 'string'
        ? error.error
        : 'data' in error && (error.data as { error?: string })?.error
          ? ((error.data as { error?: string }).error as string)
          : 'Error al cargar categorías')
    : null;

  return {
    categories,
    loading: isLoading,
    error: errorMessage,
    refresh: refetch,
  };
}

export default useCategories;
