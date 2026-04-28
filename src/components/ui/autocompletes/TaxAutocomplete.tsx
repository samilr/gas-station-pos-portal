import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { ITax } from '../../../types/tax';
import { store } from '../../../store';
import { taxesApi } from '../../../store/api/taxesApi';

interface TaxAutocompleteProps {
  value: string | null | undefined;
  onChange: (value: string | null, item: ITax | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
}

const fetchTaxes = async (): Promise<ITax[]> => {
  const result = await store.dispatch(taxesApi.endpoints.listTaxes.initiate());
  return result.data ?? [];
};

const TaxAutocomplete: React.FC<TaxAutocompleteProps> = (props) => (
  <EntityAutocomplete<ITax, string>
    {...props}
    cacheKey="taxes"
    fetchOptions={fetchTaxes}
    getValue={(t) => t.taxId}
    getLabel={(t) => `${t.taxId} - ${t.name}`}
    placeholder={props.placeholder ?? 'Selecciona un impuesto'}
    emptyText="No hay impuestos"
  />
);

export default TaxAutocomplete;
