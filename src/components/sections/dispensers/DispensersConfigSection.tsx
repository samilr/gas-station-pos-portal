import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Eye, Fuel, Network, Cable, Droplet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton, Pagination } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
import useDispensersConfig from '../../../hooks/useDispensersConfig';
import { Dispenser } from '../../../services/dispensersConfigService';
import { useUpdateDispenserConfigMutation } from '../../../store/api/dispensersConfigApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import DispenserConfigModal from './DispenserConfigModal';
import DeleteDispenserConfigDialog from './DeleteDispenserConfigDialog';
import NozzlesModal from './NozzlesModal';

const DispensersConfigSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const { dispensers, loading, error, refresh } = useDispensersConfig();
  const [updateDispenser] = useUpdateDispenserConfigMutation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive'>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selected, setSelected] = useState<Dispenser | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Dispenser | null>(null);

  const [nozzlesOpen, setNozzlesOpen] = useState(false);
  const [nozzlesDispenser, setNozzlesDispenser] = useState<Dispenser | null>(null);

  useEffect(() => {
    setSubtitle('Configuración de dispensadoras');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return dispensers.filter((d) => {
      const matchesSearch = !q ||
        d.siteId.toLowerCase().includes(q) ||
        String(d.pumpNumber).includes(q) ||
        (d.name?.toLowerCase().includes(q) ?? false) ||
        (d.brand?.toLowerCase().includes(q) ?? false) ||
        (d.model?.toLowerCase().includes(q) ?? false) ||
        (d.ipAddress?.toLowerCase().includes(q) ?? false) ||
        (d.ptsId?.toLowerCase().includes(q) ?? false);
      const matchesStatus = !statusFilter
        || (statusFilter === 'active' && d.active)
        || (statusFilter === 'inactive' && !d.active);
      return matchesSearch && matchesStatus;
    });
  }, [dispensers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totals = {
    total: dispensers.length,
    active: dispensers.filter((d) => d.active).length,
    inactive: dispensers.filter((d) => !d.active).length,
  };

  const openCreate = () => { setSelected(null); setModalMode('create'); setModalOpen(true); };
  const openEdit = (d: Dispenser) => { setSelected(d); setModalMode('edit'); setModalOpen(true); };
  const openView = (d: Dispenser) => { setSelected(d); setModalMode('view'); setModalOpen(true); };
  const openDelete = (d: Dispenser) => { setToDelete(d); setDeleteOpen(true); };
  const openNozzles = (d: Dispenser) => { setNozzlesDispenser(d); setNozzlesOpen(true); };

  const toggleActive = async (d: Dispenser) => {
    try {
      await updateDispenser({ id: d.dispenserId, body: { active: !d.active } }).unwrap();
      toast.success(`Dispensadora ${d.active ? 'desactivada' : 'activada'}`, { duration: 3000 });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al cambiar estado') ?? 'Error al cambiar estado');
    }
  };

  const connectionLabel = (d: Dispenser) => {
    if (d.connectionType === 'TCP') return d.ipAddress ? `${d.ipAddress}:${d.tcpPort ?? '?'}` : 'TCP';
    return d.serialPort ? `${d.connectionType} · ${d.serialPort}` : d.connectionType;
  };

  return (
    <div className="space-y-1">
      <Toolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por site, bomba, marca, IP..."
        chips={[
          { label: 'Total', value: totals.total, color: 'blue' },
          { label: 'Activas', value: totals.active, color: 'green' },
          { label: 'Inactivas', value: totals.inactive, color: 'red' },
        ]}
      >
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
          className="h-7 px-2 text-xs border border-gray-300 rounded-sm"
        >
          <option value="">Todos</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
        <CompactButton variant="ghost" onClick={refresh} disabled={loading}>
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
        <CompactButton variant="primary" onClick={openCreate}>
          <Plus className="w-3 h-3" /> Nueva
        </CompactButton>
      </Toolbar>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-sm border border-table-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 font-medium text-gray-500">Site</th>
                <th className="text-left px-2 font-medium text-gray-500">Bomba</th>
                <th className="text-left px-2 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-2 font-medium text-gray-500">Hardware</th>
                <th className="text-left px-2 font-medium text-gray-500">Conexión</th>
                <th className="text-left px-2 font-medium text-gray-500">Protocolo</th>
                <th className="text-left px-2 font-medium text-gray-500">Nozzles</th>
                <th className="text-left px-2 font-medium text-gray-500">Estado</th>
                <th className="text-right px-2 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="px-2 py-6 text-center text-text-muted text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...
                </td></tr>
              )}
              {!loading && pageItems.length === 0 && (
                <tr><td colSpan={9} className="px-2 py-6 text-center text-text-muted text-xs">
                  <Fuel className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                  No hay dispensadoras {search || statusFilter ? 'con esos filtros' : 'registradas'}
                </td></tr>
              )}
              {!loading && pageItems.map((d) => (
                <tr key={d.dispenserId} className="h-8 border-b border-table-border hover:bg-row-hover">
                  <td className="px-2 text-sm text-text-primary whitespace-nowrap">{d.siteId}</td>
                  <td className="px-2 text-sm font-medium text-text-primary">#{d.pumpNumber}</td>
                  <td className="px-2 text-sm text-text-primary truncate max-w-[180px]">{d.name || '—'}</td>
                  <td className="px-2 text-sm text-text-secondary truncate max-w-[160px]">
                    {d.brand || '—'}{d.model ? ` · ${d.model}` : ''}
                  </td>
                  <td className="px-2 text-sm text-text-secondary whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      {d.connectionType === 'TCP'
                        ? <Network className="w-3 h-3 text-blue-500" />
                        : <Cable className="w-3 h-3 text-purple-500" />}
                      {connectionLabel(d)}
                    </span>
                  </td>
                  <td className="px-2 text-sm text-text-secondary truncate max-w-[140px]">{d.protocol || '—'}</td>
                  <td className="px-2 text-sm text-text-secondary">{d.nozzlesCount}</td>
                  <td className="px-2 text-sm">
                    <button onClick={() => toggleActive(d)} className="cursor-pointer" title="Click para cambiar estado">
                      <StatusDot color={d.active ? 'green' : 'gray'} label={d.active ? 'Activa' : 'Inactiva'} />
                    </button>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <CompactButton variant="icon" onClick={() => openNozzles(d)} title="Mangueras">
                        <Droplet className="w-3.5 h-3.5 text-orange-600" />
                      </CompactButton>
                      <CompactButton variant="icon" onClick={() => openView(d)} title="Ver detalles">
                        <Eye className="w-3.5 h-3.5 text-text-secondary" />
                      </CompactButton>
                      <CompactButton variant="icon" onClick={() => openEdit(d)} title="Editar">
                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                      </CompactButton>
                      <CompactButton variant="icon" onClick={() => openDelete(d)} title="Eliminar">
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </CompactButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
            itemLabel="dispensadoras"
          />
        )}
      </div>

      <DispenserConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        dispenser={selected}
        mode={modalMode}
        onSuccess={refresh}
      />

      <DeleteDispenserConfigDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        dispenser={toDelete}
        onSuccess={refresh}
      />

      <NozzlesModal
        isOpen={nozzlesOpen}
        onClose={() => setNozzlesOpen(false)}
        dispenser={nozzlesDispenser}
      />
    </div>
  );
};

export default DispensersConfigSection;
