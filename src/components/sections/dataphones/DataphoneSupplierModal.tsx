import React, { useEffect, useState } from 'react';
import { CreditCard, Save, X, Edit, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { DataphoneSupplier } from '../../../services/dataphoneSupplierService';
import {
  useCreateDataphoneSupplierMutation,
  useUpdateDataphoneSupplierMutation,
} from '../../../store/api/dataphoneSuppliersApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  supplier?: DataphoneSupplier | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

interface FormState {
  dataphoneSupplierId: number | '';
  name: string;
  comment: string;
  posRequestPort: number | '';
  dataphoneResponsePort: number | '';
  transTimeout: number | '';
  active: boolean;
}

const EMPTY: FormState = {
  dataphoneSupplierId: '', name: '', comment: '',
  posRequestPort: 2018, dataphoneResponsePort: 7060, transTimeout: 38000, active: true,
};

const DataphoneSupplierModal: React.FC<Props> = ({ isOpen, onClose, supplier, mode, onSuccess }) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [createSupplier] = useCreateDataphoneSupplierMutation();
  const [updateSupplier] = useUpdateDataphoneSupplierMutation();

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  useEffect(() => {
    if (!isOpen) return;
    if (supplier && (isEditing || isViewing)) {
      setForm({
        dataphoneSupplierId: supplier.dataphoneSupplierId,
        name: supplier.name,
        comment: supplier.comment ?? '',
        posRequestPort: supplier.posRequestPort,
        dataphoneResponsePort: supplier.dataphoneResponsePort,
        transTimeout: supplier.transTimeout,
        active: supplier.active,
      });
    } else setForm(EMPTY);
  }, [isOpen, supplier, isEditing, isViewing]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;
    setLoading(true);
    try {
      if (isCreating) {
        if (form.dataphoneSupplierId === '' || !form.name || form.posRequestPort === '' || form.dataphoneResponsePort === '' || form.transTimeout === '') {
          toast.error('Completa los campos obligatorios');
          setLoading(false);
          return;
        }
        const payload = {
          dataphoneSupplierId: Number(form.dataphoneSupplierId),
          name: form.name,
          comment: form.comment || null,
          posRequestPort: Number(form.posRequestPort),
          dataphoneResponsePort: Number(form.dataphoneResponsePort),
          transTimeout: Number(form.transTimeout),
          active: form.active,
        };
        try {
          await createSupplier(payload).unwrap();
          toast.success(`Proveedor creado: ${payload.name}`);
          onSuccess(); onClose();
        } catch (err) {
          toast.error(getErrorMessage(err, 'Error al crear') ?? 'Error al crear');
        }
      } else if (isEditing && supplier) {
        const payload = {
          name: form.name,
          comment: form.comment || null,
          posRequestPort: form.posRequestPort === '' ? undefined : Number(form.posRequestPort),
          dataphoneResponsePort: form.dataphoneResponsePort === '' ? undefined : Number(form.dataphoneResponsePort),
          transTimeout: form.transTimeout === '' ? undefined : Number(form.transTimeout),
          active: form.active,
        };
        try {
          await updateSupplier({ id: supplier.dataphoneSupplierId, body: payload }).unwrap();
          toast.success('Proveedor actualizado');
          onSuccess(); onClose();
        } catch (err) {
          toast.error(getErrorMessage(err, 'Error al actualizar') ?? 'Error al actualizar');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const HeaderIcon = isEditing ? Edit : isViewing ? CreditCard : Plus;
  const headerColor = isEditing ? 'green' : 'blue';
  const inputCls = (disabled: boolean) =>
    `w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-md shadow-xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-${headerColor}-100 rounded-sm flex items-center justify-center`}>
              <HeaderIcon className={`w-4 h-4 text-${headerColor}-600`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {isViewing ? 'Ver Proveedor' : isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h3>
              <p className="text-2xs text-text-muted">
                {supplier ? `#${supplier.dataphoneSupplierId} · ${supplier.name}` : 'Catálogo de proveedores de pinpad'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID *</label>
              <input type="number" value={form.dataphoneSupplierId}
                onChange={(e) => update('dataphoneSupplierId', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={isViewing || isEditing} required min={1}
                className={inputCls(isViewing || isEditing)} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre *</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                disabled={isViewing} required maxLength={50}
                className={inputCls(isViewing)} placeholder="CARDNET" />
            </div>
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Comentario</label>
            <input type="text" value={form.comment} onChange={(e) => update('comment', e.target.value)}
              disabled={isViewing} className={inputCls(isViewing)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">POS Req. Port *</label>
              <input type="number" value={form.posRequestPort}
                onChange={(e) => update('posRequestPort', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={isViewing} required
                className={inputCls(isViewing)} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Resp. Port *</label>
              <input type="number" value={form.dataphoneResponsePort}
                onChange={(e) => update('dataphoneResponsePort', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={isViewing} required
                className={inputCls(isViewing)} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Timeout (ms) *</label>
              <input type="number" value={form.transTimeout}
                onChange={(e) => update('transTimeout', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                disabled={isViewing} required
                className={inputCls(isViewing)} />
            </div>
          </div>
          <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
            <span className="text-xs text-text-primary">Activo</span>
            <input type="checkbox" checked={form.active} onChange={(e) => update('active', e.target.checked)}
              disabled={isViewing}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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

export default DataphoneSupplierModal;
