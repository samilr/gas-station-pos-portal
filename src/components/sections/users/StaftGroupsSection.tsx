import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit2, Trash2, RefreshCw, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { staftGroupService } from '../../../services/staftGroupService';
import { IStaftGroup } from '../../../types/staftGroup';
import StaftGroupModal from './StaftGroupModal';

const StaftGroupsSection: React.FC = () => {
  const [groups, setGroups] = useState<IStaftGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ show: boolean; group: IStaftGroup | null }>({ show: false, group: null });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await staftGroupService.getStaftGroups();
    setGroups(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este grupo?')) return;
    const r = await staftGroupService.deleteStaftGroup(id);
    if (r.successful) { toast.success('Grupo eliminado'); load(); } else toast.error(r.error || 'Error');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Grupos de Cajeros</h1>
              <p className="text-sm text-gray-500">{groups.length} grupos definidos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal({ show: true, group: null })}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"><Plus className="w-4 h-4" />Nuevo Grupo</button>
            <button onClick={load} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? <div className="flex justify-center h-40 items-center"><div className="animate-spin h-8 w-8 border-b-2 border-teal-600 rounded-full" /></div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                {['ID', 'Nombre', 'Manager', 'Permisos', 'Acciones'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-200">
                {groups.map((g, i) => (
                  <motion.tr key={g.staftGroupId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{g.staftGroupId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{g.name}</td>
                    <td className="px-6 py-4">
                      {g.isManager
                        ? <span className="flex items-center gap-1 text-amber-600 text-sm font-medium"><Star className="w-3.5 h-3.5" />Sí</span>
                        : <span className="text-sm text-gray-400">No</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{g.rights}</td>
                    <td className="px-6 py-4"><div className="flex gap-2">
                      <button onClick={() => setModal({ show: true, group: g })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(g.staftGroupId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </motion.tr>
                ))}
                {groups.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">Sin grupos</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {modal.show && <StaftGroupModal group={modal.group} onClose={() => setModal({ show: false, group: null })} onSaved={() => { setModal({ show: false, group: null }); load(); }} />}
    </div>
  );
};

export default StaftGroupsSection;
