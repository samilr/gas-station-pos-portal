import React, { useEffect, useState } from 'react';
import { Smartphone, Save, X, Edit, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import dataphoneService, { Dataphone } from '../../../services/dataphoneService';
import { CompactButton } from '../../ui';
import { SiteAutocomplete, DataphoneSupplierAutocomplete } from '../../ui/autocompletes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dataphone?: Dataphone | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

interface FormState {
  dataphoneId: number | '';
  name: string;
  siteId: string;
  dataphoneSupplierId: number | '';
  dataphoneIpAddress: string;
  dataphoneResponsePort: number | '';
  terminalRequestPort: number | '';
  transTimeout: number | '';
  comment: string;
  active: boolean;
}

const EMPTY: FormState = {
  dataphoneId: '', name: '', siteId: '', dataphoneSupplierId: '',
  dataphoneIpAddress: '', dataphoneResponsePort: 7060, terminalRequestPort: 2018,
  transTimeout: 64000, comment: '', active: true,
};

const DataphoneModal: React.FC<Props> = ({ isOpen, onClose, dataphone, mode, onSuccess }) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  useEffect(() => {
    if (!isOpen) return;
    if (dataphone && (isEditing || isViewing)) {
      setForm({
        dataphoneId: dataphone.dataphoneId,
        name: dataphone.name,
        siteId: dataphone.siteId,
        dataphoneSupplierId: dataphone.dataphoneSupplierId,
        dataphoneIpAddress: dataphone.dataphoneIpAddress,
        dataphoneResponsePort: dataphone.dataphoneResponsePort,
        terminalRequestPort: dataphone.terminalRequestPort,
        transTimeout: dataphone.transTimeout,
        comment: dataphone.comment ?? '',
        active: dataphone.active,
      });
    } else setForm(EMPTY);
  }, [isOpen, dataphone, isEditing, isViewing]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;
    setLoading(true);
    try {
      if (isCreating) {
        if (form.dataphoneId === '' || !form.name || !form.siteId || form.dataphoneSupplierId === '' ||
            !form.dataphoneIpAddress || form.dataphoneResponsePort === '' || form.terminalRequestPort === '' || form.transTimeout === '') {
          toast.error('Completa los campos obligatorios');
          setLoading(false);
          return;
        }
        const payload = {
          dataphoneId: Number(form.dataphoneId),
          name: form.name, siteId: form.siteId,
          dataphoneSupplierId: Number(form.dataphoneSupplierId),
          dataphoneIpAddress: form.dataphoneIpAddress,
          dataphoneResponsePort: Number(form.dataphoneResponsePort),
          terminalRequestPort: Number(form.terminalRequestPort),
          transTimeout: Number(form.transTimeout),
          comment: form.comment || null,
          active: form.active,
        };
        const res = await dataphoneService.create(payload);
        if (res.successful) { toast.success(`Dataphone creado: ${payload.name}`); onSuccess(); onClose(); }
        else toast.error(res.error || 'Error al crear');
      } else if (isEditing && dataphone) {
        const payload = {
          name: form.name,
          siteId: form.siteId,
          dataphoneSupplierId: form.dataphoneSupplierId === '' ? undefined : Number(form.dataphoneSupplierId),
          dataphoneIpAddress: form.dataphoneIpAddress,
          dataphoneResponsePort: form.dataphoneResponsePort === '' ? undefined : Number(form.dataphoneResponsePort),
          terminalRequestPort: form.terminalRequestPort === '' ? undefined : Number(form.terminalRequestPort),
          transTimeout: form.transTimeout === '' ? undefined : Number(form.transTimeout),
          comment: form.comment || null,
          active: form.active,
        };
        const res = await dataphoneService.update(dataphone.dataphoneId, payload);
        if (res.successful) { toast.success('Dataphone actualizado'); onSuccess(); onClose(); }
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

  const HeaderIcon = isEditing ? Edit : isViewing ? Smartphone : Plus;
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
                {isViewing ? 'Ver Dataphone' : isEditing ? 'Editar Dataphone' : 'Nuevo Dataphone'}
              </h3>
              <p className="text-2xs text-text-muted">
                {dataphone ? `#${dataphone.dataphoneId} · ${dataphone.siteId}` : 'Configuración física del dataphone'}
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
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID *</label>
              <input type="number" value={form.dataphoneId}
                onChange={(e) => update('dataphoneId', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={isViewing || isEditing} required min={1}
                className={inputCls(isViewing || isEditing)} />
            </div>
            <div className="col-span-2">
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre *</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                disabled={isViewing} required className={inputCls(isViewing)} placeholder="CARDNET" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Sucursal *</label>
              <SiteAutocomplete
                value={form.siteId}
                onChange={(v) => update('siteId', v ?? '')}
                disabled={isViewing}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Proveedor *</label>
              <DataphoneSupplierAutocomplete
                value={form.dataphoneSupplierId === '' ? null : form.dataphoneSupplierId}
                onChange={(v) => update('dataphoneSupplierId', v ?? '')}
                disabled={isViewing}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">IP Dataphone *</label>
              <input type="text" value={form.dataphoneIpAddress} onChange={(e) => update('dataphoneIpAddress', e.target.value)}
                disabled={isViewing} required className={inputCls(isViewing)} placeholder="192.168.125.36" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Resp Port *</label>
              <input type="number" value={form.dataphoneResponsePort}
                onChange={(e) => update('dataphoneResponsePort', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={isViewing} required className={inputCls(isViewing)} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Term. Port *</label>
              <input type="number" value={form.terminalRequestPort}
                onChange={(e) => update('terminalRequestPort', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={isViewing} required className={inputCls(isViewing)} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Timeout *</label>
              <input type="number" value={form.transTimeout}
                onChange={(e) => update('transTimeout', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={isViewing} required className={inputCls(isViewing)} />
            </div>
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Comentario</label>
            <input type="text" value={form.comment} onChange={(e) => update('comment', e.target.value)}
              disabled={isViewing} className={inputCls(isViewing)} />
          </div>
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

export default DataphoneModal;
