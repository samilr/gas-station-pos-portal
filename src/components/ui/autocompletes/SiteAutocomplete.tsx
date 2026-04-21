import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { siteService } from '../../../services/siteService';
import { ISite } from '../../../types/site';

interface SiteAutocompleteProps {
  value: string | null | undefined;
  onChange: (value: string | null, item: ISite | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
}

const fetchSites = async (): Promise<ISite[]> => {
  const res = await siteService.getAllSites();
  return res.successful ? res.data : [];
};

const SiteAutocomplete: React.FC<SiteAutocompleteProps> = (props) => (
  <EntityAutocomplete<ISite, string>
    {...props}
    cacheKey="sites"
    fetchOptions={fetchSites}
    getValue={(s) => s.siteId}
    getLabel={(s) => `${s.siteId} - ${s.name}`}
    placeholder={props.placeholder ?? 'Selecciona una sucursal'}
    emptyText="No hay sucursales"
  />
);

export default SiteAutocomplete;
