import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RefreshCw,
  AlertCircle,
  UserCog,
  KeyRound,
  Lock,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fuelPumpShiftService } from '../../../services/fuelPumpShiftService';
import { IFuelPumpShift } from '../../../types/fuelPumpShift';
import { CompactButton } from '../../ui';
import { SiteAutocomplete, StaftAutocomplete, ShiftAutocomplete } from '../../ui/autocompletes';
import { useAuth } from '../../../context/AuthContext';

export type FuelPumpShiftModalMode = 'create' | 'substitute' | 'edit' | 'close';

interface FuelPumpShiftModalProps {
  isOpen: boolean;
  mode: FuelPumpShiftModalMode;
  context?: IFuelPumpShift | null;
  defaults?: {
    siteId?: string | null;
    date?: string;
    pumpId?: number;
  };
  onClose: () => void;
  onSaved: () => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const TITLE: Record<FuelPumpShiftModalMode, string> = {
  create: 'Asignar staff a bomba',
  substitute: 'Sustituir cajero (mid-turno)',
  edit: 'Corregir cajero de la línea',
  close: 'Cerrar línea abierta',
};

const ICON: Record<FuelPumpShiftModalMode, React.ComponentType<{ className?: string }>> = {
  create: UserPlus,
  substitute: UserCog,
  edit: KeyRound,
  close: Lock,
};

const FuelPumpShiftModal: React.FC<FuelPumpShiftModalProps> = ({
  isOpen,
  mode,
  context,
  defaults,
  onClose,
  onSaved,
}) => {
  const { user } = useAuth();
  const currentUserStaftId = user?.staftId ? Number(user.staftId) : null;

  const initialSiteId = mode === 'create' ? defaults?.siteId ?? null : context?.siteId ?? null;
  const initialDate =
    mode === 'create'
      ? defaults?.date ?? todayIso()
      : context
      ? context.date.slice(0, 10)
      : todayIso();
  const initialPumpId: number | '' =
    mode === 'create' ? defaults?.pumpId ?? '' : context?.pumpId ?? '';
  const initialShift: number | null = mode !== 'create' && context ? context.shift : null;
  const initialStaftId =
    (mode === 'edit' || mode === 'close') && context ? context.staftId : null;
  const initialClosedBy =
    mode === 'substitute' || mode === 'close' ? currentUserStaftId : null;

  const [siteId, setSiteId] = useState<string | null>(initialSiteId);
  const [date, setDate] = useState<string>(initialDate);
  const [pumpId, setPumpId] = useState<number | ''>(initialPumpId);
  const [shift, setShift] = useState<number | null>(initialShift);
  const [staftId, setStaftId] = useState<number | null>(initialStaftId);
  const [closedByStaftId, setClosedByStaftId] = useState<number | null>(initialClosedBy);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSaving(false);

    if (mode === 'create') {
      setSiteId(defaults?.siteId ?? null);
      setDate(defaults?.date ?? todayIso());
      setPumpId(defaults?.pumpId ?? '');
      setShift(null);
      setStaftId(null);
      setClosedByStaftId(null);
      return;
    }

    if (context) {
      setSiteId(context.siteId);
      setDate(context.date.slice(0, 10));
      setPumpId(context.pumpId);
      setShift(context.shift);

      if (mode === 'edit') {
        setStaftId(context.staftId);
        setClosedByStaftId(null);
      } else if (mode === 'substitute') {
        setStaftId(null);
        setClosedByStaftId(currentUserStaftId);
      } else if (mode === 'close') {
        setStaftId(context.staftId);
        setClosedByStaftId(currentUserStaftId);
      }
    }
  }, [isOpen, mode, context, defaults?.siteId, defaults?.date, defaults?.pumpId, currentUserStaftId]);

  if (!isOpen) return null;

  const ModeIcon = ICON[mode];
  const isContextLocked = mode !== 'create';

  const validate = (): string | null => {
    if (mode === 'create') {
      if (!siteId) return 'Selecciona una sucursal.';
      if (!date) return 'Selecciona una fecha.';
      if (pumpId === '' || Number(pumpId) <= 0) return 'Ingresa un número de bomba válido (≥ 1).';
      if (!shift || shift <= 0) return 'Selecciona un turno.';
      if (!staftId) return 'Selecciona un cajero.';
    }
    if (mode === 'substitute') {
      if (!staftId) return 'Selecciona el cajero entrante.';
      if (!closedByStaftId) return 'Selecciona quién cierra la línea actual.';
    }
    if (mode === 'edit') {
      if (!staftId) return 'Selecciona un cajero.';
    }
    if (mode === 'close') {
      if (!closedByStaftId) return 'Selecciona quién cierra la línea.';
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

    try {
      let res;
      if (mode === 'create') {
        res = await fuelPumpShiftService.create({
          siteId: siteId!,
          date,
          pumpId: Number(pumpId),
          shift: shift!,
          staftId: staftId!,
        });
      } else if (mode === 'substitute' && context) {
        res = await fuelPumpShiftService.substitute(
          context.siteId,
          context.date.slice(0, 10),
          context.pumpId,
          context.shift,
          { newStaftId: staftId!, closedByStaftId: closedByStaftId! }
        );
      } else if (mode === 'edit' && context) {
        res = await fuelPumpShiftService.update(
          context.siteId,
          context.date.slice(0, 10),
          context.pumpId,
          context.shift,
          context.line,
          { staftId: staftId! }
        );
      } else if (mode === 'close' && context) {
        res = await fuelPumpShiftService.close(
          context.siteId,
          context.date.slice(0, 10),
          context.pumpId,
          context.shift,
          { closedByStaftId: closedByStaftId! }
        );
      }

      setSaving(false);
      if (res?.successful) {
        toast.success(
          mode === 'create'
            ? 'Asignación creada'
            : mode === 'substitute'
            ? 'Sustitución registrada'
            : mode === 'edit'
            ? 'Cajero actualizado'
            : 'Línea cerrada'
        );
        onSaved();
      } else {
        setError(res?.error || 'No se pudo completar la operación.');
      }
    } catch {
      setSaving(false);
      setError('Error de conexión. Intenta nuevamente.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-9 bg-table-header border-b border-table-border px-3 flex items-center gap-2">
          <ModeIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-text-primary">{TITLE[mode]}</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto p-0.5 text-gray-400 hover:text-gray-700 rounded-sm"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          {error && (
            <div className="flex items-start gap-2 p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="break-words">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
              Sucursal
            </label>
            <SiteAutocomplete
              value={siteId}
              onChange={(v) => setSiteId(v)}
              required
              disabled={isContextLocked}
              allowClear={!isContextLocked}
            />
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isContextLocked}
              className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Bomba
              </label>
              <input
                type="number"
                min={1}
                value={pumpId}
                onChange={(e) => setPumpId(e.target.value === '' ? '' : Number(e.target.value))}
                required
                disabled={isContextLocked}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Turno
              </label>
              <ShiftAutocomplete
                value={shift}
                onChange={(v) => setShift(v)}
                required
                disabled={isContextLocked}
                allowClear={!isContextLocked}
              />
            </div>
          </div>

          {(mode === 'substitute' || mode === 'close') && context && (
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-2">
              <p className="text-2xs uppercase tracking-wide text-blue-700 mb-0.5">
                Línea abierta actual
              </p>
              <p className="text-xs text-blue-900">
                Línea <strong>{context.line}</strong> · Cajero{' '}
                <strong>{context.staftId}</strong>
              </p>
            </div>
          )}

          {mode === 'edit' && context && (
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-2">
              <p className="text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                Línea a corregir
              </p>
              <p className="text-xs text-gray-800">
                Línea <strong>{context.line}</strong>
              </p>
            </div>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                {mode === 'create' ? 'Cajero asignado' : 'Cajero (corregir)'}
              </label>
              <StaftAutocomplete
                value={staftId}
                onChange={(v) => setStaftId(v)}
                siteId={siteId}
                required
              />
            </div>
          )}

          {mode === 'substitute' && (
            <>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                  Nuevo cajero (entrante)
                </label>
                <StaftAutocomplete
                  value={staftId}
                  onChange={(v) => setStaftId(v)}
                  siteId={siteId}
                  required
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                  Cerrado por
                </label>
                <StaftAutocomplete
                  value={closedByStaftId}
                  onChange={(v) => setClosedByStaftId(v)}
                  siteId={siteId}
                  required
                />
              </div>
            </>
          )}

          {mode === 'close' && (
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Cerrado por
              </label>
              <StaftAutocomplete
                value={closedByStaftId}
                onChange={(v) => setClosedByStaftId(v)}
                siteId={siteId}
                required
              />
            </div>
          )}

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
        </form>
      </div>
    </div>
  );
};

export default FuelPumpShiftModal;
