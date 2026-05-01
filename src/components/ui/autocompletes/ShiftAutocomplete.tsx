import React from 'react';
import EntityAutocomplete from '../EntityAutocomplete';
import { shiftService } from '../../../services/shiftService';
import { IShift } from '../../../types/shift';

interface ShiftAutocompleteProps {
  value: number | null | undefined;
  onChange: (value: number | null, item: IShift | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  allowClear?: boolean;
}

const formatHour = (h: string | null): string => {
  if (!h || h.length < 4) return '--:--';
  return `${h.slice(0, 2)}:${h.slice(2, 4)}`;
};

const fetchShifts = async (): Promise<IShift[]> => {
  const res = await shiftService.listShifts();
  return res.successful && Array.isArray(res.data) ? res.data : [];
};

const ShiftAutocomplete: React.FC<ShiftAutocompleteProps> = (props) => (
  <EntityAutocomplete<IShift, number>
    {...props}
    cacheKey="shifts"
    fetchOptions={fetchShifts}
    getValue={(s) => s.shiftNumber}
    getLabel={(s) =>
      `${s.shiftNumber} - ${formatHour(s.entryHour)} a ${formatHour(s.departureHour)}`
    }
    placeholder={props.placeholder ?? 'Selecciona un turno'}
    emptyText="No hay turnos definidos"
  />
);

export default ShiftAutocomplete;
