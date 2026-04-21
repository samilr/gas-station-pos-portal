import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { terminalService, ITerminal } from '../../../services/terminalService';

interface TerminalAutocompleteProps {
  value: number | null | undefined;
  onChange: (value: number | null, item: ITerminal | null) => void;
  siteId?: string | null;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
}

const TerminalAutocomplete: React.FC<TerminalAutocompleteProps> = ({ siteId, ...props }) => {
  const fetchTerminals = async (): Promise<ITerminal[]> => {
    const res = await terminalService.getTerminals();
    const items = res.successful ? (res.data ?? []) : [];
    return siteId ? items.filter((t) => t.siteId === siteId) : items;
  };

  return (
    <EntityAutocomplete<ITerminal, number>
      {...props}
      cacheKey={siteId ? `terminals:${siteId}` : 'terminals'}
      fetchOptions={fetchTerminals}
      getValue={(t) => t.terminalId}
      getLabel={(t) => `${t.terminalId} - ${t.name}`}
      placeholder={props.placeholder ?? 'Selecciona una terminal'}
      emptyText={siteId ? 'No hay terminales para esa sucursal' : 'No hay terminales'}
    />
  );
};

export default TerminalAutocomplete;
