import React, { useState, useEffect, useCallback } from 'react';
import { Filter, RefreshCw, X, FuelIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import fuelTransactionService, { FuelTransaction, FuelTransactionsPagination } from '../../../services/fuelTransactionService';
import { useHeader } from '../../../context/HeaderContext';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';

const FuelTransactionsSection: React.FC = () => {
  const [transactions, setTransactions] = useState<FuelTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<FuelTransactionsPagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { setSubtitle } = useHeader();

  // Filtros
  const [pumpFilter, setPumpFilter] = useState<number | ''>('');
  const [nozzleFilter, setNozzleFilter] = useState<number | ''>('');
  const [fuelGradeFilter, setFuelGradeFilter] = useState<number | ''>('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

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

      const params: any = {
        page: pageToUse,
        limit: limitToUse,
        sortBy: 'transaction_date',
        sortOrder: 'desc'
      };

      if (pumpFilter !== '') params.pump = pumpFilter;
      if (nozzleFilter !== '') params.nozzle = nozzleFilter;
      if (fuelGradeFilter !== '') params.fuelGradeId = fuelGradeFilter;
      if (startDateFilter) params.startDate = startDateFilter;
      if (endDateFilter) params.endDate = endDateFilter;

      const response = await fuelTransactionService.getFuelTransactions(params);

      if (response.successful) {
        setTransactions(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        } else {
          const total = response.data.length;
          const totalPages = Math.ceil(total / limitToUse);
          setPagination({
            page: pageToUse,
            limit: limitToUse,
            total: total,
            totalPages: totalPages,
            hasNext: pageToUse < totalPages,
            hasPrev: pageToUse > 1
          });
        }
      } else {
        setError(response.error || 'Error al obtener transacciones');
        toast.error('Error al obtener transacciones', { duration: 3000 });
      }
    } catch (err) {
      console.error('Error al obtener transacciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al obtener transacciones', { duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [pumpFilter, nozzleFilter, fuelGradeFilter, startDateFilter, endDateFilter, currentPage, itemsPerPage]);

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

  const uniquePumps = Array.from(new Set(transactions.map(t => t.pump))).sort((a, b) => a - b);
  const uniqueNozzles = Array.from(new Set(transactions.map(t => t.nozzle))).sort((a, b) => a - b);
  const uniqueFuelGrades = Array.from(new Set(transactions.map(t => t.fuelGradeId))).sort((a, b) => a - b);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <div className="h-8 flex items-center gap-1 px-1 mb-1 flex-shrink-0">
        <CompactButton
          variant={showFilters ? 'primary' : 'ghost'}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-3.5 h-3.5" />
          Filtros
        </CompactButton>
        <CompactButton
          variant="ghost"
          onClick={() => fetchTransactions()}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white rounded-sm border border-gray-200 p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-900">Filtros de Busqueda</h3>
            <CompactButton variant="icon" onClick={() => setShowFilters(false)}>
              <X className="w-3.5 h-3.5" />
            </CompactButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Dispensadora (Pump)</label>
              <select
                value={pumpFilter}
                onChange={(e) => setPumpFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {Array.from({ length: 18 }, (_, i) => i + 1).map((pump) => (
                  <option key={pump} value={pump}>
                    Dispensadora {pump}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Manguera (Nozzle)</label>
              <select
                value={nozzleFilter}
                onChange={(e) => setNozzleFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {Array.from({ length: 6 }, (_, i) => i + 1).map((nozzle) => (
                  <option key={nozzle} value={nozzle}>
                    Manguera {nozzle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Tipo de Combustible</label>
              <select
                value={fuelGradeFilter}
                onChange={(e) => setFuelGradeFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {uniqueFuelGrades.map((gradeId) => {
                  const transaction = transactions.find(t => t.fuelGradeId === gradeId);
                  return (
                    <option key={gradeId} value={gradeId}>
                      {mapFuelProductName(transaction?.fuelGradeName) || `Grado ${gradeId}`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Fecha Inicio</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Fecha Fin</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 mt-2">
            <CompactButton variant="ghost" onClick={handleClearFilters}>
              Limpiar
            </CompactButton>
            <CompactButton variant="primary" onClick={() => setShowFilters(false)}>
              Aplicar Filtros
            </CompactButton>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 flex items-center space-x-2">
          <span className="text-red-700 text-xs">{error}</span>
        </div>
      )}

      {/* Tabla de transacciones */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header">
                  <th className="text-left px-2 font-medium text-gray-500">ID</th>
                  <th className="text-left px-2 font-medium text-gray-500">Fecha/Hora</th>
                  <th className="text-left px-2 font-medium text-gray-500">Dispensadora</th>
                  <th className="text-left px-2 font-medium text-gray-500">Manguera</th>
                  <th className="text-left px-2 font-medium text-gray-500">Producto</th>
                  <th className="text-left px-2 font-medium text-gray-500">Volumen</th>
                  <th className="text-left px-2 font-medium text-gray-500">Precio</th>
                  <th className="text-left px-2 font-medium text-gray-500">Monto</th>
                  <th className="text-left px-2 font-medium text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.transactionId}
                    className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover"
                  >
                    <td className="px-2 text-sm text-gray-900 whitespace-nowrap">
                      {transaction.transactionId}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <span className="text-gray-900">{formatDate(transaction.transactionDate)}</span>
                      <span className="text-gray-500 ml-1 text-xs">{formatTime(transaction.transactionDate)}</span>
                    </td>
                    <td className="px-2 text-sm text-gray-900 whitespace-nowrap">
                      Pump {transaction.pump}
                    </td>
                    <td className="px-2 text-sm text-gray-900 whitespace-nowrap">
                      Nozzle {transaction.nozzle}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap text-ellipsis overflow-hidden">
                      {mapFuelProductName(transaction.fuelGradeName)}
                    </td>
                    <td className="px-2 text-sm text-gray-900 whitespace-nowrap">
                      {transaction.volume.toFixed(2)} G.
                    </td>
                    <td className="px-2 text-sm text-gray-900 whitespace-nowrap">
                      {formatCurrency(transaction.price)}
                    </td>
                    <td className="px-2 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-2 whitespace-nowrap">
                      {transaction.isOffline ? (
                        <StatusDot color="gray" label="Offline" />
                      ) : (
                        <StatusDot color="green" label="Online" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-3">
            <FuelIcon className="w-8 h-8 text-gray-400 mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No se encontraron transacciones</h3>
            <p className="text-gray-500 text-xs text-center max-w-md">
              No hay transacciones que coincidan con los filtros aplicados.
            </p>
          </div>
        )}
      </div>

      {/* Paginacion */}
      {transactions.length > 0 && (
        <div className="flex items-center justify-between bg-white px-2 py-1 border border-gray-200 rounded-sm">
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-700">
              {pagination ? (
                <>
                  <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>-
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{' '}
                  <span className="font-medium">{pagination.total}</span>
                </>
              ) : (
                <>
                  <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>-
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, transactions.length)}</span> de{' '}
                  <span className="font-medium">{transactions.length}</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <label htmlFor="itemsPerPage" className="text-xs text-gray-700">
                Por pag:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={async (e) => {
                  const newLimit = parseInt(e.target.value, 10);
                  if (newLimit !== itemsPerPage) {
                    setItemsPerPage(newLimit);
                    setCurrentPage(1);
                    await fetchTransactions(1, newLimit);
                  }
                }}
                className="h-7 px-1 text-xs border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1);
                setCurrentPage(newPage);
              }}
              disabled={!pagination?.hasPrev && currentPage === 1}
              className="h-7 w-7 flex items-center justify-center text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`h-7 w-7 flex items-center justify-center text-xs rounded-sm transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => {
                const newPage = Math.min(totalPages, currentPage + 1);
                setCurrentPage(newPage);
              }}
              disabled={!pagination?.hasNext && currentPage === totalPages}
              className="h-7 w-7 flex items-center justify-center text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-sm transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelTransactionsSection;
