import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, RefreshCw, X, FuelIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import fuelTransactionService, { FuelTransaction, FuelTransactionsPagination } from '../../../services/fuelTransactionService';
import { useHeader } from '../../../context/HeaderContext';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';

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

  // Actualizar subtítulo en el header
  useEffect(() => {
    setSubtitle('Transacciones de dispensadoras de combustible');
    return () => {
      setSubtitle('');
    };
  }, [setSubtitle]);

  // Función para obtener las transacciones
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
        sortOrder: 'desc' // Ordenar por fecha descendente por defecto
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
          // Si no hay paginación del servidor, calcularla localmente
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
        toast.error('Error al obtener transacciones', {
          duration: 3000,
          icon: '❌',
        });
      }
    } catch (err) {
      console.error('Error al obtener transacciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al obtener transacciones', {
        duration: 3000,
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  }, [pumpFilter, nozzleFilter, fuelGradeFilter, startDateFilter, endDateFilter, currentPage, itemsPerPage]);

  // Cargar transacciones al montar y cuando cambian los filtros
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Limpiar filtros
  const handleClearFilters = () => {
    setPumpFilter('');
    setNozzleFilter('');
    setFuelGradeFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Calcular total de páginas
  const totalPages = pagination?.totalPages || Math.ceil(transactions.length / itemsPerPage);

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Formatear fecha
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

  // Formatear hora
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

  // Obtener valores únicos para los filtros
  const uniquePumps = Array.from(new Set(transactions.map(t => t.pump))).sort((a, b) => a - b);
  const uniqueNozzles = Array.from(new Set(transactions.map(t => t.nozzle))).sort((a, b) => a - b);
  const uniqueFuelGrades = Array.from(new Set(transactions.map(t => t.fuel_grade_id))).sort((a, b) => a - b);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botones de acción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchTransactions()}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </motion.button>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dispensadora (Pump)</label>
              <select
                value={pumpFilter}
                onChange={(e) => setPumpFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Manguera (Nozzle)</label>
              <select
                value={nozzleFilter}
                onChange={(e) => setNozzleFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Combustible</label>
              <select
                value={fuelGradeFilter}
                onChange={(e) => setFuelGradeFilter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {uniqueFuelGrades.map((gradeId) => {
                  const transaction = transactions.find(t => t.fuel_grade_id === gradeId);
                  return (
                    <option key={gradeId} value={gradeId}>
                      {mapFuelProductName(transaction?.fuel_grade_name) || `Grade ${gradeId}`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </motion.div>
      )}

      {/* Mensaje de error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* Tabla de transacciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dispensadora</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Manguera</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Volumen</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.transaction_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {transaction.transaction_id}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="text-gray-900">{formatDate(transaction.transaction_date)}</div>
                      <div className="text-gray-500">{formatTime(transaction.transaction_date)}</div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <FuelIcon className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Pump {transaction.pump}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      Nozzle {transaction.nozzle}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="text-gray-900 font-medium">{mapFuelProductName(transaction.fuel_grade_name) || transaction.product_name}</div>
                      {transaction.fuel_grade_name && (
                        <div className="text-gray-500 text-xs">{transaction.fuel_grade_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {transaction.volume.toFixed(2)} G.
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {formatCurrency(transaction.price)}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {transaction.is_offline ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                          Offline
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-600">
                          Online
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <FuelIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron transacciones</h3>
            <p className="text-gray-500 text-center max-w-md">
              No hay transacciones que coincidan con los filtros aplicados.
            </p>
          </div>
        )}
      </motion.div>

      {/* Paginación */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              {pagination ? (
                <>
                  Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{' '}
                  <span className="font-medium">{pagination.total}</span> transacciones
                </>
              ) : (
                <>
                  Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, transactions.length)}</span> de{' '}
                  <span className="font-medium">{transactions.length}</span> transacciones
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                Items por página:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={async (e) => {
                  const newLimit = parseInt(e.target.value, 10);
                  if (newLimit !== itemsPerPage) {
                    setItemsPerPage(newLimit);
                    setCurrentPage(1);
                    // Llamar directamente con los nuevos valores
                    await fetchTransactions(1, newLimit);
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1);
                setCurrentPage(newPage);
              }}
              disabled={!pagination?.hasPrev && currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            {/* Mostrar números de página */}
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
                  className={`px-3 py-1 text-sm rounded transition-colors ${
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
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FuelTransactionsSection;

