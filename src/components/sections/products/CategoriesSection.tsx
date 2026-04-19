import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Edit, Trash2, Eye, Package, ImageOff } from 'lucide-react';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton, Pagination } from '../../ui';
import Toolbar from '../../ui/Toolbar';
import useCategories from '../../../hooks/useCategories';
import { Category } from '../../../services/categoryService';
import CategoryModal from './CategoryModal';
import DeleteCategoryDialog from './DeleteCategoryDialog';

const CategoryThumb: React.FC<{ url: string | null; name: string }> = ({ url, name }) => {
  const [err, setErr] = useState(false);
  if (!url || err) {
    return (
      <div className="w-8 h-8 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center">
        <ImageOff className="w-3.5 h-3.5 text-gray-400" />
      </div>
    );
  }
  return (
    <img src={url} alt={name} className="w-8 h-8 rounded-sm object-cover border border-gray-200"
      onError={() => setErr(true)} />
  );
};

const CategoriesSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const { categories, loading, error, refresh } = useCategories();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selected, setSelected] = useState<Category | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  useEffect(() => {
    setSubtitle('Categorías de productos');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter((c) =>
      c.categoryId.toLowerCase().includes(q) ||
      c.categoryName.toLowerCase().includes(q) ||
      (c.unitId || '').toLowerCase().includes(q)
    );
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => { setSelected(null); setModalMode('create'); setModalOpen(true); };
  const openEdit = (c: Category) => { setSelected(c); setModalMode('edit'); setModalOpen(true); };
  const openView = (c: Category) => { setSelected(c); setModalMode('view'); setModalOpen(true); };
  const openDelete = (c: Category) => { setToDelete(c); setDeleteOpen(true); };

  return (
    <div className="space-y-1">
      <Toolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por ID, nombre o unidad..."
        chips={[
          { label: 'Total', value: categories.length, color: 'blue' },
        ]}
      >
        <CompactButton variant="ghost" onClick={refresh} disabled={loading}>
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </CompactButton>
        <CompactButton variant="primary" onClick={openCreate}>
          <Plus className="w-3 h-3" /> Nueva
        </CompactButton>
      </Toolbar>

      {error && <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">{error}</div>}

      <div className="bg-white rounded-sm border border-table-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 font-medium text-gray-500 w-12"></th>
                <th className="text-left px-2 font-medium text-gray-500 w-24">ID</th>
                <th className="text-left px-2 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-2 font-medium text-gray-500 w-20">Unidad</th>
                <th className="text-right px-2 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-2 py-6 text-center text-text-muted text-xs">
                <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...</td></tr>}
              {!loading && pageItems.length === 0 && (
                <tr><td colSpan={5} className="px-2 py-6 text-center text-text-muted text-xs">
                  <Package className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                  No hay categorías {search ? 'con ese filtro' : 'registradas'}
                </td></tr>
              )}
              {!loading && pageItems.map((c) => (
                <tr key={c.categoryId} className="h-10 border-b border-table-border hover:bg-row-hover">
                  <td className="px-2"><CategoryThumb url={c.image} name={c.categoryName} /></td>
                  <td className="px-2 text-sm font-medium text-text-primary font-mono">{c.categoryId.trim()}</td>
                  <td className="px-2 text-sm text-text-primary">{c.categoryName}</td>
                  <td className="px-2 text-sm text-text-secondary font-mono">{c.unitId || '—'}</td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <CompactButton variant="icon" onClick={() => openView(c)} title="Ver detalles"><Eye className="w-3.5 h-3.5 text-text-secondary" /></CompactButton>
                      <CompactButton variant="icon" onClick={() => openEdit(c)} title="Editar"><Edit className="w-3.5 h-3.5 text-blue-600" /></CompactButton>
                      <CompactButton variant="icon" onClick={() => openDelete(c)} title="Eliminar"><Trash2 className="w-3.5 h-3.5 text-red-600" /></CompactButton>
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
            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} itemLabel="categorías" />
        )}
      </div>

      <CategoryModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        category={selected} mode={modalMode} onSuccess={refresh} />
      <DeleteCategoryDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
        category={toDelete} onSuccess={refresh} />
    </div>
  );
};

export default CategoriesSection;
