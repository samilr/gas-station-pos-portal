import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Eye, Smartphone, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton, Pagination } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
import useDataphones from '../../../hooks/useDataphones';
import dataphoneService, { Dataphone } from '../../../services/dataphoneService';
import DataphoneModal from './DataphoneModal';
import DeleteDataphoneDialog from './DeleteDataphoneDialog';
import TestConnectionModal from './TestConnectionModal';

const DataphonesSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const { dataphones, loading, error, refresh } = useDataphones();

  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selected, setSelected] = useState<Dataphone | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Dataphone | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [toTest, setToTest] = useState<Dataphone | null>(null);

  useEffect(() => {
    setSubtitle('Dataphones físicos instalados por sitio');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const uniqueSites = useMemo(() => Array.from(new Set(dataphones.map((d) => d.siteId))), [dataphones]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return dataphones.filter((d) => {
      const matchesSearch = !q ||
        String(d.dataphoneId).includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.siteId.toLowerCase().includes(q) ||
        d.dataphoneIpAddress.toLowerCase().includes(q);
      const matchesSite = !siteFilter || d.siteId === siteFilter;
      return matchesSearch && matchesSite;
    });
  }, [dataphones, search, siteFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totals = { total: dataphones.length, active: dataphones.filter((d) => d.active).length };

  const toggleActive = async (d: Dataphone) => {
    const res = await dataphoneService.update(d.dataphoneId, { active: !d.active });
    if (res.successful) { toast.success(`Dataphone ${d.active ? 'desactivado' : 'activado'}`); refresh(); }
    else toast.error(res.error || 'Error al cambiar estado');
  };

  return (
    <div className="space-y-1">
      <Toolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por nombre, site, IP..."
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
                <th className="text-left px-2 font-medium text-gray-500 w-16">ID</th>
                <th className="text-left px-2 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-2 font-medium text-gray-500">Site</th>
                <th className="text-left px-2 font-medium text-gray-500">Proveedor</th>
                <th className="text-left px-2 font-medium text-gray-500">IP Dataphone</th>
                <th className="text-left px-2 font-medium text-gray-500">Puertos</th>
                <th className="text-left px-2 font-medium text-gray-500">Timeout</th>
                <th className="text-left px-2 font-medium text-gray-500">Comentario</th>
                <th className="text-left px-2 font-medium text-gray-500">Estado</th>
                <th className="text-right px-2 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={10} className="px-2 py-6 text-center text-text-muted text-xs">
                <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...</td></tr>}
              {!loading && pageItems.length === 0 && (
                <tr><td colSpan={10} className="px-2 py-6 text-center text-text-muted text-xs">
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                  No hay dataphones {search || siteFilter ? 'con esos filtros' : 'registrados'}
                </td></tr>
              )}
              {!loading && pageItems.map((d) => (
                <tr key={d.dataphoneId} className="h-8 border-b border-table-border hover:bg-row-hover">
                  <td className="px-2 text-sm font-medium text-text-primary">{d.dataphoneId}</td>
                  <td className="px-2 text-sm text-text-primary">{d.name}</td>
                  <td className="px-2 text-sm text-text-secondary">{d.siteId}</td>
                  <td className="px-2 text-sm text-text-secondary">#{d.dataphoneSupplierId}</td>
                  <td className="px-2 text-sm text-text-secondary font-mono">{d.dataphoneIpAddress}</td>
                  <td className="px-2 text-sm text-text-secondary font-mono">{d.terminalRequestPort} → {d.dataphoneResponsePort}</td>
                  <td className="px-2 text-sm text-text-secondary font-mono">{(d.transTimeout / 1000).toFixed(0)}s</td>
                  <td className="px-2 text-xs text-text-secondary max-w-[160px] truncate" title={d.comment || ''}>{d.comment?.trim() || '—'}</td>
                  <td className="px-2 text-sm">
                    <button onClick={() => toggleActive(d)} className="cursor-pointer">
                      <StatusDot color={d.active ? 'green' : 'gray'} label={d.active ? 'Activo' : 'Inactivo'} />
                    </button>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <CompactButton variant="icon" onClick={() => { setToTest(d); setTestOpen(true); }} title="Probar conexión" disabled={!d.active}><Zap className={`w-3.5 h-3.5 ${d.active ? 'text-amber-600' : 'text-gray-300'}`} /></CompactButton>
                      <CompactButton variant="icon" onClick={() => { setSelected(d); setModalMode('view'); setModalOpen(true); }} title="Ver"><Eye className="w-3.5 h-3.5 text-text-secondary" /></CompactButton>
                      <CompactButton variant="icon" onClick={() => { setSelected(d); setModalMode('edit'); setModalOpen(true); }} title="Editar"><Edit className="w-3.5 h-3.5 text-blue-600" /></CompactButton>
                      <CompactButton variant="icon" onClick={() => { setToDelete(d); setDeleteOpen(true); }} title="Eliminar"><Trash2 className="w-3.5 h-3.5 text-red-600" /></CompactButton>
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
            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} itemLabel="dataphones" />
        )}
      </div>

      <DataphoneModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        dataphone={selected} mode={modalMode} onSuccess={refresh} />
      <DeleteDataphoneDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
        dataphone={toDelete} onSuccess={refresh} />
      <TestConnectionModal isOpen={testOpen} onClose={() => setTestOpen(false)} dataphone={toTest} />
    </div>
  );
};

export default DataphonesSection;
