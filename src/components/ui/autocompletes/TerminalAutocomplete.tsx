import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { ITerminal } from '../../../services/terminalService';
import { store } from '../../../store';
import { terminalsApi } from '../../../store/api/terminalsApi';

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
    // Pedimos un límite alto porque el endpoint pagina con default 50 y el autocomplete necesita todo.
    const result = await store.dispatch(terminalsApi.endpoints.listTerminals.initiate({ limit: 1000 }));
    const items = result.data ?? [];
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
