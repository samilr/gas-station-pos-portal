import React, { useEffect, useState } from 'react';
import { X, UserCheck, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useGetFuelTransactionShiftCandidatesQuery,
  useAssignStaftToFuelTransactionMutation,
} from '../../../store/api/fuelTransactionsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';

interface Props {
  transactionId: number;
  onClose: () => void;
  onSaved: () => void;
}

const formatHour = (h: string | null | undefined): string => {
  if (!h) return '—';
  const s = String(h).padStart(6, '0');
  return `${s.substring(0, 2)}:${s.substring(2, 4)}`;
};

const formatDate = (d: string | null | undefined): string => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('es-DO', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return d.substring(0, 10);
  }
};

const AssignStaftModal: React.FC<Props> = ({ transactionId, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [selectedStaftId, setSelectedStaftId] = useState<number | null>(null);

  const { data, isLoading: loading, error } = useGetFuelTransactionShiftCandidatesQuery(transactionId);
  const [assignStaft] = useAssignStaftToFuelTransactionMutation();

  useEffect(() => {
    if (data) setSelectedStaftId(data.currentStaftId ?? null);
  }, [data]);

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error, 'Error al cargar candidatos') ?? 'Error al cargar candidatos');
  }, [error]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await assignStaft({ id: transactionId, staftId: selectedStaftId }).unwrap();
      toast.success(selectedStaftId == null ? 'Atribución limpiada' : 'Cajero asignado');
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al asignar') ?? 'Error al asignar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-100 rounded-sm flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Asignar cajero a fuel transaction</h3>
              <p className="text-2xs text-text-muted">Trans #{transactionId}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center h-20 items-center">
              <div className="animate-spin h-6 w-6 border-b-2 border-teal-600 rounded-full" />
            </div>
          ) : !data ? (
            <div className="text-sm text-red-600">No se pudo cargar la información.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Sucursal:</span> <span className="font-mono">{data.siteId ?? '—'}</span></div>
                <div><span className="text-gray-500">Turno:</span> <span className="font-semibold">{data.shift ?? '—'}</span></div>
                <div><span className="text-gray-500">Fecha schedule:</span> {formatDate(data.scheduleDate)}</div>
                <div><span className="text-gray-500">Fecha efectiva:</span> {formatDate(data.effectiveScheduleDate)}</div>
              </div>

              {data.fallbackApplied && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Se aplicó fallback al día anterior porque no había programación para la fecha original.</span>
                </div>
              )}

              {data.reason && (
                <div className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded-sm text-xs text-gray-700">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{data.reason}</span>
                </div>
              )}

              <div>
                <div className="text-2xs uppercase tracking-wide text-text-muted mb-1">
                  Candidatos ({data.candidates.length})
                </div>
                {data.candidates.length === 0 ? (
                  <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded-sm">
                    No hay cajeros programados para este turno y fecha.
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 p-2 rounded-sm border border-gray-200 cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="staft" checked={selectedStaftId == null} onChange={() => setSelectedStaftId(null)} />
                      <span className="text-sm text-gray-600">Sin asignar (limpiar)</span>
                    </label>
                    {data.candidates.map((c) => (
                      <label key={c.staftId} className="flex items-center gap-2 p-2 rounded-sm border border-gray-200 cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="staft"
                          checked={selectedStaftId === c.staftId}
                          onChange={() => setSelectedStaftId(c.staftId)}
                        />
                        <div className="flex-1 text-sm">
                          <span className="font-mono font-semibold">#{c.staftId}</span>
                          <span className="text-gray-500 text-xs ml-2">
                            Terminal {c.terminalId ?? '—'} · {formatHour(c.entryHour)} - {formatHour(c.departureHour)}
                          </span>
                        </div>
                        {data.currentStaftId === c.staftId && (
                          <span className="text-2xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">Actual</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
          <CompactButton type="button" variant="primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? <><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</> : <><UserCheck className="w-3 h-3" /> Asignar</>}
          </CompactButton>
        </div>
      </div>
    </div>
  );
};

export default AssignStaftModal;
