import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Eye, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton, Pagination } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
import useDataphoneSuppliers from '../../../hooks/useDataphoneSuppliers';
import dataphoneSupplierService, { DataphoneSupplier } from '../../../services/dataphoneSupplierService';
import DataphoneSupplierModal from './DataphoneSupplierModal';
import DeleteDataphoneSupplierDialog from './DeleteDataphoneSupplierDialog';

const DataphoneSuppliersSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const { suppliers, loading, error, refresh } = useDataphoneSuppliers();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selected, setSelected] = useState<DataphoneSupplier | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataphoneSupplier | null>(null);

  useEffect(() => {
    setSubtitle('Catálogo de proveedores de dataphone (CardNet, Azul, Visanet...)');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return suppliers;
    return suppliers.filter((s) =>
      String(s.dataphoneSupplierId).includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.comment?.toLowerCase().includes(q) ?? false)
    );
  }, [suppliers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totals = {
    total: suppliers.length,
    active: suppliers.filter((s) => s.active).length,
  };

  const openCreate = () => { setSelected(null); setModalMode('create'); setModalOpen(true); };
  const openEdit = (s: DataphoneSupplier) => { setSelected(s); setModalMode('edit'); setModalOpen(true); };
  const openView = (s: DataphoneSupplier) => { setSelected(s); setModalMode('view'); setModalOpen(true); };
  const openDelete = (s: DataphoneSupplier) => { setToDelete(s); setDeleteOpen(true); };

  const toggleActive = async (s: DataphoneSupplier) => {
    const res = await dataphoneSupplierService.update(s.dataphoneSupplierId, { active: !s.active });
    if (res.successful) { toast.success(`Proveedor ${s.active ? 'desactivado' : 'activado'}`); refresh(); }
    else toast.error(res.error || 'Error al cambiar estado');
  };

  return (
    <div className="space-y-1">
      <Toolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por ID, nombre..."
        chips={[
          { label: 'Total', value: totals.total, color: 'blue' },
          { label: 'Activos', value: totals.active, color: 'green' },
        ]}
      >
        <CompactButton variant="ghost" onClick={refresh} disabled={loading}>
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
        <CompactButton variant="primary" onClick={openCreate}>
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
                <th className="text-left px-2 font-medium text-gray-500">POS Port</th>
                <th className="text-left px-2 font-medium text-gray-500">Resp Port</th>
                <th className="text-left px-2 font-medium text-gray-500">Timeout</th>
                <th className="text-left px-2 font-medium text-gray-500">Comentario</th>
                <th className="text-left px-2 font-medium text-gray-500">Estado</th>
                <th className="text-right px-2 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-2 py-6 text-center text-text-muted text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...
                </td></tr>
              )}
              {!loading && pageItems.length === 0 && (
                <tr><td colSpan={8} className="px-2 py-6 text-center text-text-muted text-xs">
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                  No hay proveedores {search ? 'con ese filtro' : 'registrados'}
                </td></tr>
              )}
              {!loading && pageItems.map((s) => (
                <tr key={s.dataphoneSupplierId} className="h-8 border-b border-table-border hover:bg-row-hover">
                  <td className="px-2 text-sm font-medium text-text-primary">{s.dataphoneSupplierId}</td>
                  <td className="px-2 text-sm text-text-primary">{s.name}</td>
                  <td className="px-2 text-sm text-text-secondary font-mono">{s.posRequestPort}</td>
                  <td className="px-2 text-sm text-text-secondary font-mono">{s.dataphoneResponsePort}</td>
                  <td className="px-2 text-sm text-text-secondary font-mono">{s.transTimeout}ms</td>
                  <td className="px-2 text-sm text-text-secondary truncate max-w-[180px]">{s.comment || '—'}</td>
                  <td className="px-2 text-sm">
                    <button onClick={() => toggleActive(s)} className="cursor-pointer">
                      <StatusDot color={s.active ? 'green' : 'gray'} label={s.active ? 'Activo' : 'Inactivo'} />
                    </button>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <CompactButton variant="icon" onClick={() => openView(s)} title="Ver"><Eye className="w-3.5 h-3.5 text-text-secondary" /></CompactButton>
                      <CompactButton variant="icon" onClick={() => openEdit(s)} title="Editar"><Edit className="w-3.5 h-3.5 text-blue-600" /></CompactButton>
                      <CompactButton variant="icon" onClick={() => openDelete(s)} title="Eliminar"><Trash2 className="w-3.5 h-3.5 text-red-600" /></CompactButton>
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
            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
            itemLabel="proveedores" />
        )}
      </div>

      <DataphoneSupplierModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        supplier={selected} mode={modalMode} onSuccess={refresh} />
      <DeleteDataphoneSupplierDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
        supplier={toDelete} onSuccess={refresh} />
    </div>
  );
};

export default DataphoneSuppliersSection;
