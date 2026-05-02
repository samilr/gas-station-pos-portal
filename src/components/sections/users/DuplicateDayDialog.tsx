import React, { useState } from 'react';
import { X, Copy, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { periodStaftService } from '../../../services/periodStaftService';
import { CompactButton } from '../../ui';
import { toLocalIsoDate } from '../../../utils/dateUtils';

interface Props {
  siteId: string;
  defaultSourceDate?: string;
  onClose: () => void;
  onDone: () => void;
}

const todayIso = () => toLocalIsoDate();

const addDays = (iso: string, days: number): string => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return toLocalIsoDate(d);
};

const DuplicateDayDialog: React.FC<Props> = ({ siteId, defaultSourceDate, onClose, onDone }) => {
  const [sourceDate, setSourceDate] = useState(defaultSourceDate || todayIso());
  const [targetDate, setTargetDate] = useState(addDays(defaultSourceDate || todayIso(), 1));
  const [shift, setShift] = useState<number | ''>('');
  const [overwrite, setOverwrite] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceDate === targetDate) {
      toast.error('Las fechas de origen y destino deben ser distintas');
      return;
    }
    setSaving(true);
    const res = await periodStaftService.duplicate({
      siteId,
      sourceDate,
      targetDate,
      shift: shift === '' ? null : Number(shift),
      overwrite,
    });
    setSaving(false);
    if (res.successful) {
      const { copied, skipped, replaced } = res.data;
      toast.success(`Duplicado: ${copied} copiadas, ${replaced} reemplazadas, ${skipped} omitidas`);
      onDone();
    } else {
      toast.error(res.error || 'Error al duplicar');
    }
  };

  const inputCls = 'w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-md shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-100 rounded-sm flex items-center justify-center">
              <Copy className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Duplicar programación</h3>
              <p className="text-2xs text-text-muted">Sucursal {siteId}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Fecha origen *</label>
              <input type="date" value={sourceDate} onChange={(e) => setSourceDate(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Fecha destino *</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Turno</label>
            <select value={shift} onChange={(e) => setShift(e.target.value === '' ? '' : Number(e.target.value))} className={`${inputCls} bg-white`}>
              <option value="">Todos los turnos</option>
              <option value={1}>1 · 06-14</option>
              <option value={2}>2 · 14-22</option>
              <option value={3}>3 · 22-06</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Sobrescribir si ya existe la programación destino
          </label>
          <p className="text-2xs text-gray-500 bg-gray-50 rounded-sm p-2">
            Las filas duplicadas se insertan con <span className="font-mono">closed=false</span>. Si una fila destino ya existe y <span className="font-semibold">Sobrescribir</span> está desactivado se omite (sin error); si está activado se actualizan sus campos no-PK.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
          <CompactButton type="submit" variant="primary" disabled={saving}>
            {saving ? <><RefreshCw className="w-3 h-3 animate-spin" /> Duplicando...</> : <><Copy className="w-3 h-3" /> Duplicar</>}
          </CompactButton>
        </div>
      </form>
    </div>
  );
};

export default DuplicateDayDialog;
