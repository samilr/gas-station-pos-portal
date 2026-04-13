import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { roleService } from '../../../services/roleService';
import { IRole } from '../../../types/role';

interface Props { role: IRole | null; onClose: () => void; onSaved: () => void; }

const RoleModal: React.FC<Props> = ({ role, onClose, onSaved }) => {
  const [name, setName] = useState(role?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = role ? await roleService.updateRole(role.roleId, { name }) : await roleService.createRole({ name });
    setSaving(false);
    if (res.successful) { toast.success(role ? 'Rol actualizado' : 'Rol creado'); onSaved(); }
    else toast.error(res.error || 'Error al guardar');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-900">{role ? 'Editar Rol' : 'Nuevo Rol'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="text-sm font-medium text-gray-700">Nombre del Rol</label>
            <input value={name} onChange={e => setName(e.target.value.toUpperCase())} required placeholder="ej: SUPERVISOR_FLUJOS"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono" /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60">
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;
