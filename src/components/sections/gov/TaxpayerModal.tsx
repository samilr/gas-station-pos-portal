import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { taxpayerService } from '../../../services/taxpayerService';
import { ITaxpayer } from '../../../types/taxpayer';

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div className="bg-white rounded-sm shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Editar Contribuyente' : 'Nuevo Contribuyente'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-sm"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">RNC / ID</label>
            <input value={form.taxpayerId} onChange={e => setForm(f => ({ ...f, taxpayerId: e.target.value }))}
              disabled={isEdit} required
              className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100" />
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">Nombre</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">Tipo</label>
            <input type="number" value={form.type} onChange={e => setForm(f => ({ ...f, type: Number(e.target.value) }))}
              className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.validated} onChange={e => setForm(f => ({ ...f, validated: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Validado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="h-7 px-3 text-sm rounded-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 h-7 px-3 text-sm rounded-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TaxpayerModal;
