import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Filter, RefreshCw, X, FuelIcon, CreditCard, Receipt, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  FuelTransactionAdmin,
  FuelAdminPagination,
  FuelAdminStats,
  cfStatusLabel,
  cfStatusBadgeClass,
} from '../../../services/fuelTransactionAdminService';
import { store } from '../../../store';
import {
  fuelTransactionsApi,
  ListFuelTransactionsAdminParams,
} from '../../../store/api/fuelTransactionsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { useHeader } from '../../../context/HeaderContext';
import { useSelectedSiteId } from '../../../hooks/useSelectedSite';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import { CompactButton, Pagination, Toolbar } from '../../ui';
import SiteAutocomplete from '../../ui/autocompletes/SiteAutocomplete';
import StaftAutocomplete from '../../ui/autocompletes/StaftAutocomplete';
import FuelTransactionAdminDetailModal from './FuelTransactionAdminDetailModal';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(amount);

const formatDate = (dateString: string) => {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-DO', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch { return dateString; }
};

const formatTime = (dateString: string) => {
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return dateString; }
};

const lastFour = (s: string | null | undefined) => (s && s.length > 4 ? s.slice(-4) : s ?? '');

interface RowState {
  badgeText: string;
  badgeClass: string;
  icon: React.ReactNode;
}

const computeRowState = (row: FuelTransactionAdmin): RowState => {
  if (!row.trans) {
    return {
      badgeText: 'Pendiente',
      badgeClass: 'bg-yellow-100 text-yellow-700',
      icon: <AlertCircle className="w-3 h-3" />,
    };
  }
  if (row.cardPayments.length > 0) {
    return {
      badgeText: 'Tarjeta',
      badgeClass: 'bg-blue-100 text-blue-700',
      icon: <CreditCard className="w-3 h-3" />,
    };
  }
  return {
    badgeText: 'Efectivo',
    badgeClass: 'bg-gray-100 text-gray-700',
    icon: <Receipt className="w-3 h-3" />,
  };
};

