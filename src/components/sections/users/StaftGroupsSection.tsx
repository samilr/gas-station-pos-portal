import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { staftGroupService } from '../../../services/staftGroupService';
import { IStaftGroup } from '../../../types/staftGroup';
import StaftGroupModal from './StaftGroupModal';
import { CompactButton } from '../../ui';
import Toolbar from '../../ui/Toolbar';

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
    <div className="space-y-1">
      <Toolbar
        chips={[
          { label: "Grupos", value: groups.length, color: "green" },
        ]}
      >
        <CompactButton variant="primary" onClick={() => setModal({ show: true, group: null })}>
          <Plus className="w-3.5 h-3.5" />Nuevo
        </CompactButton>
        <CompactButton variant="icon" onClick={load}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </Toolbar>

      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-32 items-center"><div className="animate-spin h-8 w-8 border-b-2 border-teal-600 rounded-full" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  {['ID', 'Nombre', 'Manager', 'Permisos', 'Acciones'].map(h => (
                    <th key={h} className="px-2 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.staftGroupId} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover transition-colors">
                    <td className="px-2 text-sm whitespace-nowrap text-gray-500">{g.staftGroupId}</td>
                    <td className="px-2 text-sm whitespace-nowrap font-medium text-gray-900">{g.name}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      {g.isManager
                        ? <span className="flex items-center gap-0.5 text-amber-600 text-xs font-medium"><Star className="w-3 h-3" />Si</span>
                        : <span className="text-xs text-gray-400">No</span>}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap font-mono text-gray-600 text-ellipsis overflow-hidden max-w-[200px]">{g.rights}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ show: true, group: g })} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(g.staftGroupId)} className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {groups.length === 0 && (
                  <tr><td colSpan={5} className="px-2 py-6 text-center text-sm text-gray-400">Sin grupos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.show && <StaftGroupModal group={modal.group} onClose={() => setModal({ show: false, group: null })} onSaved={() => { setModal({ show: false, group: null }); load(); }} />}
    </div>
  );
};

export default StaftGroupsSection;
