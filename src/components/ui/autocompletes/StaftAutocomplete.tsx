import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { staftService } from '../../../services/staftService';
import { IStaft } from '../../../types/staft';

interface StaftAutocompleteProps {
  value: number | null | undefined;
  onChange: (value: number | null, item: IStaft | null) => void;
  siteId?: string | null;
  onlyNonManager?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
}

const StaftAutocomplete: React.FC<StaftAutocompleteProps> = ({ siteId, onlyNonManager, ...props }) => {
  const fetchStaft = async (): Promise<IStaft[]> => {
    // Si hay siteId, usamos el endpoint filtrado; si no, el admin (todos).
    const res = siteId
      ? await staftService.getStaftByPista(siteId)
      : await staftService.getStaftAdmin();
    const items = res.successful ? (res.data ?? []) : [];
    return onlyNonManager ? items.filter((s) => !s.isManager) : items;
  };

  const cacheKey = `staft:${siteId ?? 'all'}:${onlyNonManager ? 'nm' : 'all'}`;

  return (
    <EntityAutocomplete<IStaft, number>
      {...props}
      cacheKey={cacheKey}
      fetchOptions={fetchStaft}
      getValue={(s) => s.staftId}
      getLabel={(s) => `${s.staftId} - ${s.name}`}
      placeholder={props.placeholder ?? 'Selecciona un cajero'}
      emptyText={siteId ? 'No hay cajeros para esa sucursal' : 'No hay cajeros'}
    />
  );
};

export default StaftAutocomplete;
