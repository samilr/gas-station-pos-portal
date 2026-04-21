import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { getAllProducts } from '../../../services/productService';
import { IProduct } from '../../../types/product';

interface ProductAutocompleteProps {
  value: string | null | undefined;
  onChange: (value: string | null, item: IProduct | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
}

const fetchProducts = async (): Promise<IProduct[]> => {
  try {
    return await getAllProducts();
  } catch {
    return [];
  }
};

const ProductAutocomplete: React.FC<ProductAutocompleteProps> = (props) => (
  <EntityAutocomplete<IProduct, string>
    {...props}
    cacheKey="products"
    fetchOptions={fetchProducts}
    getValue={(p) => p.product_id}
    getLabel={(p) => `${p.product_id} - ${p.name}`}
    placeholder={props.placeholder ?? 'Selecciona un producto'}
    emptyText="No hay productos"
  />
);

export default ProductAutocomplete;
