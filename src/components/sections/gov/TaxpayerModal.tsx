import React, { useState } from 'react';
import { X, Save, FileText, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { taxpayerService } from '../../../services/taxpayerService';
import { ITaxpayer } from '../../../types/taxpayer';
import { CompactButton } from '../../ui';

interface Props {
  taxpayer: ITaxpayer | null;
  onClose: () => void;
  onSaved: () => void;
}

const TaxpayerModal: React.FC<Props> = ({ taxpayer, onClose, onSaved }) => {
  const isEdit = !!taxpayer;
  const [form, setForm] = useState({
    taxpayerId: taxpayer?.taxpayerId || '',
    name: taxpayer?.name || '',
    type: taxpayer?.type ?? 0,
    validated: taxpayer?.validated ?? false,
    active: taxpayer?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = isEdit
        ? await taxpayerService.updateTaxpayer(form.taxpayerId, { name: form.name, type: form.type, validated: form.validated, active: form.active })
        : await taxpayerService.createTaxpayer(form);
      if (res.successful) { toast.success(isEdit ? 'Contribuyente actualizado' : 'Contribuyente creado'); onSaved(); }
      else toast.error(res.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{isEdit ? 'Editar Contribuyente' : 'Nuevo Contribuyente'}</h3>
              <p className="text-2xs text-text-muted">{isEdit ? 'Modificar datos fiscales' : 'Registrar contribuyente'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">RNC / ID</label>
            <input value={form.taxpayerId} onChange={e => setForm(f => ({ ...f, taxpayerId: e.target.value }))} disabled={isEdit} required className={inputCls} />
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} />
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Tipo</label>
            <input type="number" value={form.type} onChange={e => setForm(f => ({ ...f, type: Number(e.target.value) }))} className={inputCls} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <input type="checkbox" checked={form.validated} onChange={e => setForm(f => ({ ...f, validated: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Validado
            </label>
            <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Activo
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
          <CompactButton type="submit" variant="primary" disabled={saving}>
            {saving ? <><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</> : <><Save className="w-3 h-3" /> Guardar</>}
          </CompactButton>
        </div>
      </form>
    </div>
  );
};

export default TaxpayerModal;
