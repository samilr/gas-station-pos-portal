import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { Category } from '../../../services/categoryService';
import { store } from '../../../store';
import { categoriesApi } from '../../../store/api/categoriesApi';

interface CategoryAutocompleteProps {
  value: string | null | undefined;
  onChange: (value: string | null, item: Category | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
  excludeId?: string;
}

const fetchCategories = async (): Promise<Category[]> => {
  const result = await store.dispatch(categoriesApi.endpoints.listCategories.initiate());
  return result.data ?? [];
};

const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({ excludeId, ...props }) => (
  <EntityAutocomplete<Category, string>
    {...props}
    cacheKey="categories"
    fetchOptions={async () => {
      const list = await fetchCategories();
      return excludeId ? list.filter(c => c.categoryId !== excludeId) : list;
    }}
    getValue={(c) => c.categoryId}
    getLabel={(c) => `${c.categoryId} - ${c.categoryName}`}
    placeholder={props.placeholder ?? 'Selecciona una categoría'}
    emptyText="No hay categorías"
  />
);

export default CategoryAutocomplete;
