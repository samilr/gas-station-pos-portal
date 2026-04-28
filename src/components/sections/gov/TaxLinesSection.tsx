import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Receipt } from 'lucide-react';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
import useTaxLines from '../../../hooks/useTaxLines';
import { useListTaxesQuery } from '../../../store/api/taxesApi';
import { ITax } from '../../../types/tax';

const TaxLinesSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const [selectedTaxId, setSelectedTaxId] = useState<string>('');

  const { data: taxesData, isLoading: taxesLoading } = useListTaxesQuery();
  const taxes: ITax[] = taxesData ?? [];

  const { taxLines, loading, error, refresh } = useTaxLines(selectedTaxId || undefined);

  useEffect(() => {
    setSubtitle('Líneas de impuesto por tax ID');
    return () => setSubtitle('');
  }, [setSubtitle]);

  useEffect(() => {
    if (!selectedTaxId && taxes.length > 0) setSelectedTaxId(taxes[0].taxId);
  }, [taxes, selectedTaxId]);

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('es-DO'); } catch { return iso; }
  };

  const totals = useMemo(() => ({
    total: taxLines.length,
    active: taxLines.filter((l) => l.status).length,
  }), [taxLines]);

  return (
    <div className="space-y-1">
      <Toolbar
        chips={[
          { label: 'Líneas', value: totals.total, color: 'blue' },
          { label: 'Activas', value: totals.active, color: 'green' },
        ]}
      >
        <select
          value={selectedTaxId}
          onChange={(e) => setSelectedTaxId(e.target.value)}
          disabled={taxesLoading}
          className="h-7 px-2 text-xs border border-gray-300 rounded-sm min-w-[200px]"
        >
          <option value="">— Selecciona tax —</option>
          {taxes.map((t) => (
            <option key={t.taxId} value={t.taxId}>{t.taxId} · {t.name}</option>
          ))}
        </select>
        <CompactButton variant="ghost" onClick={refresh} disabled={loading || !selectedTaxId}>
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
      </Toolbar>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-sm border border-table-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
              <th className="text-left px-2 font-medium text-gray-500 w-16">Línea</th>
              <th className="text-left px-2 font-medium text-gray-500">Tax ID</th>
              <th className="text-left px-2 font-medium text-gray-500">Inicio</th>
              <th className="text-left px-2 font-medium text-gray-500">Fin</th>
              <th className="text-right px-2 font-medium text-gray-500">Tasa</th>
              <th className="text-left px-2 font-medium text-gray-500 w-28">Estado</th>
            </tr>
          </thead>
          <tbody>
            {!selectedTaxId && (
              <tr><td colSpan={6} className="px-2 py-6 text-center text-text-muted text-xs">
                <Receipt className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                Selecciona un impuesto para ver sus líneas
              </td></tr>
            )}
            {selectedTaxId && loading && (
              <tr><td colSpan={6} className="px-2 py-6 text-center text-text-muted text-xs">
                <RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...
              </td></tr>
            )}
            {selectedTaxId && !loading && taxLines.length === 0 && !error && (
              <tr><td colSpan={6} className="px-2 py-6 text-center text-text-muted text-xs">
                No hay líneas para este impuesto
              </td></tr>
            )}
            {!loading && taxLines.map((l) => (
              <tr key={`${l.taxId}-${l.line}`} className="h-8 border-b border-table-border hover:bg-row-hover">
                <td className="px-2 text-sm font-medium text-text-primary">#{l.line}</td>
                <td className="px-2 text-sm text-text-secondary">{l.taxId}</td>
                <td className="px-2 text-sm text-text-secondary">{formatDate(l.startTime)}</td>
                <td className="px-2 text-sm text-text-secondary">{formatDate(l.endTime)}</td>
                <td className="px-2 text-sm text-right font-mono">{(l.rate * 100).toFixed(2)}%</td>
                <td className="px-2 text-sm">
                  <StatusDot color={l.status ? 'green' : 'gray'} label={l.status ? 'Activa' : 'Inactiva'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxLinesSection;
