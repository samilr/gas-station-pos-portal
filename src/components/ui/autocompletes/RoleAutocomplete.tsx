import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { roleService } from '../../../services/roleService';
import { IRole } from '../../../types/role';

interface RoleAutocompleteProps {
  value: number | null | undefined;
  onChange: (value: number | null, item: IRole | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
}

const fetchRoles = async (): Promise<IRole[]> => {
  const res = await roleService.getRoles();
  return res.successful ? (res.data ?? []) : [];
};

const RoleAutocomplete: React.FC<RoleAutocompleteProps> = (props) => (
  <EntityAutocomplete<IRole, number>
    {...props}
    cacheKey="roles"
    fetchOptions={fetchRoles}
    getValue={(r) => r.roleId}
    getLabel={(r) => `${r.roleId} - ${r.name}`}
    placeholder={props.placeholder ?? 'Selecciona un rol'}
    emptyText="No hay roles"
  />
);

export default RoleAutocomplete;
