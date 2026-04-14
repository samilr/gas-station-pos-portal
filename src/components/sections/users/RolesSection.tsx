import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { roleService } from '../../../services/roleService';
import { IRole } from '../../../types/role';
import RoleModal from './RoleModal';
import { CompactButton } from '../../ui';
import Toolbar from '../../ui/Toolbar';

const RolesSection: React.FC = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ show: boolean; role: IRole | null }>({ show: false, role: null });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await roleService.getRoles();
    setRoles(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este rol?')) return;
    const r = await roleService.deleteRole(id);
    if (r.successful) { toast.success('Rol eliminado'); load(); } else toast.error(r.error || 'Error');
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'red',
    CONFIGURATION: 'purple',
    SUPERVISOR: 'blue',
    MANAGER: 'blue',
    SELLER: 'green',
    AUDIT: 'yellow',
    ACCOUNTANT: 'green',
  };

  return (
    <div className="space-y-1">
      <Toolbar
        chips={[
          { label: "Roles", value: roles.length, color: "blue" },
        ]}
      >
        <CompactButton variant="primary" onClick={() => setModal({ show: true, role: null })}>
          <Plus className="w-3.5 h-3.5" />Nuevo
        </CompactButton>
        <CompactButton variant="icon" onClick={load}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </Toolbar>

      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  {['ID', 'Nombre', 'Acciones'].map(h => (
                    <th key={h} className="px-2 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.roleId} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover transition-colors">
                    <td className="px-2 text-sm whitespace-nowrap text-gray-400">{r.roleId}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          roleColors[r.name] === 'red' ? 'bg-red-500' :
                          roleColors[r.name] === 'purple' ? 'bg-purple-500' :
                          roleColors[r.name] === 'blue' ? 'bg-blue-500' :
                          roleColors[r.name] === 'green' ? 'bg-green-500' :
                          roleColors[r.name] === 'yellow' ? 'bg-amber-500' : 'bg-gray-400'
                        }`} />
                        <span className="font-medium text-gray-900">{r.name}</span>
                      </span>
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ show: true, role: r })} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(r.roleId)} className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr><td colSpan={3} className="px-2 py-6 text-center text-sm text-gray-400">Sin roles</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.show && <RoleModal role={modal.role} onClose={() => setModal({ show: false, role: null })} onSaved={() => { setModal({ show: false, role: null }); load(); }} />}
    </div>
  );
};

export default RolesSection;
