import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  DollarSign, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Building2,
  FileX,
  ChevronUp,
  ChevronDown,
  Smartphone,
  Clock9Icon,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import TransactionModal from './TransactionModal';
import { 
  formatDateOnly,
  formatTimeOnly,
  formatCurrency,
  filterTransactionsBySearch,
  filterTransactionsByStatus,
  getCurrentSantoDomingoDate
} from '../../../utils/transactionUtils';
import { useAuth } from '../../../context/AuthContext';
import { SortField, useTransactions } from '../../../hooks/useTransactions';
import transactionService from '../../../services/transactionService';
import { CFStatus } from '../../../types/transaction';
import { useHeader } from '../../../context/HeaderContext';



interface TransactionsSectionProps {
  isNCFView?: boolean;
  isTiendaView?: boolean;
}

const TransactionsSection: React.FC<TransactionsSectionProps> = ({ isNCFView = false, isTiendaView = false }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [showReverseDialog, setShowReverseDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [transactionToReverse, setTransactionToReverse] = useState<string | null>(null);
  
  // Estados temporales para el modal de filtros (no afectan la búsqueda hasta aplicar)
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [tempTransNumberFilter, setTempTransNumberFilter] = useState('');
  const [tempCfNumberFilter, setTempCfNumberFilter] = useState('');
  const [tempStatusFilter, setTempStatusFilter] = useState<number | ''>('');
  const [tempCfTypeFilter, setTempCfTypeFilter] = useState('');
  const [tempSiteIdFilter, setTempSiteIdFilter] = useState('');
  const [tempTerminalFilter, setTempTerminalFilter] = useState<number | ''>('');
  const [tempStaftIdFilter, setTempStaftIdFilter] = useState<number | ''>('');
  const [tempShiftFilter, setTempShiftFilter] = useState<number | ''>('');
  const [tempStartDateFilter, setTempStartDateFilter] = useState('');
  const [tempEndDateFilter, setTempEndDateFilter] = useState('');
  
  const { user } = useAuth();
  const { setSubtitle } = useHeader();
  
  // Verificar si el usuario puede reversar transacciones (solo ADMIN o AUDIT)
  const canReverseTransaction = user?.role === 'ADMIN' || user?.role === 'AUDIT';
  
  const {
    transactions,
    stats,
    loading,
    error,
    selectedTransaction,
    searchTerm,
    transNumberFilter,
    cfNumberFilter,
    statusFilter,
    cfTypeFilter,
    siteIdFilter,
    terminalFilter,
    staftIdFilter,
    shiftFilter,
    startDateFilter,
    endDateFilter,
    currentPage,
    totalPages,
    itemsPerPage,
    sortField,
    sortDirection,
    setSearchTerm,
    setTransNumberFilter,
    setCfNumberFilter,
    setStatusFilter,
    setCfTypeFilter,
    setSiteIdFilter,
    setTerminalFilter,
    setStaftIdFilter,
    setShiftFilter,
    setStartDateFilter,
    setEndDateFilter,
    setSelectedTransaction,
    setCurrentPage,
    handleSort,
    exportTransactions,
    refreshTransactions,
    searchTransactionsDirectly,
    loadTransactionsWithDates
  } = useTransactions(isNCFView, isTiendaView);

  // Función para renderizar el icono de ordenamiento
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col ml-1">
          <ChevronUp className="w-3 h-3 text-gray-300" />
          <ChevronDown className="w-3 h-3 text-gray-300 -mt-1" />
        </div>
      );
    }
    
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-blue-600 ml-1" />;
    } else {
      return <ChevronDown className="w-4 h-4 text-blue-600 ml-1" />;
    }
  };

  // Función para renderizar el encabezado ordenable
  const renderSortableHeader = (field: SortField, label: string, className: string = "") => (
    <th 
      className={`text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-all duration-200 select-none ${className}`}
      onClick={() => handleSort(field)}
      title={`Haz clic para ordenar por ${label.toLowerCase()}`}
    >
      <div className="flex items-center group">
        <span className="group-hover:text-gray-700 transition-colors">{label}</span>
        <div className="ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {renderSortIcon(field)}
        </div>
      </div>
    </th>
  );

  // Filtrar transacciones
  const filteredTransactions = filterTransactionsByStatus(
    filterTransactionsBySearch(transactions, searchTerm),
    statusFilter
  );

  // Calcular transacciones para la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (format === 'excel') {
      setIsExporting(true);
      try {
        await exportTransactions(format);
        toast.success('Exportación a Excel completada exitosamente', {
          duration: 4000,
          icon: '✅',
        });
      } catch (error) {
        console.error('Error al exportar:', error);
        toast.error('Error al exportar a Excel', {
          duration: 4000,
          icon: '❌',
        });
      } finally {
        setIsExporting(false);
      }
    } else {
      try {
        await exportTransactions(format);
      } catch (error) {
        console.error('Error al exportar:', error);
      }
    }
  };

  // Función para inicializar los filtros temporales con los valores actuales
  const initializeTempFilters = () => {
    setTempSearchTerm(searchTerm);
    setTempTransNumberFilter(transNumberFilter);
    setTempCfNumberFilter(cfNumberFilter);
    setTempStatusFilter(statusFilter);
    setTempCfTypeFilter(cfTypeFilter);
    setTempSiteIdFilter(siteIdFilter);
    setTempTerminalFilter(terminalFilter);
    setTempStaftIdFilter(staftIdFilter);
    setTempShiftFilter(shiftFilter);
    setTempStartDateFilter(startDateFilter);
    setTempEndDateFilter(endDateFilter);
  };

  // Función para abrir el modal y inicializar filtros temporales
  const handleOpenFilters = () => {
    initializeTempFilters();
    setShowFilters(true);
  };

  const handleApplyFilters = async () => {
    // Resetear a la primera página
    setCurrentPage(1);
    
    // Siempre buscar en la API cuando se aplican filtros desde el modal
    const params: any = {};
    
    // Verificar si hay filtros específicos (no fechas) completados
    const hasSpecificFilters = 
      tempTransNumberFilter !== '' || 
      tempCfNumberFilter !== '' || 
      tempSiteIdFilter !== '' || 
      tempTerminalFilter !== '' || 
      tempCfTypeFilter !== '' || 
      tempStaftIdFilter !== '' || 
      tempShiftFilter !== '' || 
      tempSearchTerm.trim() !== '';
    
    // Filtros de fecha
    if (tempStartDateFilter !== '' && tempEndDateFilter !== '') {
      // Si el usuario especificó fechas, usarlas
      params.startDate = tempStartDateFilter;
      params.endDate = tempEndDateFilter;
    } else if (hasSpecificFilters) {
      // Si hay filtros específicos pero no fechas, usar el día actual
      const todayDate = getCurrentSantoDomingoDate();
      params.startDate = todayDate;
      params.endDate = todayDate;
    } else {
      // Si no hay filtros específicos ni fechas, usar las fechas actuales del estado
      params.startDate = tempStartDateFilter;
      params.endDate = tempEndDateFilter;
    }
    
    // Filtros específicos - asegurando que coincidan con los query params de la API
    if (tempTransNumberFilter !== '') params.transNumber = tempTransNumberFilter;
    if (tempCfNumberFilter !== '') params.cfNumber = tempCfNumberFilter;
    if (tempSiteIdFilter !== '') params.siteId = tempSiteIdFilter;
    if (tempTerminalFilter !== '') params.terminal = tempTerminalFilter;
    if (tempCfTypeFilter !== '') params.cfType = tempCfTypeFilter;
    if (tempStaftIdFilter !== '') params.staftId = tempStaftIdFilter;
    if (tempShiftFilter !== '') params.shift = tempShiftFilter;
    
    // Taxpayer ID (RNC/Cédula)
    if (tempSearchTerm.trim() !== '') {
      params.taxpayerId = tempSearchTerm.trim();
    }
    
    // Buscar directamente en la API con los filtros aplicados
    await searchTransactionsDirectlyWrapper(params);
    
    // Actualizar subtítulo del Header con resumen de filtros
    const readable = (d: string) => {
      if (!d) return '';
      // Evitar desfases de zona horaria: formatear YYYY-MM-DD manualmente a M/D/YYYY
      const [year, month, day] = d.split('-');
      return `${Number(month)}/${Number(day)}/${year}`;
    };
    const parts: string[] = [];
    if (params.startDate && params.endDate) {
      const startText = readable(params.startDate);
      const endText = readable(params.endDate);
      parts.push(
        startText === endText
          ? `Estás viendo transacciones del ${startText}`
          : `Estás viendo transacciones del ${startText} al ${endText}`
      );
    }
    const extra: string[] = [];
    if (params.transNumber) extra.push(`Transacción: ${params.transNumber}`);
    if (params.cfNumber) extra.push(`e-NCF: ${params.cfNumber}`);
    if (params.siteId) extra.push(`Sucursal: ${params.siteId}`);
    if (params.terminal !== undefined) extra.push(`Terminal: ${params.terminal}`);
    if (params.cfType) extra.push(`Tipo NCF: ${params.cfType}`);
    if (params.staftId !== undefined) extra.push(`Vendedor: ${params.staftId}`);
    if (params.taxpayerId) extra.push(`RNC/Cédula: ${params.taxpayerId}`);
    if (params.shift !== undefined) extra.push(`Turno: ${params.shift}`);
    if (extra.length) parts.push(`Filtros: ${extra.join(' · ')}`);
    setSubtitle(parts.join(' — '));

    // Ocultar la sección de filtros después de aplicarlos
    setShowFilters(false);
  };

  // Mostrar rango por defecto (fecha actual) al cargar la página de transacciones
  useEffect(() => {
    const readable = (d: string) => {
      if (!d) return '';
      const [year, month, day] = d.split('-');
      return `${Number(month)}/${Number(day)}/${year}`;
    };
    if (startDateFilter && endDateFilter) {
      const startText = readable(startDateFilter);
      const endText = readable(endDateFilter);
      const base = startText === endText
        ? `Estás viendo transacciones del ${startText}`
        : `Estás viendo transacciones del ${startText} al ${endText}`;
      setSubtitle(base);
    }
    // Limpiar el subtítulo al salir de esta pantalla
    return () => {
      setSubtitle('');
    };
  }, [startDateFilter, endDateFilter, setSubtitle]);

  // Función para buscar directamente en la API sin lógica de filtrado local
  const searchTransactionsDirectlyWrapper = async (params: {
    transNumber?: string;
    cfNumber?: string;
    siteId?: string;
    terminal?: number;
    cfType?: string;
    staftId?: number;
    taxpayerId?: string;
    shift?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      console.log('🔍 Buscando directamente en la API con parámetros:', params);
      
      // Usar la nueva función del hook que siempre busca en la API
      await searchTransactionsDirectly(params);
      
      console.log('✅ Búsqueda directa completada');
    } catch (err) {
      console.warn('Error en búsqueda directa de transacciones:', err);
    }
  };

  const handleClearFilters = async () => {
    // Obtener fecha de hoy en zona horaria de Santo Domingo
    const getTodayDate = () => {
      return getCurrentSantoDomingoDate();
    };
    
    const todayDate = getTodayDate();
    
    // Limpiar todos los filtros globales
    setSearchTerm('');
    setTransNumberFilter('');
    setCfNumberFilter('');
    setStatusFilter('');
    setCfTypeFilter('');
    setSiteIdFilter('');
    setTerminalFilter('');
    setStaftIdFilter('');
    setShiftFilter('');
    setStartDateFilter(todayDate);
    setEndDateFilter(todayDate);
    
    // Limpiar también los filtros temporales
    setTempSearchTerm('');
    setTempTransNumberFilter('');
    setTempCfNumberFilter('');
    setTempStatusFilter('');
    setTempCfTypeFilter('');
    setTempSiteIdFilter('');
    setTempTerminalFilter('');
    setTempStaftIdFilter('');
    setTempShiftFilter('');
    setTempStartDateFilter(todayDate);
    setTempEndDateFilter(todayDate);
    
    // Resetear a la primera página
    setCurrentPage(1);
    
    // Ocultar la sección de filtros
    setShowFilters(false);
    
    // Recargar con filtros limpios (solo fechas de hoy)
    await loadTransactionsWithDates(todayDate, todayDate);
  };

  const handleReverseTransaction = (transNumber: string) => {
    setTransactionToReverse(transNumber);
    setShowReverseDialog(true);
  };

  const confirmReverseTransaction = async () => {
    if (!transactionToReverse) return;
    
    try {
      setIsReversing(true);
      const result = await transactionService.reverseTransaction(transactionToReverse);
      
      // Verificar si la API respondió con successful: true
      if (result.successful) {
        // Mostrar notificación de éxito
        toast.success(`Transacción reversada exitosamente \n #${result.data.transNumber} \n e-NCF: ${result.data.encf}`, {
          duration: 10000,
          icon: '✅',
        });
        
        // Cerrar el modal y refrescar las transacciones
        setSelectedTransaction(null);
        await refreshTransactions();
      } else {
        // Si la API no respondió con successful: true
        toast.error(`Error: ${result.message || 'No se pudo reversar la transacción'}`, {
          duration: 5000,
          icon: '❌',
        });
      }
    } catch (error) {
      console.error('Error al reversar transacción:', error);
      toast.error('Error al reversar la transacción. Por favor, inténtalo de nuevo.', {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setIsReversing(false);
      setShowReverseDialog(false);
      setTransactionToReverse(null);
    }
  };

  const cancelReverseTransaction = () => {
    setShowReverseDialog(false);
    setTransactionToReverse(null);
  };


  const getStatusIcon = (cfStatus: number) => {
    switch (cfStatus) {
      case CFStatus.ACCEPTED:
      case CFStatus.ACCEPTED_ALT:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case CFStatus.PENDING:
      case 0:
      case 1:
      case 5:
      case 6:
      case 7:
      case 8:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case CFStatus.REJECTED:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Botones de Acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="flex items-center justify-center space-x-2 bg-white p-4 rounded-lg border border-gray-200"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={showFilters ? () => setShowFilters(false) : handleOpenFilters}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
            title={showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          >
            <Filter className="w-4 h-4" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshTransactions}
            disabled={loading}
            className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="flex items-center justify-center w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
            title="Exportar a Excel con 3 hojas: Transacciones, Productos y Pagos"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
          </motion.button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Retornos</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(transactions.filter(t => t.isReturn).reduce((sum, t) => sum + t.total, 0))}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>

        {/* Aceptadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aceptadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.acceptedTransactions}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>
        
        {/* Rechazadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rechazadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejectedTransactions}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </motion.div>
        
        {/* Pendientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>
      </div>


      {/* Modal de Filtros */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Filter className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filtros de Búsqueda
                  </h3>
                  <p className="text-sm text-gray-600">Configura los filtros para buscar transacciones</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Fechas */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Rango de Fechas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                      <input
                        type="date"
                        value={tempStartDateFilter}
                        onChange={(e) => setTempStartDateFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                      <input
                        type="date"
                        value={tempEndDateFilter}
                        onChange={(e) => setTempEndDateFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtros de Transacción */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Transacción</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Transacción</label>
                      <input
                        type="text"
                        placeholder="Ej: CO0017P"
                        value={tempTransNumberFilter}
                        onChange={(e) => setTempTransNumberFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de e-NCF</label>
                      <input
                        type="text"
                        placeholder="Ej: E310000000001"
                        value={tempCfNumberFilter}
                        onChange={(e) => setTempCfNumberFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select 
                        value={tempStatusFilter}
                        onChange={(e) => setTempStatusFilter(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos los estados</option>
                        <option value={CFStatus.ACCEPTED}>Aceptadas</option>
                        <option value={CFStatus.PENDING}>Pendientes</option>
                        <option value={CFStatus.REJECTED}>Rechazadas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de comprobante</label>
                      <select 
                        value={tempCfTypeFilter}
                        onChange={(e) => setTempCfTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos los tipos</option>
                        <option value="31">32 - Factura de Crédito Fiscal</option>
                        <option value="32">31 - Factura Consumidor Final</option>
                        <option value="34">34 - Factura Nota de Credito</option>
                        <option value="44">44 - Factura Regimen Especial</option>
                        <option value="45">45 - Factura Gubernamental</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filtros de Ubicación y Personal */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Ubicación y Personal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                      <input
                        type="text"
                        placeholder="CO-0017"
                        value={tempSiteIdFilter}
                        onChange={(e) => setTempSiteIdFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Terminal</label>
                      <input
                        type="number"
                        placeholder="Ej: 1, 2, 3"
                        value={tempTerminalFilter}
                        onChange={(e) => setTempTerminalFilter(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código vendedor</label>
                      <input
                        type="number"
                        placeholder="0000"
                        value={tempStaftIdFilter}
                        onChange={(e) => setTempStaftIdFilter(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                      <input
                        type="number"
                        placeholder="1, 2 o 3"
                        value={tempShiftFilter}
                        onChange={(e) => setTempShiftFilter(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtros de Cliente */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Cliente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">RNC/Cédula</label>
                      <input
                        type="text"
                        placeholder="RNC o Cédula"
                        value={tempSearchTerm}
                        onChange={(e) => setTempSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button 
                  onClick={handleClearFilters}
                  disabled={loading}
                  className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-100 cursor-not-allowed text-gray-400' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Limpiando...' : 'Limpiar'}</span>
                </button>
                <button 
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                    loading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Filter className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Aplicando...' : 'Aplicar Filtros'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >

        
        {paginatedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {renderSortableHeader('transNumber', 'Transacción')}
                  {renderSortableHeader('transDate', 'Fecha')}
                  {renderSortableHeader('siteId', 'Sucursal')}
                  {renderSortableHeader('staftId', 'Vendedor')}
                  {renderSortableHeader('taxpayerName', 'Cliente')}
                  {renderSortableHeader('total', 'Total')}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTransactions.map((transaction, index) => (
                  <motion.tr 
                    key={transaction.transNumber}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${transaction.isReturn ? 'text-red-600' : ''} ${transaction.status === 0 ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <td className="px-6 py-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(transaction.cfStatus)}</span>
                        <div>
                          <div className={`text-sm font-medium ${transaction.isReturn ? 'text-red-600' : 'text-gray-900'}`}>{transaction.transNumber}</div>
                          <div className={`text-sm ${transaction.isReturn ? 'text-red-500' : 'text-gray-500'}`}>{transaction.cfNumber}</div>

                          {transaction.status === 0 && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                              Anulada
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <div>
                        <div className={`text-sm ${transaction.isReturn ? 'text-red-600' : 'text-gray-900'}`}>{formatDateOnly(transaction.transDate)}</div>
                        <div className={`text-sm ${transaction.isReturn ? 'text-red-500' : 'text-gray-500'}`}>{formatTimeOnly(transaction.transDate)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div>
                        <div className={`text-sm font-medium ${transaction.isReturn ? 'text-red-600' : 'text-gray-900'}`}>{transaction.siteId} {transaction.siteName}</div>
                        <div className={`flex items-center space-x-1 text-sm ${transaction.isReturn ? 'text-red-500' : 'text-gray-500'}`}>
                          <Smartphone className={`w-3 h-3 ${transaction.isReturn ? 'text-red-500' : 'text-gray-500'}`} />
                          <span>Terminal {transaction.terminalId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTransaction(transaction);
                        }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 transition-colors"
                      >

                      </button>
                      <div className={`text-sm font-medium ${transaction.isReturn ? 'text-red-600' : 'text-gray-900'}`}>{transaction.staftName}</div>
                      <div className='flex items-center space-x-4 text-sm'>
                        <div className={`flex items-center space-x-1 ${transaction.isReturn ? 'text-red-500' : 'text-gray-500'}`}>
                          <User className={`w-3 h-3 ${transaction.isReturn ? 'text-red-500' : 'text-gray-500'}`} />
                          <span>{transaction.staftId}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${transaction.isReturn ? 'text-red-500' : 'text-gray-500'}`}>
                          <Clock9Icon className={`w-3 h-3 ${transaction.isReturn ? 'text-red-500' : 'text-gray-500'}`} />
                          <span>{transaction.shift}</span>
                        </div>
                      </div>

                    </td>


                    <td className="px-6 py-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.taxpayerName && transaction.taxpayerName !== 'Consumidor Final' 
                            ? 'bg-green-100' 
                            : 'bg-blue-100'
                        }`}>
                          {transaction.taxpayerName && transaction.taxpayerName !== 'Consumidor Final' ? (
                            <Building2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <User className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${transaction.isReturn ? 'text-red-600' : 'text-gray-900'}`}>
                            {transaction.taxpayerName || 'Consumidor Final'}
                          </div>
                          <div className={`text-sm ${transaction.isReturn ? 'text-red-500' : 'text-gray-500'}`}>{transaction.taxpayerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <div>
                        <div className={`text-sm font-medium ${transaction.isReturn ? 'text-red-600' : 'text-gray-900'}`}>
                          {transaction.isReturn ? `-${formatCurrency(transaction.total)}` : formatCurrency(transaction.total)}
                        </div>
                        <div className={`text-xs ${transaction.isReturn ? 'text-red-500' : 'text-gray-500'}`}>
                          {isNCFView ? (
                            // Para vista NCF, mostrar el nombre del primer producto
                            transaction.prods.length > 0 ? transaction.prods[0].productName : 'Sin producto'
                          ) : (
                            // Para vista normal, mostrar cantidad de productos
                            `${transaction.prods.length} productos`
                          )}
                        </div>
                      </div>
                    </td>
                    
                  </motion.tr>
                ))}
              </tbody>                                                                                        
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileX className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron transacciones</h3>
            <p className="text-gray-500 text-center max-w-md">
              No hay transacciones que coincidan con los filtros aplicados. 
              Intenta ajustar los criterios de búsqueda o cambiar las fechas.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </motion.div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          canReverseTransaction={canReverseTransaction}
          isReversing={isReversing}
          onReverseTransaction={handleReverseTransaction}
        />
      )}

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-xl"
      >
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(endIndex, filteredTransactions.length)}</span> de{' '}
          <span className="font-medium">{filteredTransactions.length}</span> transacciones
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
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
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Diálogo de Confirmación para Reversar Transacción */}
      <Dialog
        open={showReverseDialog}
        onClose={cancelReverseTransaction}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Contenedor del diálogo */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white shadow-xl">
            <div className="p-6">
              {/* Icono de advertencia */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>

              {/* Título */}
              <Dialog.Title className="text-lg font-medium text-gray-900 text-center mb-2">
                Reversar Transacción {selectedTransaction?.transNumber}
              </Dialog.Title>

              {/* Mensaje */}
              <Dialog.Description className="text-sm text-gray-500 text-center mb-6">
                ¿Estás seguro de que quieres aplicar nota de credito a esta transacción? 
                <br />
                <br />
                <span className="font-medium text-red-600">Esta acción no se puede deshacer.</span>
              </Dialog.Description>

              {/* Botones */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelReverseTransaction}
                  disabled={isReversing}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReverseTransaction}
                  disabled={isReversing}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isReversing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reversando...</span>
                    </>
                  ) : (
                    <span>Reversar</span>
                  )}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default TransactionsSection;