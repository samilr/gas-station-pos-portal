import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Eye, Layers, Link2, X, Monitor, Fuel } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton, Pagination } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
import useFuelIslands from '../../../hooks/useFuelIslands';
import { FuelIsland } from '../../../services/fuelIslandService';
import { Dispenser } from '../../../services/dispensersConfigService';
import { useUnassignDispenserFromIslandMutation } from '../../../store/api/fuelIslandsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import FuelIslandModal from './FuelIslandModal';
import DeleteFuelIslandDialog from './DeleteFuelIslandDialog';
import AssignDispensersModal from './AssignDispensersModal';

const FuelIslandsSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const { fuelIslands, loading, error, refresh } = useFuelIslands();
  const [unassignDispenser] = useUnassignDispenserFromIslandMutation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive'>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selected, setSelected] = useState<FuelIsland | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<FuelIsland | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignIsland, setAssignIsland] = useState<FuelIsland | null>(null);

  useEffect(() => {
    setSubtitle('Fuel Islands');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return fuelIslands.filter((isl) => {
      const terminalMatch = (isl.terminals ?? []).some((t) =>
        String(t.terminalId).includes(q) || t.name.toLowerCase().includes(q),
      );
      const matchesSearch = !q ||
        isl.siteId.toLowerCase().includes(q) ||
        isl.name.toLowerCase().includes(q) ||
        terminalMatch;
      const matchesStatus = !statusFilter
        || (statusFilter === 'active' && isl.active)
        || (statusFilter === 'inactive' && !isl.active);
      return matchesSearch && matchesStatus;
    });
  }, [fuelIslands, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totals = {
    total: fuelIslands.length,
    active: fuelIslands.filter((i) => i.active).length,
    inactive: fuelIslands.filter((i) => !i.active).length,
    empty: fuelIslands.filter((i) => (i.dispensers?.length ?? 0) === 0).length,
  };

  const openCreate = () => { setSelected(null); setModalMode('create'); setModalOpen(true); };
  const openEdit = (i: FuelIsland) => { setSelected(i); setModalMode('edit'); setModalOpen(true); };
  const openView = (i: FuelIsland) => { setSelected(i); setModalMode('view'); setModalOpen(true); };
  const openDelete = (i: FuelIsland) => { setToDelete(i); setDeleteOpen(true); };
  const openAssign = (i: FuelIsland) => { setAssignIsland(i); setAssignOpen(true); };

  const handleUnassign = async (island: FuelIsland, dispenser: Dispenser) => {
    const label = dispenser.name || `Bomba #${dispenser.pumpNumber}`;
    if (!window.confirm(`¿Remover ${label} de ${island.name}? Quedará sin asignar.`)) return;
    try {
      await unassignDispenser({ islandId: island.fuelIslandId, dispenserId: dispenser.dispenserId }).unwrap();
      toast.success(`${label} removido de ${island.name}`, { duration: 3000 });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al remover dispenser') ?? 'Error al remover dispenser');
    }
  };

  return (
    <div className="space-y-1">
      <Toolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por site, nombre, terminal..."
        chips={[
          { label: 'Total', value: totals.total, color: 'blue' },
          { label: 'Activas', value: totals.active, color: 'green' },
          { label: 'Inactivas', value: totals.inactive, color: 'red' },
          { label: 'Vacías', value: totals.empty, color: 'gray' },
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
                <th className="text-left px-2 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-2 font-medium text-gray-500">Terminal</th>
                <th className="text-left px-2 font-medium text-gray-500">Dispensers</th>
                <th className="text-left px-2 font-medium text-gray-500">Estado</th>
                <th className="text-right px-2 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-2 py-6 text-center text-text-muted text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...
                </td></tr>
              )}
              {!loading && pageItems.length === 0 && (
                <tr><td colSpan={6} className="px-2 py-6 text-center text-text-muted text-xs">
                  <Layers className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                  No hay fuel islands {search || statusFilter ? 'con esos filtros' : 'registradas'}
                </td></tr>
              )}
              {!loading && pageItems.map((isl) => {
                const dispCount = isl.dispensers?.length ?? 0;
                const terminal = isl.terminals?.[0];
                return (
                  <tr key={isl.fuelIslandId} className="border-b border-table-border hover:bg-row-hover align-middle">
                    <td className="px-2 py-1.5 text-sm text-text-primary whitespace-nowrap">{isl.siteId}</td>
                    <td className="px-2 py-1.5 text-sm font-medium text-text-primary whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-orange-500" />
                        {isl.name}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-sm text-text-secondary whitespace-nowrap">
                      {terminal ? (
                        <span className="inline-flex items-center gap-1" title="Asignado desde la pantalla de terminales">
                          <Monitor className="w-3 h-3 text-blue-500" />
                          #{terminal.terminalId} · {terminal.name}
                        </span>
                      ) : (
                        <span className="text-text-muted">— Sin terminal —</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-sm">
                      {dispCount === 0 ? (
                        <span className="inline-flex items-center h-5 px-2 text-2xs rounded-sm border bg-gray-50 border-gray-200 text-gray-500">
                          Vacía
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[360px]">
                          {isl.dispensers!.map((d) => (
                            <span
                              key={d.dispenserId}
                              className="inline-flex items-center h-5 pl-2 pr-1 text-2xs rounded-sm border bg-orange-50 border-orange-200 text-orange-700 gap-1"
                              title={d.name || `Bomba #${d.pumpNumber}`}
                            >
                              <Fuel className="w-2.5 h-2.5" />
                              #{d.pumpNumber}{d.name ? ` · ${d.name}` : ''}
                              <button
                                type="button"
                                onClick={() => handleUnassign(isl, d)}
                                title="Desasignar dispenser"
                                className="ml-0.5 h-3.5 w-3.5 inline-flex items-center justify-center rounded-sm hover:bg-orange-200"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-sm">
                      <StatusDot color={isl.active ? 'green' : 'gray'} label={isl.active ? 'Activa' : 'Inactiva'} />
                    </td>
                    <td className="px-2 py-1.5 text-sm whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <CompactButton variant="icon" onClick={() => openAssign(isl)} title="Asignar dispensers">
                          <Link2 className="w-3.5 h-3.5 text-orange-600" />
                        </CompactButton>
                        <CompactButton variant="icon" onClick={() => openView(isl)} title="Ver detalles">
                          <Eye className="w-3.5 h-3.5 text-text-secondary" />
                        </CompactButton>
                        <CompactButton variant="icon" onClick={() => openEdit(isl)} title="Editar">
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                        </CompactButton>
                        <CompactButton variant="icon" onClick={() => openDelete(isl)} title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </CompactButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            itemLabel="fuel islands"
          />
        )}
      </div>

      <FuelIslandModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fuelIsland={selected}
        mode={modalMode}
        onSuccess={refresh}
      />

      <DeleteFuelIslandDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        fuelIsland={toDelete}
        onSuccess={refresh}
      />

      <AssignDispensersModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        fuelIsland={assignIsland}
        allIslands={fuelIslands}
        onSuccess={refresh}
      />
    </div>
  );
};

export default FuelIslandsSection;