const FuelTransactionsAdminSection: React.FC = () => {
  const [transactions, setTransactions] = useState<FuelTransactionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<FuelAdminPagination | null>(null);
  const [serverStats, setServerStats] = useState<FuelAdminStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { setSubtitle } = useHeader();
  const globalSiteId = useSelectedSiteId();

  // Filtros
  const [siteFilter, setSiteFilter] = useState<string | null>(null);
  const [staftFilter, setStaftFilter] = useState<number | null>(null);
  const [pumpFilter, setPumpFilter] = useState<number | ''>('');
  const [nozzleFilter, setNozzleFilter] = useState<number | ''>('');
  const [fuelGradeFilter, setFuelGradeFilter] = useState<number | ''>('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [minAmountFilter, setMinAmountFilter] = useState<string>('');
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>('');
  const [ptsIdFilter, setPtsIdFilter] = useState('');

  // Opciones derivadas de la respuesta
  const [availablePumps, setAvailablePumps] = useState<number[]>([]);
  const [availableNozzles, setAvailableNozzles] = useState<number[]>([]);
  const [availableGrades, setAvailableGrades] = useState<{ id: number; name: string }[]>([]);

  const [selectedRow, setSelectedRow] = useState<FuelTransactionAdmin | null>(null);

  useEffect(() => {
    setSubtitle('Vista 360° de transacciones de combustible');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const fetchTransactions = useCallback(async (overridePage?: number, overrideLimit?: number) => {
    try {
      setLoading(true);
      setError(null);

      const pageToUse = typeof overridePage === 'number' ? overridePage : currentPage;
      const limitToUse = typeof overrideLimit === 'number' ? overrideLimit : itemsPerPage;

      const params: ListFuelTransactionsAdminParams = {
        page: pageToUse,
        limit: limitToUse,
        sortBy: 'transaction_date',
        sortOrder: 'desc',
      };

      // El site global "TODAS" deja siteFilter intacto. Si hay site global, overridea.
      const effectiveSiteId = globalSiteId ?? siteFilter ?? null;
      if (effectiveSiteId) params.siteId = effectiveSiteId;
      if (staftFilter != null) params.staftId = staftFilter;
      if (pumpFilter !== '') params.pump = pumpFilter;
      if (nozzleFilter !== '') params.nozzle = nozzleFilter;
      if (fuelGradeFilter !== '') params.fuelGradeId = fuelGradeFilter;
      if (startDateFilter) params.startDate = startDateFilter;
      if (endDateFilter) params.endDate = endDateFilter;
      if (minAmountFilter !== '' && !Number.isNaN(parseFloat(minAmountFilter))) {
        params.minAmount = parseFloat(minAmountFilter);
      }
      if (maxAmountFilter !== '' && !Number.isNaN(parseFloat(maxAmountFilter))) {
        params.maxAmount = parseFloat(maxAmountFilter);
      }
      if (ptsIdFilter.trim()) params.ptsId = ptsIdFilter.trim();

      const result = await store
        .dispatch(fuelTransactionsApi.endpoints.listFuelTransactionsAdmin.initiate(params, { forceRefetch: true }))
        .unwrap();

      const items: FuelTransactionAdmin[] = result.data ?? [];
      setTransactions(items);
      setServerStats(result.statistics ?? null);

      const pumps = Array.from(new Set(items.map((t) => t.pump))).sort((a, b) => a - b);
      const nozzles = Array.from(new Set(items.map((t) => t.nozzle))).sort((a, b) => a - b);
      const grades = Array.from(new Set(items.map((t) => t.fuelGradeId))).map((id) => ({
        id,
        name: items.find((t) => t.fuelGradeId === id)?.fuelGradeName ?? `Grado ${id}`,
      })).sort((a, b) => a.id - b.id);

      setAvailablePumps(pumps);
      setAvailableNozzles(nozzles);
      setAvailableGrades(grades);

      if (result.pagination) {
        setPagination(result.pagination);
      } else {
        const total = items.length;
        const totalPages = Math.max(1, Math.ceil(total / limitToUse));
        setPagination({
          page: pageToUse,
          limit: limitToUse,
          total,
          totalPages,
          hasNext: pageToUse < totalPages,
          hasPrev: pageToUse > 1,
        });
      }
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al obtener transacciones');
      setError(msg);
      toast.error(msg ?? 'Error al obtener transacciones', { duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [
    siteFilter, staftFilter, pumpFilter, nozzleFilter, fuelGradeFilter,
    startDateFilter, endDateFilter, minAmountFilter, maxAmountFilter, ptsIdFilter,
    currentPage, itemsPerPage, globalSiteId,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleClearFilters = () => {
    setSiteFilter(null);
    setStaftFilter(null);
    setPumpFilter('');
    setNozzleFilter('');
    setFuelGradeFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setMinAmountFilter('');
    setMaxAmountFilter('');
    setPtsIdFilter('');
    setCurrentPage(1);
  };

  const stats = useMemo(() => {
    const total = serverStats?.totalTransactions ?? transactions.length;
    const linked = serverStats?.linkedToTransCount ?? transactions.filter(t => t.trans !== null).length;
    const card = serverStats?.withCardPaymentCount ?? transactions.filter(t => t.cardPayments.length > 0).length;
    return {
      totalTransactions: total,
      totalAmount: serverStats?.totalAmount ?? transactions.reduce((s, t) => s + t.amount, 0),
      totalVolume: serverStats?.totalVolume ?? transactions.reduce((s, t) => s + t.volume, 0),
      linkedToTransCount: linked,
      withCardPaymentCount: card,
      pending: total - linked,
    };
  }, [transactions, serverStats]);

  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(transactions.length / itemsPerPage));

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Cuando hay siteId global activo, deshabilitamos el filtro local de site
  const siteFilterDisabled = !!globalSiteId;

  return (
    <div className="space-y-1">
      <Toolbar
        chips={[
          { label: 'Total', value: stats.totalTransactions, color: 'gray' },
          { label: 'Monto', value: formatCurrency(stats.totalAmount), color: 'blue' },
          { label: 'Volumen', value: `${stats.totalVolume.toFixed(2)} G.`, color: 'blue' },
          { label: 'Con Trans', value: `${stats.linkedToTransCount}/${stats.totalTransactions}`, color: 'green' },
          { label: 'Tarjeta', value: stats.withCardPaymentCount, color: 'purple' },
          { label: 'Pendientes', value: stats.pending, color: stats.pending > 0 ? 'orange' : 'gray' },
        ]}
      >
        <CompactButton
          variant={showFilters ? 'primary' : 'icon'}
          onClick={() => setShowFilters(!showFilters)}
          title="Filtros"
        >
          <Filter className={`w-3.5 h-3.5 ${showFilters ? 'text-white' : ''}`} />
        </CompactButton>
        <CompactButton
          variant="icon"
          onClick={() => fetchTransactions()}
          disabled={loading}
          title="Actualizar"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </Toolbar>

      {showFilters && (
        <div className="bg-white rounded-sm border border-gray-200 p-2 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Filtros de Búsqueda</h3>
            </div>
            <CompactButton variant="icon" onClick={() => setShowFilters(false)}>
              <X className="w-3.5 h-3.5" />
            </CompactButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Sucursal</label>
              <SiteAutocomplete
                value={globalSiteId ?? siteFilter}
                onChange={(v) => { setSiteFilter(v); setCurrentPage(1); }}
                disabled={siteFilterDisabled}
                placeholder={siteFilterDisabled ? 'Usando sucursal global' : 'Todas las sucursales'}
                allowClear
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Cajero</label>
              <StaftAutocomplete
                value={staftFilter}
                onChange={(v) => { setStaftFilter(v); setCurrentPage(1); }}
                siteId={globalSiteId ?? siteFilter}
                placeholder="Todos los cajeros"
                allowClear
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Dispensadora</label>
              <select
                value={pumpFilter}
                onChange={(e) => { setPumpFilter(e.target.value === '' ? '' : Number(e.target.value)); setCurrentPage(1); }}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">Todas</option>
                {availablePumps.map((p) => (<option key={p} value={p}>Dispensadora {p}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Manguera</label>
              <select
                value={nozzleFilter}
                onChange={(e) => { setNozzleFilter(e.target.value === '' ? '' : Number(e.target.value)); setCurrentPage(1); }}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">Todas</option>
                {availableNozzles.map((n) => (<option key={n} value={n}>Manguera {n}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Combustible</label>
              <select
                value={fuelGradeFilter}
                onChange={(e) => { setFuelGradeFilter(e.target.value === '' ? '' : Number(e.target.value)); setCurrentPage(1); }}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">Todos</option>
                {availableGrades.map((g) => (
                  <option key={g.id} value={g.id}>{mapFuelProductName(g.name)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Fecha Inicio</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => { setStartDateFilter(e.target.value); setCurrentPage(1); }}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Fecha Fin</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => { setEndDateFilter(e.target.value); setCurrentPage(1); }}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Monto Mín</label>
              <input
                type="number"
                step="0.01"
                value={minAmountFilter}
                onChange={(e) => { setMinAmountFilter(e.target.value); setCurrentPage(1); }}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Monto Máx</label>
              <input
                type="number"
                step="0.01"
                value={maxAmountFilter}
                onChange={(e) => { setMaxAmountFilter(e.target.value); setCurrentPage(1); }}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">PTS ID</label>
              <input
                type="text"
                value={ptsIdFilter}
                onChange={(e) => { setPtsIdFilter(e.target.value); setCurrentPage(1); }}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                placeholder="004A00..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-gray-100">
            <CompactButton variant="ghost" onClick={handleClearFilters}>Limpiar</CompactButton>
            <CompactButton variant="primary" onClick={() => { setShowFilters(false); }}>Cerrar</CompactButton>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 flex items-center space-x-2">
          <span className="text-red-700 text-xs font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  <th className="text-left px-2 font-semibold text-gray-600">Fecha/Hora</th>
                  <th className="text-left px-2 font-semibold text-gray-600">Site / PTS</th>
                  <th className="text-left px-2 font-semibold text-gray-600">Bomba</th>
                  <th className="text-left px-2 font-semibold text-gray-600">Producto</th>
                  <th className="text-right px-2 font-semibold text-gray-600">Volumen</th>
                  <th className="text-right px-2 font-semibold text-gray-600">Monto</th>
                  <th className="text-left px-2 font-semibold text-gray-600">Cajero</th>
                  <th className="text-left px-2 font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-2 font-semibold text-gray-600">NCF</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const rs = computeRowState(t);
                  const isReturn = t.trans?.isReturn === true;
                  return (
                    <tr
                      key={t.transactionId}
                      onClick={() => setSelectedRow(t)}
                      className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover transition-colors cursor-pointer"
                      title="Ver detalle 360°"
                    >
                      <td className="px-2 text-[13px] whitespace-nowrap">
                        <span className="text-gray-900 font-medium">{formatDate(t.transactionDate)}</span>
                        <span className="text-gray-500 ml-1.5 text-xs">{formatTime(t.transactionDate)}</span>
                      </td>
                      <td className="px-2 text-xs text-gray-700 whitespace-nowrap font-mono">
                        {t.siteId ?? '—'} <span className="text-gray-400">·</span> {lastFour(t.ptsId) || '—'}
                      </td>
                      <td className="px-2 text-sm text-gray-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <FuelIcon className="w-3 h-3 text-gray-400" />
                          <span>P{t.pump} · M{t.nozzle}</span>
                        </div>
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 text-xs font-semibold">
                          {mapFuelProductName(t.fuelGradeName)}
                        </span>
                      </td>
                      <td className="px-2 text-[13px] text-gray-900 text-right font-mono whitespace-nowrap">
                        {t.volume.toFixed(3)} <span className="text-gray-400 text-[10px]">G.</span>
                      </td>
                      <td className="px-2 text-sm font-bold text-gray-900 text-right font-mono whitespace-nowrap tabular-nums">
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="px-2 text-xs text-gray-700 whitespace-nowrap">
                        {t.staftId != null ? (
                          <span className="font-mono">#{t.staftId} <span className="text-gray-500">{t.staftName ?? ''}</span></span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-2 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium ${rs.badgeClass}`}>
                            {rs.icon}{rs.badgeText}
                          </span>
                          {isReturn && (
                            <span className="inline-flex px-1.5 py-0.5 rounded text-2xs font-medium bg-red-100 text-red-700">
                              Devolución
                            </span>
                          )}
                          {t.trans?.transNumber && (
                            <span className="font-mono text-2xs text-text-muted">{t.trans.transNumber}</span>
                          )}
                          {t.cardPayments[0]?.cardProduct && (
                            <span className="text-2xs text-text-muted">
                              {t.cardPayments[0].cardProduct} {t.cardPayments[0].maskedPan ?? ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 text-xs whitespace-nowrap">
                        {t.trans?.cfNumber ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono">{t.trans.cfNumber}</span>
                            <span className={`inline-flex px-1 py-0.5 rounded text-2xs font-medium ${cfStatusBadgeClass(t.trans.cfStatus)}`}>
                              {cfStatusLabel(t.trans.cfStatus)}
                            </span>
                          </div>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-3 bg-gray-50/50">
            <FuelIcon className="w-10 h-10 text-gray-200 mb-2" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1 uppercase tracking-tight">No se encontraron transacciones</h3>
            <p className="text-gray-500 text-xs text-center max-w-sm">
              No hay transacciones que coincidan con los filtros actuales. Probá ajustando los filtros o el rango de fechas.
            </p>
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={pagination?.total ?? transactions.length}
          pageSize={pagination?.limit ?? itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={async (newLimit) => {
            if (newLimit !== itemsPerPage) {
              setItemsPerPage(newLimit);
              setCurrentPage(1);
              await fetchTransactions(1, newLimit);
            }
          }}
          itemLabel="transacciones"
        />
      )}

      <FuelTransactionAdminDetailModal
        isOpen={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
        transaction={selectedRow}
      />
    </div>
  );
};

export default FuelTransactionsAdminSection;
