import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Filter, RefreshCw, X, FuelIcon, UserCheck, UserX, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FuelTransaction, FuelTransactionsPagination, FuelStats } from '../../../services/fuelTransactionService';
import { store } from '../../../store';
import { fuelTransactionsApi, ListFuelTransactionsParams } from '../../../store/api/fuelTransactionsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { useHeader } from '../../../context/HeaderContext';
import { useSelectedSiteId } from '../../../hooks/useSelectedSite';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import { CompactButton, Pagination, Toolbar } from '../../ui';
import AssignStaftModal from './AssignStaftModal';
import FuelTransactionDetailModal from './FuelTransactionDetailModal';
import ReconcileStaftModal from '../users/ReconcileStaftModal';

const FuelTransactionsSection: React.FC = () => {
  const [transactions, setTransactions] = useState<FuelTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<FuelTransactionsPagination | null>(null);
  const [serverStats, setServerStats] = useState<FuelStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { setSubtitle } = useHeader();
  const globalSiteId = useSelectedSiteId();

  // Filtros
  const [pumpFilter, setPumpFilter] = useState<number | ''>('');
  const [nozzleFilter, setNozzleFilter] = useState<number | ''>('');
  const [fuelGradeFilter, setFuelGradeFilter] = useState<number | ''>('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Estados para opciones de filtros (se actualizan con la data de la API)
  const [availablePumps, setAvailablePumps] = useState<number[]>([]);
  const [availableNozzles, setAvailableNozzles] = useState<number[]>([]);
  const [availableGrades, setAvailableGrades] = useState<{ id: number; name: string }[]>([]);

  const [assignModalId, setAssignModalId] = useState<number | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<FuelTransaction | null>(null);
  const [reconcileOpen, setReconcileOpen] = useState(false);

  useEffect(() => {
    setSubtitle('Transacciones de dispensadoras de combustible');
    return () => {
      setSubtitle('');
    };
  }, [setSubtitle]);

  const fetchTransactions = useCallback(async (overridePage?: number, overrideLimit?: number) => {
    try {
      setLoading(true);
      setError(null);

      const pageToUse = typeof overridePage === 'number' ? overridePage : currentPage;
      const limitToUse = typeof overrideLimit === 'number' ? overrideLimit : itemsPerPage;

      const params: ListFuelTransactionsParams = {
        page: pageToUse,
        limit: limitToUse,
        sortBy: 'transaction_date',
        sortOrder: 'desc',
      };

      if (globalSiteId) params.siteId = globalSiteId;
      if (pumpFilter !== '') params.pump = pumpFilter;
      if (nozzleFilter !== '') params.nozzle = nozzleFilter;
      if (fuelGradeFilter !== '') params.fuelGradeId = fuelGradeFilter;
      if (startDateFilter) params.startDate = startDateFilter;
      if (endDateFilter) params.endDate = endDateFilter;

      const result = await store
        .dispatch(fuelTransactionsApi.endpoints.listFuelTransactions.initiate(params, { forceRefetch: true }))
        .unwrap();

      const items: FuelTransaction[] = result.data ?? [];
      setTransactions(items);
      setServerStats(result.statistics || null);

      const pumps = Array.from(new Set(items.map((t) => t.pump))).sort((a, b) => a - b);
      const nozzles = Array.from(new Set(items.map((t) => t.nozzle))).sort((a, b) => a - b);
      const grades = Array.from(new Set(items.map((t) => t.fuelGradeId))).map((id) => ({
        id,
        name: items.find((t) => t.fuelGradeId === id)?.fuelGradeName || `Grado ${id}`,
      })).sort((a, b) => a.id - b.id);

      setAvailablePumps(pumps);
      setAvailableNozzles(nozzles);
      setAvailableGrades(grades);

      if (result.pagination) {
        setPagination(result.pagination);
      } else {
        const total = items.length;
        const totalPages = Math.ceil(total / limitToUse);
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
  }, [pumpFilter, nozzleFilter, fuelGradeFilter, startDateFilter, endDateFilter, currentPage, itemsPerPage, globalSiteId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleClearFilters = () => {
    setPumpFilter('');
    setNozzleFilter('');
    setFuelGradeFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setCurrentPage(1);
    setShowFilters(false);
  };

  const stats = useMemo(() => {
    // Totales de la página actual para fallback o campos no provistos por el server
    const pageAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const pageVolume = transactions.reduce((sum, t) => sum + t.volume, 0);
    const onlineCount = transactions.filter(t => !t.isOffline).length;
    const offlineCount = transactions.filter(t => t.isOffline).length;

    // Totales por producto (locales de la página)
    const byProduct: Record<string, { amount: number; volume: number }> = {};
    transactions.forEach(t => {
      const productName = mapFuelProductName(t.fuelGradeName);
      if (!byProduct[productName]) {
        byProduct[productName] = { amount: 0, volume: 0 };
      }
      byProduct[productName].amount += t.amount;
      byProduct[productName].volume += t.volume;
    });

    return {
      totalAmount: serverStats?.totalAmount ?? pageAmount,
      totalVolume: serverStats?.totalVolume ?? pageVolume,
      totalTransactions: serverStats?.totalTransactions ?? transactions.length,
      onlineCount,
      offlineCount,
      count: transactions.length,
      byProduct
    };
  }, [transactions, serverStats]);

  const totalPages = pagination?.totalPages || Math.ceil(transactions.length / itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-DO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar con contadores */}
      <Toolbar
        chips={[
          { label: 'Total Trans.', value: stats.totalTransactions, color: 'gray' },
          { label: 'Monto Total', value: formatCurrency(stats.totalAmount), color: 'blue' },
          { label: 'Volumen Total', value: `${stats.totalVolume.toFixed(2)} G.`, color: 'sky' },
          { label: 'Online', value: stats.onlineCount, color: 'green' },
          { label: 'Offline', value: stats.offlineCount, color: stats.offlineCount > 0 ? 'red' : 'gray' },
        ]}
      >
        <CompactButton
          variant="ghost"
          onClick={() => setReconcileOpen(true)}
          disabled={!globalSiteId}
          title="Asigna staff a las ventas con staft_id NULL en un rango de fechas"
        >
          <Wand2 className="w-3.5 h-3.5" />
          Reconciliar atribuciones
        </CompactButton>
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

      {/* Totalizadores por producto */}
      {Object.keys(stats.byProduct).length > 0 && (
        <div className="h-8 flex items-center gap-3 px-1 mb-2 flex-shrink-0 flex-wrap">
          <span className="text-2xs uppercase tracking-wide text-text-muted flex items-center gap-1">
            <FuelIcon className="w-3 h-3" />
            Por producto
          </span>
          {Object.entries(stats.byProduct).map(([name, data]) => (
            <span key={name} className="flex items-center gap-1 text-sm text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              {name}{' '}
              <strong className="text-text-primary font-mono">{formatCurrency(data.amount)}</strong>
              <span className="text-2xs text-text-muted font-mono">
                · {data.volume.toFixed(2)} G.
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Panel de filtros */}
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
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Dispensadora (Pump)</label>
              <select
                value={pumpFilter}
                onChange={(e) => setPumpFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">Todas</option>
                {availablePumps.map((pump) => (
                  <option key={pump} value={pump}>
                    Dispensadora {pump}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Manguera (Nozzle)</label>
              <select
                value={nozzleFilter}
                onChange={(e) => setNozzleFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">Todas</option>
                {availableNozzles.map((nozzle) => (
                  <option key={nozzle} value={nozzle}>
                    Manguera {nozzle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Tipo de Combustible</label>
              <select
                value={fuelGradeFilter}
                onChange={(e) => setFuelGradeFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">Todos</option>
                {availableGrades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {mapFuelProductName(grade.name)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Fecha Inicio</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Fecha Fin</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-gray-100">
            <CompactButton variant="ghost" onClick={handleClearFilters}>
              Limpiar
            </CompactButton>
            <CompactButton variant="primary" onClick={() => {
              setCurrentPage(1);
              fetchTransactions(1);
              setShowFilters(false);
            }}>
              Aplicar Filtros
            </CompactButton>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 flex items-center space-x-2">
          <span className="text-red-700 text-xs font-medium">{error}</span>
        </div>
      )}

      {/* Tabla de transacciones */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  <th className="text-left px-2 font-semibold text-gray-600">Fecha/Hora</th>
                  <th className="text-left px-2 font-semibold text-gray-600">Dispensadora</th>
                  <th className="text-left px-2 font-semibold text-gray-600">Manguera</th>
                  <th className="text-left px-2 font-semibold text-gray-600">Producto</th>
                  <th className="text-right px-2 font-semibold text-gray-600">Volumen</th>
                  <th className="text-right px-2 font-semibold text-gray-600">Precio</th>
                  <th className="text-right px-2 font-semibold text-gray-600">Monto</th>
                  <th className="text-center px-2 font-semibold text-gray-600 w-24">Cajero</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.transactionId}
                    onClick={() => setDetailTransaction(transaction)}
                    className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover transition-colors cursor-pointer"
                    title="Ver detalle"
                  >
                    <td className="px-2 text-[13px] whitespace-nowrap">
                      <span className="text-gray-900 font-medium">{formatDate(transaction.transactionDate)}</span>
                      <span className="text-gray-500 ml-1.5 text-xs">{formatTime(transaction.transactionDate)}</span>
                    </td>
                    <td className="px-2 text-sm text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FuelIcon className="w-3 h-3 text-gray-400" />
                        <span>Pump {transaction.pump}</span>
                      </div>
                    </td>
                    <td className="px-2 text-sm text-gray-700 whitespace-nowrap">
                      Manguera {transaction.nozzle}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 text-xs font-semibold">
                        {mapFuelProductName(transaction.fuelGradeName)}
                      </span>
                    </td>
                    <td className="px-2 text-[13px] text-gray-900 text-right font-mono whitespace-nowrap">
                      {transaction.volume.toFixed(3)} <span className="text-gray-400 text-[10px]">G.</span>
                    </td>
                    <td className="px-2 text-[13px] text-gray-600 text-right font-mono whitespace-nowrap">
                      {formatCurrency(transaction.price)}
                    </td>
                    <td className="px-2 text-sm font-bold text-gray-900 text-right font-mono whitespace-nowrap tabular-nums">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-2 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignModalId(transaction.transactionId);
                        }}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-xs transition-colors ${
                          transaction.staftId != null
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-dashed border-gray-300'
                        }`}
                        title={transaction.staftId != null ? 'Cambiar cajero asignado' : 'Asignar cajero'}
                      >
                        {transaction.staftId != null ? (
                          <><UserCheck className="w-3 h-3" /><span className="font-mono">#{transaction.staftId}</span></>
                        ) : (
                          <><UserX className="w-3 h-3" /><span>Asignar</span></>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-3 bg-gray-50/50">
            <FuelIcon className="w-10 h-10 text-gray-200 mb-2" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1 uppercase tracking-tight">No se encontraron transacciones</h3>
            <p className="text-gray-500 text-xs text-center max-w-sm">
              No hay transacciones registradas que coincidan con los criterios de búsqueda actuales. Prueba ajustando los filtros.
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
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

      {assignModalId != null && (
        <AssignStaftModal
          transactionId={assignModalId}
          onClose={() => setAssignModalId(null)}
          onSaved={() => { setAssignModalId(null); fetchTransactions(); }}
        />
      )}

      <FuelTransactionDetailModal
        isOpen={detailTransaction !== null}
        onClose={() => setDetailTransaction(null)}
        transaction={detailTransaction}
      />

      <ReconcileStaftModal
        isOpen={reconcileOpen}
        onClose={() => setReconcileOpen(false)}
        defaults={{
          siteId: globalSiteId ?? null,
          startDate: startDateFilter || undefined,
          endDate: endDateFilter || undefined,
          pumpId: pumpFilter === '' ? undefined : Number(pumpFilter),
        }}
      />
    </div>
  );
};

export default FuelTransactionsSection;

