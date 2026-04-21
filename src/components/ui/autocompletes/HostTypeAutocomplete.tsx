import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { hostTypeService, IHostType } from '../../../services/hostTypeService';

interface HostTypeAutocompleteProps {
  value: number | null | undefined;
  onChange: (value: number | null, item: IHostType | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
}

const fetchHostTypes = async (): Promise<IHostType[]> => {
  const res = await hostTypeService.getHostTypes();
  return res.successful ? (res.data ?? []) : [];
};

const HostTypeAutocomplete: React.FC<HostTypeAutocompleteProps> = (props) => (
  <EntityAutocomplete<IHostType, number>
    {...props}
    cacheKey="hostTypes"
    fetchOptions={fetchHostTypes}
    getValue={(h) => h.hostTypeId}
    getLabel={(h) => `${h.hostTypeId} - ${h.name}`}
    placeholder={props.placeholder ?? 'Selecciona un tipo de dispositivo'}
    emptyText="No hay tipos de dispositivo"
  />
);

export default HostTypeAutocomplete;
