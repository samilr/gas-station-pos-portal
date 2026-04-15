import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Eye, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton, Pagination } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
import useDataphoneTerminals from '../../../hooks/useDataphoneTerminals';
import dataphoneTerminalService, { DataphoneTerminal } from '../../../services/dataphoneTerminalService';
import DataphoneTerminalModal from './DataphoneTerminalModal';
import DeleteDataphoneTerminalDialog from './DeleteDataphoneTerminalDialog';

const DataphoneTerminalsSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const { terminals, loading, error, refresh } = useDataphoneTerminals();

  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selected, setSelected] = useState<DataphoneTerminal | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataphoneTerminal | null>(null);

  useEffect(() => {
    setSubtitle('Mapeo entre dataphones y terminales POS');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const uniqueSites = useMemo(() => Array.from(new Set(terminals.map((t) => t.siteId))), [terminals]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return terminals.filter((t) => {
      const matchesSearch = !q ||
        String(t.dataphoneId).includes(q) ||
        t.siteId.toLowerCase().includes(q) ||
        String(t.terminalId).includes(q) ||
        t.dataphoneIp.toLowerCase().includes(q) ||
        t.terminalIp.toLowerCase().includes(q);
      const matchesSite = !siteFilter || t.siteId === siteFilter;
      return matchesSearch && matchesSite;
    });
  }, [terminals, search, siteFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totals = { total: terminals.length, active: terminals.filter((t) => t.active).length };

  const toggleActive = async (t: DataphoneTerminal) => {
    const res = await dataphoneTerminalService.update(
      { dataphoneId: t.dataphoneId, siteId: t.siteId, terminalId: t.terminalId },
      { active: !t.active },
    );
    if (res.successful) { toast.success(`Mapeo ${t.active ? 'desactivado' : 'activado'}`); refresh(); }
    else toast.error(res.error || 'Error al cambiar estado');
  };

  return (
    <div className="space-y-1">
      <Toolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por site, terminal, IP..."
        chips={[
          { label: 'Total', value: totals.total, color: 'blue' },
          { label: 'Activos', value: totals.active, color: 'green' },
        ]}
      >
        <select value={siteFilter} onChange={(e) => { setSiteFilter(e.target.value); setPage(1); }}
          className="h-7 px-2 text-xs border border-gray-300 rounded-sm">
          <option value="">Todos los sitios</option>
          {uniqueSites.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <CompactButton variant="ghost" onClick={refresh} disabled={loading}>
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </CompactButton>
        <CompactButton variant="primary" onClick={() => { setSelected(null); setModalMode('create'); setModalOpen(true); }}>
          <Plus className="w-3 h-3" /> Nuevo
        </CompactButton>
      </Toolbar>

      {error && <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">{error}</div>}

      <div className="bg-white rounded-sm border border-table-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 font-medium text-gray-500">Dataphone</th>
                <th className="text-left px-2 font-medium text-gray-500">Site</th>
                <th className="text-left px-2 font-medium text-gray-500">Terminal</th>
                <th className="text-left px-2 font-medium text-gray-500">IP Dataphone</th>
                <th className="text-left px-2 font-medium text-gray-500">IP Terminal</th>
                <th className="text-left px-2 font-medium text-gray-500">Cierre</th>
                <th className="text-left px-2 font-medium text-gray-500">Estado</th>
                <th className="text-right px-2 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="px-2 py-6 text-center text-text-muted text-xs">
                <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...</td></tr>}
              {!loading && pageItems.length === 0 && (
                <tr><td colSpan={8} className="px-2 py-6 text-center text-text-muted text-xs">
                  <Monitor className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                  No hay mapeos {search || siteFilter ? 'con esos filtros' : 'registrados'}
                </td></tr>
              )}
              {!loading && pageItems.map((t) => (
                <tr key={`${t.dataphoneId}-${t.siteId}-${t.terminalId}`} className="h-8 border-b border-table-border hover:bg-row-hover">
                  <td className="px-2 text-sm font-medium text-text-primary">#{t.dataphoneId}</td>
                  <td className="px-2 text-sm text-text-secondary">{t.siteId}</td>
                  <td className="px-2 text-sm text-text-secondary">T{t.terminalId}</td>
                  <td className="px-2 text-sm text-text-secondary font-mono">{t.dataphoneIp}</td>
                  <td className="px-2 text-sm text-text-secondary font-mono">{t.terminalIp}</td>
                  <td className="px-2 text-sm text-text-secondary">{t.closingManually ? 'Manual' : 'Automático'}</td>
                  <td className="px-2 text-sm">
                    <button onClick={() => toggleActive(t)} className="cursor-pointer">
                      <StatusDot color={t.active ? 'green' : 'gray'} label={t.active ? 'Activo' : 'Inactivo'} />
                    </button>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <CompactButton variant="icon" onClick={() => { setSelected(t); setModalMode('view'); setModalOpen(true); }} title="Ver"><Eye className="w-3.5 h-3.5 text-text-secondary" /></CompactButton>
                      <CompactButton variant="icon" onClick={() => { setSelected(t); setModalMode('edit'); setModalOpen(true); }} title="Editar"><Edit className="w-3.5 h-3.5 text-blue-600" /></CompactButton>
                      <CompactButton variant="icon" onClick={() => { setToDelete(t); setDeleteOpen(true); }} title="Eliminar"><Trash2 className="w-3.5 h-3.5 text-red-600" /></CompactButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length}
            pageSize={pageSize} onPageChange={setPage}
            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} itemLabel="mapeos" />
        )}
      </div>

      <DataphoneTerminalModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        terminal={selected} mode={modalMode} onSuccess={refresh} />
      <DeleteDataphoneTerminalDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
        terminal={toDelete} onSuccess={refresh} />
    </div>
  );
};

export default DataphoneTerminalsSection;
