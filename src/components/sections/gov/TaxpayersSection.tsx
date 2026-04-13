import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Search, Plus, Edit2, Trash2, RefreshCw, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { taxpayerService } from '../../../services/taxpayerService';
import { ITaxpayer } from '../../../types/taxpayer';
import TaxpayerModal from './TaxpayerModal';

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

  // Carga inicial
  useEffect(() => { load(1, ''); }, [load]);

  // Debounce del search — resetea a página 1 en cada búsqueda
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
    if (res.successful) toast.success('Sincronización iniciada correctamente');
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Contribuyentes</h1>
              <p className="text-sm text-gray-500">
                {total > 0
                  ? `${total.toLocaleString()} registros${search ? ` para "${search}"` : ''}`
                  : 'Cargando...'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleImport} disabled={importing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors">
              {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {importing ? 'Sincronizando...' : 'Sincronizar Contribuyentes con DGII'}
            </button>
            <button onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Nuevo
            </button>
            <button onClick={() => load(page, search)} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por RNC o nombre... (búsqueda en servidor)"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {searchInput && (
            <button onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Cargando contribuyentes...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['RNC / ID', 'Nombre', 'Tipo', 'Validado', 'Activo', 'Acciones'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence mode="wait">
                  {taxpayers.map((t, i) => (
                    <motion.tr key={t.taxpayerId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.015 }}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">{t.taxpayerId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={t.name}>{t.name.trim()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.type === 0 ? 'Persona Jurídica' : 'Persona Física'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${t.validated ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {t.validated ? '✓ Sí' : '✗ No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${t.active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          {t.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(t)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(t.taxpayerId, t.name)}
                            disabled={deletingId === t.taxpayerId}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Eliminar">
                            {deletingId === t.taxpayerId
                              ? <RefreshCw className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {taxpayers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">
                        {search ? `Sin resultados para "${search}"` : 'No hay contribuyentes'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 gap-3">
            {/* Info */}
            <div className="text-sm text-gray-600">
              Página <span className="font-semibold">{page}</span> de{' '}
              <span className="font-semibold">{totalPages.toLocaleString()}</span>
              {' · '}
              <span className="font-semibold">{total.toLocaleString()}</span> contribuyentes
              {search && <span className="ml-1 text-blue-600">· filtrados</span>}
            </div>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={!hasPrev || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <div className="flex items-center gap-1 mx-1">
                {pageNumbers().map((p, i) =>
                  p === '...'
                    ? <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    : <button
                        key={p}
                        onClick={() => goToPage(p as number)}
                        disabled={loading}
                        className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}>
                        {p}
                      </button>
                )}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={!hasNext || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Go to page */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
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
                className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </motion.div>

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
