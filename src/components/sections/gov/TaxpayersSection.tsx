import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { taxpayerService } from '../../../services/taxpayerService';
import { ITaxpayer } from '../../../types/taxpayer';
import TaxpayerModal from './TaxpayerModal';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

const LIMIT = 50;

const TaxpayersSection: React.FC = () => {
  const [taxpayers, setTaxpayers] = useState<ITaxpayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTaxpayer, setEditingTaxpayer] = useState<ITaxpayer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await taxpayerService.getTaxpayers(p, LIMIT, q);
      setTaxpayers(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 0);
      setHasNext(res.hasNext);
      setHasPrev(res.hasPrev);
    } catch {
      toast.error('Error al cargar contribuyentes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1, ''); }, [load]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
      load(1, value);
    }, 500);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
    load(1, '');
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
    load(newPage, search);
  };

  const handleCreate = () => { setEditingTaxpayer(null); setShowModal(true); };
  const handleEdit = (t: ITaxpayer) => { setEditingTaxpayer(t); setShowModal(true); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el contribuyente "${name}"?`)) return;
    setDeletingId(id);
    const res = await taxpayerService.deleteTaxpayer(id);
    setDeletingId(null);
    if (res.successful) { toast.success('Contribuyente eliminado'); load(page, search); }
    else toast.error(res.error || 'Error al eliminar');
  };

  const handleImport = async () => {
    if (!confirm('¿Sincronizar contribuyentes desde DGII? Este proceso puede tardar varios minutos.')) return;
    setImporting(true);
    const res = await taxpayerService.importFromDGII();
    setImporting(false);
    if (res.successful) toast.success('Sincronizacion iniciada correctamente');
    else toast.error(res.error || 'Error al sincronizar');
  };

  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por RNC o nombre..."
        chips={[
          { label: "Total", value: total > 0 ? total.toLocaleString() : '...', color: "blue" },
        ]}
      >
        {searchInput && (
          <CompactButton variant="icon" onClick={clearSearch}>
            <X className="w-3.5 h-3.5" />
          </CompactButton>
        )}
        <CompactButton variant="ghost" onClick={handleImport} disabled={importing}>
          {importing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {importing ? 'Sincronizando...' : 'Sincronizar DGII'}
        </CompactButton>
        <CompactButton variant="primary" onClick={handleCreate}>
          <Plus className="w-3.5 h-3.5" /> Nuevo
        </CompactButton>
        <CompactButton variant="icon" onClick={() => load(page, search)} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </Toolbar>

      {/* Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  {['RNC / ID', 'Nombre', 'Tipo', 'Validado', 'Activo', 'Acciones'].map(h => (
                    <th key={h} className="px-2 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {taxpayers.map((t) => (
                  <tr key={t.taxpayerId}
                    className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover transition-colors">
                    <td className="px-2 text-sm whitespace-nowrap font-mono font-medium text-gray-900">{t.taxpayerId}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-ellipsis overflow-hidden max-w-[250px]" title={t.name}>{t.name.trim()}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-500">{t.type === 0 ? 'Persona Juridica' : 'Persona Fisica'}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <StatusDot color={t.validated ? 'green' : 'red'} label={t.validated ? 'Si' : 'No'} />
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <StatusDot color={t.active ? 'blue' : 'gray'} label={t.active ? 'Activo' : 'Inactivo'} />
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(t)}
                          className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm" title="Editar">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(t.taxpayerId, t.name)}
                          disabled={deletingId === t.taxpayerId}
                          className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm disabled:opacity-50" title="Eliminar">
                          {deletingId === t.taxpayerId
                            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {taxpayers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-2 py-6 text-center text-sm text-gray-400">
                      {search ? `Sin resultados para "${search}"` : 'No hay contribuyentes'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between px-2 py-1 border-t border-gray-200 text-xs text-gray-600">
            <div>
              Pag. <span className="font-semibold">{page}</span> de{' '}
              <span className="font-semibold">{totalPages.toLocaleString()}</span>
              {' / '}
              <span className="font-semibold">{total.toLocaleString()}</span> registros
              {search && <span className="ml-1 text-blue-600">filtrados</span>}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={!hasPrev || loading}
                className="flex items-center gap-0.5 px-2 py-0.5 text-xs rounded-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-3 h-3" /> Ant.
              </button>

              <div className="flex items-center gap-0.5">
                {pageNumbers().map((p, i) =>
                  p === '...'
                    ? <span key={`dots-${i}`} className="px-1 text-gray-400 text-xs">...</span>
                    : <button
                        key={p}
                        onClick={() => goToPage(p as number)}
                        disabled={loading}
                        className={`min-w-[24px] h-6 rounded-sm text-xs font-medium transition-colors ${
                          p === page
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}>
                        {p}
                      </button>
                )}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={!hasNext || loading}
                className="flex items-center gap-0.5 px-2 py-0.5 text-xs rounded-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                Sig. <ChevronRight className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-1 ml-2 text-xs text-gray-600">
                <span>Ir a:</span>
                <input
                  type="number" min={1} max={totalPages}
                  defaultValue={page}
                  key={page}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = parseInt((e.target as HTMLInputElement).value);
                      if (val >= 1 && val <= totalPages) goToPage(val);
                    }
                  }}
                  className="w-14 h-6 px-1 text-xs border border-gray-300 rounded-sm text-center"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <TaxpayerModal
          taxpayer={editingTaxpayer}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(page, search); }}
        />
      )}
    </div>
  );
};

export default TaxpayersSection;
