import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { roleService } from '../../../services/roleService';
import { IRole } from '../../../types/role';
import RoleModal from './RoleModal';

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
    ADMIN: 'bg-red-100 text-red-700',
    CONFIGURATION: 'bg-purple-100 text-purple-700',
    SUPERVISOR: 'bg-blue-100 text-blue-700',
    MANAGER: 'bg-indigo-100 text-indigo-700',
    SELLER: 'bg-green-100 text-green-700',
    AUDIT: 'bg-amber-100 text-amber-700',
    ACCOUNTANT: 'bg-teal-100 text-teal-700',
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Roles</h1>
              <p className="text-sm text-gray-500">{roles.length} roles definidos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal({ show: true, role: null })}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"><Plus className="w-4 h-4" />Nuevo Rol</button>
            <button onClick={load} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-24" />)
        ) : roles.map((r, i) => (
          <motion.div key={r.roleId} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[r.name] || 'bg-gray-100 text-gray-600'}`}>{r.name}</span>
              <span className="text-xs text-gray-400">ID: {r.roleId}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setModal({ show: true, role: r })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(r.roleId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </motion.div>
        ))}
        {!loading && roles.length === 0 && <p className="text-sm text-gray-400 col-span-3 text-center py-10">Sin roles</p>}
      </div>

      {modal.show && <RoleModal role={modal.role} onClose={() => setModal({ show: false, role: null })} onSaved={() => { setModal({ show: false, role: null }); load(); }} />}
    </div>
  );
};

export default RolesSection;
