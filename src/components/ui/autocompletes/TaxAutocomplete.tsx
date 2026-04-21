import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { taxService } from '../../../services/taxService';
import { ITax } from '../../../types/tax';

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
  const res = await taxService.getTaxes();
  return res.successful ? (res.data ?? []) : [];
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
