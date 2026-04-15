import React, { useEffect, useState } from 'react';
import { Monitor, Save, X, Edit, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import dataphoneTerminalService, { DataphoneTerminal } from '../../../services/dataphoneTerminalService';
import dataphoneService, { Dataphone } from '../../../services/dataphoneService';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  terminal?: DataphoneTerminal | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

interface FormState {
  dataphoneId: number | '';
  siteId: string;
  terminalId: number | '';
  dataphoneIp: string;
  terminalIp: string;
  closingManually: boolean;
  active: boolean;
}

const EMPTY: FormState = {
  dataphoneId: '', siteId: '', terminalId: '',
  dataphoneIp: '', terminalIp: '', closingManually: true, active: true,
};

const DataphoneTerminalModal: React.FC<Props> = ({ isOpen, onClose, terminal, mode, onSuccess }) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [dataphones, setDataphones] = useState<Dataphone[]>([]);

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';
  const isKeyLocked = isViewing || isEditing;

  useEffect(() => {
    if (!isOpen) return;
    dataphoneService.list().then((r) => setDataphones(r.data));
    if (terminal && (isEditing || isViewing)) {
      setForm({
        dataphoneId: terminal.dataphoneId,
        siteId: terminal.siteId,
        terminalId: terminal.terminalId,
        dataphoneIp: terminal.dataphoneIp,
        terminalIp: terminal.terminalIp,
        closingManually: terminal.closingManually,
        active: terminal.active,
      });
    } else setForm(EMPTY);
  }, [isOpen, terminal, isEditing, isViewing]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;
    setLoading(true);
    try {
      if (isCreating) {
        if (form.dataphoneId === '' || !form.siteId || form.terminalId === '' || !form.dataphoneIp || !form.terminalIp) {
          toast.error('Completa los campos obligatorios');
          setLoading(false);
          return;
        }
        const payload = {
          dataphoneId: Number(form.dataphoneId),
          siteId: form.siteId,
          terminalId: Number(form.terminalId),
          dataphoneIp: form.dataphoneIp,
          terminalIp: form.terminalIp,
          closingManually: form.closingManually,
          active: form.active,
        };
        const res = await dataphoneTerminalService.create(payload);
        if (res.successful) { toast.success('Mapeo creado'); onSuccess(); onClose(); }
        else toast.error(res.error || 'Error al crear');
      } else if (isEditing && terminal) {
        const payload = {
          dataphoneIp: form.dataphoneIp,
          terminalIp: form.terminalIp,
          closingManually: form.closingManually,
          active: form.active,
        };
        const res = await dataphoneTerminalService.update(
          { dataphoneId: terminal.dataphoneId, siteId: terminal.siteId, terminalId: terminal.terminalId },
          payload,
        );
        if (res.successful) { toast.success('Mapeo actualizado'); onSuccess(); onClose(); }
        else toast.error(res.error || 'Error al actualizar');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const HeaderIcon = isEditing ? Edit : isViewing ? Monitor : Plus;
  const headerColor = isEditing ? 'green' : 'blue';
  const inputCls = (disabled: boolean) =>
    `w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-xl shadow-xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-${headerColor}-100 rounded-sm flex items-center justify-center`}>
              <HeaderIcon className={`w-4 h-4 text-${headerColor}-600`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {isViewing ? 'Ver Mapeo' : isEditing ? 'Editar Mapeo' : 'Nuevo Mapeo'}
              </h3>
              <p className="text-2xs text-text-muted">
                {terminal ? `DP#${terminal.dataphoneId} · ${terminal.siteId} · T${terminal.terminalId}` : 'Mapeo dataphone ↔ terminal POS'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Dataphone *</label>
              <select value={form.dataphoneId}
                onChange={(e) => update('dataphoneId', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={isKeyLocked} required className={inputCls(isKeyLocked)}>
                <option value="">— Selecciona —</option>
                {dataphones.map((d) => <option key={d.dataphoneId} value={d.dataphoneId}>#{d.dataphoneId} · {d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Site ID *</label>
              <input type="text" value={form.siteId} onChange={(e) => update('siteId', e.target.value)}
                disabled={isKeyLocked} required className={inputCls(isKeyLocked)} placeholder="CO-0017" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Terminal ID *</label>
              <input type="number" value={form.terminalId}
                onChange={(e) => update('terminalId', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={isKeyLocked} required min={1} className={inputCls(isKeyLocked)} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">IP Dataphone *</label>
              <input type="text" value={form.dataphoneIp} onChange={(e) => update('dataphoneIp', e.target.value)}
                disabled={isViewing} required className={inputCls(isViewing)} placeholder="192.168.125.36" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">IP Terminal *</label>
              <input type="text" value={form.terminalIp} onChange={(e) => update('terminalIp', e.target.value)}
                disabled={isViewing} required className={inputCls(isViewing)} placeholder="192.168.125.25" />
            </div>
          </div>
          <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
            <span className="text-xs text-text-primary">Cierre manual</span>
            <input type="checkbox" checked={form.closingManually} onChange={(e) => update('closingManually', e.target.checked)}
              disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </label>
          <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
            <span className="text-xs text-text-primary">Activo</span>
            <input type="checkbox" checked={form.active} onChange={(e) => update('active', e.target.checked)}
              disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>
            {isViewing ? 'Cerrar' : 'Cancelar'}
          </CompactButton>
          {!isViewing && (
            <CompactButton type="submit" variant="primary" disabled={loading}>
              {loading ? (<><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</>) : (<><Save className="w-3 h-3" /> Guardar</>)}
            </CompactButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default DataphoneTerminalModal;
