import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Receipt } from 'lucide-react';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton, Pagination } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
import useTaxTypes from '../../../hooks/useTaxTypes';

const TaxTypesSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const { taxTypes, loading, error, refresh } = useTaxTypes();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setSubtitle('Catálogo de tipos de impuesto');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return taxTypes;
    return taxTypes.filter((t) =>
      String(t.taxTypeId).includes(q) || t.name.toLowerCase().includes(q)
    );
  }, [taxTypes, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totals = {
    total: taxTypes.length,
    active: taxTypes.filter((t) => t.active).length,
  };

  return (
    <div className="space-y-1">
      <Toolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por ID o nombre..."
        chips={[
          { label: 'Total', value: totals.total, color: 'blue' },
          { label: 'Activos', value: totals.active, color: 'green' },
        ]}
      >
        <CompactButton variant="ghost" onClick={refresh} disabled={loading}>
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
      </Toolbar>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-sm border border-table-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 font-medium text-gray-500 w-24">ID</th>
                <th className="text-left px-2 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-2 font-medium text-gray-500 w-32">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={3} className="px-2 py-6 text-center text-text-muted text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...
                </td></tr>
              )}
              {!loading && pageItems.length === 0 && (
                <tr><td colSpan={3} className="px-2 py-6 text-center text-text-muted text-xs">
                  <Receipt className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                  No hay tipos de impuesto
                </td></tr>
              )}
              {!loading && pageItems.map((t) => (
                <tr key={t.taxTypeId} className="h-8 border-b border-table-border hover:bg-row-hover">
                  <td className="px-2 text-sm font-medium text-text-primary">{t.taxTypeId}</td>
                  <td className="px-2 text-sm text-text-primary">{t.name}</td>
                  <td className="px-2 text-sm">
                    <StatusDot color={t.active ? 'green' : 'gray'} label={t.active ? 'Activo' : 'Inactivo'} />
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
            itemLabel="tipos"
          />
        )}
      </div>
    </div>
  );
};

export default TaxTypesSection;
