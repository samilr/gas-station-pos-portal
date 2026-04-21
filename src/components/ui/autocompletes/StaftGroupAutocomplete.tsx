import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { staftGroupService } from '../../../services/staftGroupService';
import { IStaftGroup } from '../../../types/staftGroup';

interface StaftGroupAutocompleteProps {
  value: number | null | undefined;
  onChange: (value: number | null, item: IStaftGroup | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
}

const fetchStaftGroups = async (): Promise<IStaftGroup[]> => {
  const res = await staftGroupService.getStaftGroups();
  return res.successful ? (res.data ?? []) : [];
};

const StaftGroupAutocomplete: React.FC<StaftGroupAutocompleteProps> = (props) => (
  <EntityAutocomplete<IStaftGroup, number>
    {...props}
    cacheKey="staftGroups"
    fetchOptions={fetchStaftGroups}
    getValue={(g) => g.staftGroupId}
    getLabel={(g) => `${g.staftGroupId} - ${g.name}`}
    placeholder={props.placeholder ?? 'Selecciona un grupo'}
    emptyText="No hay grupos"
  />
);

export default StaftGroupAutocomplete;
