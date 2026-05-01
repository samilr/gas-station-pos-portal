import React, { useState, useMemo } from 'react';
import { X, Save, RefreshCw, AlertCircle, Clock, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { shiftService } from '../../../services/shiftService';
import { IShift } from '../../../types/shift';
import { CompactButton } from '../../ui';

interface ShiftModalProps {
  shift: IShift | null;
  onClose: () => void;
  onSaved: () => void;
}

const hhmmssToTime = (s: string | null): string => {
  if (!s || s.length < 4) return '';
  return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
};

const timeToHhmmss = (s: string): string | null => {
  if (!s) return null;
  const m = s.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  return `${m[1]}${m[2]}00`;
};

const ShiftModal: React.FC<ShiftModalProps> = ({ shift, onClose, onSaved }) => {
  const isEdit = !!shift;

  const [shiftNumber, setShiftNumber] = useState<number | ''>(shift?.shiftNumber ?? '');
  const [entryHour, setEntryHour] = useState<string>(hhmmssToTime(shift?.entryHour ?? null));
  const [departureHour, setDepartureHour] = useState<string>(
    hhmmssToTime(shift?.departureHour ?? null)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const wrapsMidnight = useMemo(() => {
    if (!entryHour || !departureHour) return false;
    return entryHour > departureHour;
  }, [entryHour, departureHour]);

  const validate = (): string | null => {
    if (!isEdit) {
      if (shiftNumber === '' || Number(shiftNumber) < 1 || Number(shiftNumber) > 255) {
        return 'El número de turno debe estar entre 1 y 255.';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setSaving(true);

    const entryHmmss = timeToHhmmss(entryHour);
    const departureHmmss = timeToHhmmss(departureHour);

    const res = isEdit
      ? await shiftService.updateShift(shift!.shiftNumber, {
          entryHour: entryHmmss,
          departureHour: departureHmmss,
        })
      : await shiftService.createShift({
          shiftNumber: Number(shiftNumber),
          entryHour: entryHmmss,
          departureHour: departureHmmss,
        });

    setSaving(false);
    if (res.successful) {
      toast.success(isEdit ? 'Turno actualizado' : 'Turno creado');
      onSaved();
    } else {
      setError(res.error || 'No se pudo guardar el turno.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={saving ? undefined : onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-sm w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-9 bg-table-header border-b border-table-border px-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-text-primary">
            {isEdit ? `Editar turno ${shift!.shiftNumber}` : 'Nuevo turno'}
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="ml-auto p-0.5 text-gray-400 hover:text-gray-700 rounded-sm disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-3">
          <p className="text-xs text-text-muted leading-relaxed">
            Las horas se guardan como <code className="text-2xs">HHMMSS</code> en la base. Si la
            hora de entrada es posterior a la de salida, el turno cruza la medianoche.
          </p>

          {error && (
            <div className="flex items-start gap-2 p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="break-words">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
              Número de turno
            </label>
            <input
              type="number"
              min={1}
              max={255}
              value={shiftNumber}
              onChange={(e) =>
                setShiftNumber(e.target.value === '' ? '' : Number(e.target.value))
              }
              required={!isEdit}
              disabled={isEdit || saving}
              placeholder="1 - 255"
              className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {isEdit && (
              <p className="text-2xs text-text-muted mt-0.5">
                El número de turno es inmutable. Para cambiarlo, eliminá y creá un nuevo turno.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Hora de entrada
              </label>
              <input
                type="time"
                value={entryHour}
                onChange={(e) => setEntryHour(e.target.value)}
                disabled={saving}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Hora de salida
              </label>
              <input
                type="time"
                value={departureHour}
                onChange={(e) => setDepartureHour(e.target.value)}
                disabled={saving}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-2xs uppercase tracking-wide text-text-muted">Tipo</span>
            {entryHour && departureHour ? (
              wrapsMidnight ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium bg-purple-100 text-purple-700">
                  <Moon className="w-3 h-3" />
                  Cruza medianoche
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium bg-amber-50 text-amber-700">
                  <Sun className="w-3 h-3" />
                  Diurno
                </span>
              )
            ) : (
              <span className="text-2xs text-text-muted">Define ambas horas para clasificar</span>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-table-border">
            <CompactButton type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </CompactButton>
            <CompactButton type="submit" variant="primary" disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Guardar
                </>
              )}
            </CompactButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShiftModal;
