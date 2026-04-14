import React, { useState } from 'react';
import { X, Save, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { staftGroupService } from '../../../services/staftGroupService';
import { IStaftGroup } from '../../../types/staftGroup';
import { CompactButton } from '../../ui';

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

  const inputCls = 'w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{group ? 'Editar Grupo' : 'Nuevo Grupo de Cajeros'}</h3>
              <p className="text-2xs text-text-muted">{group ? 'Modificar permisos' : 'Registrar nuevo grupo'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} />
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Permisos (8 bits)</label>
            <input value={form.rights} onChange={e => setForm(f => ({ ...f, rights: e.target.value }))} maxLength={8} pattern="[01]{8}"
              className={`${inputCls} font-mono`} placeholder="01111111" />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={form.isManager} onChange={e => setForm(f => ({ ...f, isManager: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Es Manager
          </label>
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

export default StaftGroupModal;
