import React, { useEffect, useState } from 'react';
import {
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Wand2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fuelTransactionReconcileService,
  ReconcileStaftResult,
} from '../../../services/fuelTransactionReconcileService';
import { CompactButton } from '../../ui';
import { SiteAutocomplete } from '../../ui/autocompletes';

interface ReconcileStaftModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaults?: {
    siteId?: string | null;
    startDate?: string;
    endDate?: string;
    pumpId?: number;
  };
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const daysAgoIso = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const ReconcileStaftModal: React.FC<ReconcileStaftModalProps> = ({
  isOpen,
  onClose,
  defaults,
}) => {
  const [siteId, setSiteId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(daysAgoIso(7));
  const [endDate, setEndDate] = useState<string>(todayIso());
  const [pumpId, setPumpId] = useState<number | ''>('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReconcileStaftResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSiteId(defaults?.siteId ?? null);
    setStartDate(defaults?.startDate ?? daysAgoIso(7));
    setEndDate(defaults?.endDate ?? todayIso());
    setPumpId(defaults?.pumpId ?? '');
    setError('');
    setResult(null);
    setRunning(false);
  }, [isOpen, defaults?.siteId, defaults?.startDate, defaults?.endDate, defaults?.pumpId]);

  if (!isOpen) return null;

  const validate = (): string | null => {
    if (!siteId) return 'Selecciona una sucursal.';
    if (!startDate) return 'Selecciona una fecha inicial.';
    if (!endDate) return 'Selecciona una fecha final.';
    if (endDate < startDate) return 'La fecha final no puede ser anterior a la inicial.';
    return null;
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setRunning(true);
    setResult(null);

    const res = await fuelTransactionReconcileService.reconcileStaft({
      siteId: siteId!,
      startDate,
      endDate,
      pumpId: pumpId === '' ? null : Number(pumpId),
    });

    setRunning(false);
    if (res.successful && res.data) {
      setResult(res.data);
      toast.success(`${res.data.updated} ventas asignadas`);
    } else {
      setError(res.error || 'No se pudo completar la reconciliación.');
    }
  };

  const reset = () => {
    setResult(null);
    setError('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={running ? undefined : onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-9 bg-table-header border-b border-table-border px-3 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-text-primary">
            Reconciliar atribución de ventas
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={running}
            className="ml-auto p-0.5 text-gray-400 hover:text-gray-700 rounded-sm disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleRun} className="p-3 space-y-3">
          <p className="text-xs text-text-muted leading-relaxed">
            Asigna staff a las ventas de combustible con <code className="text-2xs">staft_id</code>{' '}
            NULL en el rango. Idempotente: nunca sobrescribe atribuciones existentes.
          </p>

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
              disabled={running}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Desde
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={running}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Hasta
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                disabled={running}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
              Bomba (opcional)
            </label>
            <input
              type="number"
              min={1}
              placeholder="Todas las bombas"
              value={pumpId}
              onChange={(e) => setPumpId(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={running}
              className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {result && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 border border-gray-200 rounded-sm p-2">
                  <p className="text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                    Encontradas
                  </p>
                  <p className="text-lg font-bold text-gray-900">{result.totalCandidates}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-sm p-2">
                  <p className="text-2xs uppercase tracking-wide text-green-700 mb-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Asignadas
                  </p>
                  <p className="text-lg font-bold text-green-900">{result.updated}</p>
                </div>
                <div
                  className={`rounded-sm p-2 border ${
                    result.noShiftFound > 0
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p
                    className={`text-2xs uppercase tracking-wide mb-0.5 flex items-center gap-1 ${
                      result.noShiftFound > 0 ? 'text-amber-700' : 'text-gray-500'
                    }`}
                  >
                    {result.noShiftFound > 0 && <AlertTriangle className="w-3 h-3" />}
                    Sin turno
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      result.noShiftFound > 0 ? 'text-amber-900' : 'text-gray-900'
                    }`}
                  >
                    {result.noShiftFound}
                  </p>
                </div>
                <div
                  className={`rounded-sm p-2 border ${
                    result.noAssignmentFound > 0
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p
                    className={`text-2xs uppercase tracking-wide mb-0.5 flex items-center gap-1 ${
                      result.noAssignmentFound > 0 ? 'text-orange-700' : 'text-gray-500'
                    }`}
                  >
                    {result.noAssignmentFound > 0 && <AlertTriangle className="w-3 h-3" />}
                    Sin asignación
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      result.noAssignmentFound > 0 ? 'text-orange-900' : 'text-gray-900'
                    }`}
                  >
                    {result.noAssignmentFound}
                  </p>
                </div>
              </div>

              {result.noShiftFound > 0 && (
                <div className="flex items-start gap-2 p-2 border border-amber-200 bg-amber-50 rounded-sm text-xs text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    Hay {result.noShiftFound} venta(s) cuya hora no cae en ningún turno definido.
                    Revisa la tabla de turnos o ventas fuera de horario.
                  </span>
                </div>
              )}

              {result.noAssignmentFound > 0 && (
                <div className="flex items-start gap-2 p-2 border border-orange-200 bg-orange-50 rounded-sm text-xs text-orange-800">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    {result.noAssignmentFound} venta(s) tienen turno OK pero no había línea activa
                    en ese instante. Carga las asignaciones faltantes en{' '}
                    <strong>Asignación por Bomba</strong> y vuelve a ejecutar.
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-table-border">
            {result && (
              <CompactButton type="button" variant="ghost" onClick={reset} disabled={running}>
                Volver a ejecutar
              </CompactButton>
            )}
            <CompactButton type="button" variant="ghost" onClick={onClose} disabled={running}>
              Cerrar
            </CompactButton>
            {!result && (
              <CompactButton type="submit" variant="primary" disabled={running}>
                {running ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    Ejecutar
                  </>
                )}
              </CompactButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReconcileStaftModal;
