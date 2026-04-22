import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { IHostType } from '../../../services/hostTypeService';
import { store } from '../../../store';
import { hostTypesApi } from '../../../store/api/hostTypesApi';

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
  const result = await store.dispatch(hostTypesApi.endpoints.listHostTypes.initiate());
  return result.data ?? [];
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
