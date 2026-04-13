import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { staftGroupService } from '../../../services/staftGroupService';
import { IStaftGroup } from '../../../types/staftGroup';

interface Props { group: IStaftGroup | null; onClose: () => void; onSaved: () => void; }

const StaftGroupModal: React.FC<Props> = ({ group, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: group?.name || '', isManager: group?.isManager ?? false, rights: group?.rights || '01111111' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = group ? await staftGroupService.updateStaftGroup(group.staftGroupId, form) : await staftGroupService.createStaftGroup(form);
    setSaving(false);
    if (res.successful) { toast.success(group ? 'Grupo actualizado' : 'Grupo creado'); onSaved(); }
    else toast.error(res.error || 'Error al guardar');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-900">{group ? 'Editar Grupo' : 'Nuevo Grupo de Cajeros'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="text-sm font-medium text-gray-700">Nombre</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="text-sm font-medium text-gray-700">Permisos (8 bits)</label>
            <input value={form.rights} onChange={e => setForm(f => ({ ...f, rights: e.target.value }))} maxLength={8} pattern="[01]{8}"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono" placeholder="01111111" /></div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.isManager} onChange={e => setForm(f => ({ ...f, isManager: e.target.checked }))} className="rounded" />
            Es Manager
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-60">
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaftGroupModal;
