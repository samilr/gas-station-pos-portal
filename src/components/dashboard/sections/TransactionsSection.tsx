import React, { useState } from 'react';
import { 
  CreditCard, 
  Filter, 
  Eye, 
  Calendar, 
  DollarSign, 
  Package, 
  User, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  FileText,
  QrCode,
  Receipt,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Building2,
  FileX,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { 
  getStatusText, 
  getStatusColor, 
  getPaymentTypeText, 
  getPaymentTypeColor,
  getCfTypeText,
  formatDate,
  formatDateOnly,
  formatTimeOnly,
  formatCurrency,
  filterTransactionsBySearch,
  filterTransactionsByStatus,
  getTotalProducts,
  isReturnTransaction,
  getTransactionIcon
} from '../../../utils/transactionUtils';
import { TransactionStatus, PaymentType, CFStatus } from '../../../types/transaction';
import { SortField, SortDirection } from '../../../hooks/useTransactions';

const TransactionsSection: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    transactions,
    stats,
    loading,
    error,
    selectedTransaction,
    searchTerm,
    statusFilter,
    cfTypeFilter,
    siteIdFilter,
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
    setStatusFilter,
    setCfTypeFilter,
    setSiteIdFilter,
    setStaftIdFilter,
    setShiftFilter,
    setStartDateFilter,
    setEndDateFilter,
    setSelectedTransaction,
    setCurrentPage,
    handleSort,
    exportTransactions,
    refreshTransactions,
    searchTransactions
  } = useTransactions();

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
    try {
      await exportTransactions(format);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const handleApplyFilters = async () => {
    const params: any = {};
    
    // Filtros de fecha (siempre se incluyen)
    if (startDateFilter !== '') params.startDate = startDateFilter;
    if (endDateFilter !== '') params.endDate = endDateFilter;
    
    // Filtros específicos
    if (statusFilter !== '') params.status = statusFilter;
    if (cfTypeFilter !== '') params.cfType = cfTypeFilter;
    if (siteIdFilter !== '') params.siteId = siteIdFilter;
    if (staftIdFilter !== '') params.staftId = staftIdFilter;
    if (shiftFilter !== '') params.shift = shiftFilter;
    
    // Taxpayer ID (RNC/Cédula)
    if (searchTerm.trim() !== '') {
      params.taxpayerId = searchTerm.trim();
    }
    
    // Resetear a la primera página
    setCurrentPage(1);
    
    // Aplicar filtros sin recargar toda la página
    await searchTransactions(params);
    
    // Opcional: Ocultar la sección de filtros después de aplicarlos
    setShowFilters(false);
  };

  const handleClearFilters = async () => {
    // Obtener fecha de hoy
    const getTodayDate = () => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    };
    
    // Limpiar todos los filtros
    setSearchTerm('');
    setStatusFilter('');
    setCfTypeFilter('');
    setSiteIdFilter('');
    setStaftIdFilter('');
    setShiftFilter('');
    setStartDateFilter(getTodayDate());
    setEndDateFilter(getTodayDate());
    
    // Resetear a la primera página
    setCurrentPage(1);
    
    // Ocultar la sección de filtros
    setShowFilters(false);
    
    // Recargar con filtros limpios (solo fechas de hoy)
    const params = {
      startDate: getTodayDate(),
      endDate: getTodayDate()
    };
    
    await searchTransactions(params);
  };

  const getStatusIcon = (cfStatus: number) => {
    switch (cfStatus) {
      case CFStatus.ACCEPTED:
      case CFStatus.ACCEPTED_ALT:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case CFStatus.PENDING:
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transacciones</h2>
            <p className="text-gray-600">Gestiona y visualiza todas las transacciones de ventas</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={refreshTransactions}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aceptadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.acceptedTransactions}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rechazadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejectedTransactions}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header con filtros de fecha y botón de filtros */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha inicio */}
                <div>
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Fecha fin */}
                <div>
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
              </button>
              <button 
                onClick={handleClearFilters}
                disabled={loading}
                className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                  loading 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{loading ? 'Limpiando...' : 'Limpiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value={CFStatus.ACCEPTED}>Aceptadas</option>
                  <option value={CFStatus.PENDING}>Pendientes</option>
                  <option value={CFStatus.REJECTED}>Rechazadas</option>
                </select>
              </div>

              {/* Tipo de CF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de CF</label>
                <select 
                  value={cfTypeFilter}
                  onChange={(e) => setCfTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  <option value="01">Factura Consumidor Final</option>
                  <option value="02">Factura de Crédito Fiscal</option>
                  <option value="03">Nota de Débito</option>
                  <option value="04">Nota de Crédito</option>
                </select>
              </div>

              {/* Site ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site ID</label>
                <input
                  type="text"
                  placeholder="Site ID"
                  value={siteIdFilter}
                  onChange={(e) => setSiteIdFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Staft ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staft ID</label>
                <input
                  type="number"
                  placeholder="Staft ID"
                  value={staftIdFilter}
                  onChange={(e) => setStaftIdFilter(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Shift */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                <input
                  type="number"
                  placeholder="Shift"
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Taxpayer ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RNC/Cédula</label>
                <input
                  type="text"
                  placeholder="RNC o Cédula"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Botón Aplicar Filtros */}
              <div className="flex items-end">
                <button 
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors font-medium ${
                    loading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white h-10`}
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
        )}
      </div>



      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

        
        {paginatedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {renderSortableHeader('transNumber', 'Transacción')}
                  {renderSortableHeader('siteId', 'Sucursal')}
                  {renderSortableHeader('taxpayerName', 'Cliente')}
                  {renderSortableHeader('transDate', 'Fecha')}
                  {renderSortableHeader('total', 'Total')}
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.transNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(transaction.cfStatus)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.transNumber}</div>
                          <div className="text-sm text-gray-500">{transaction.cfNumber}</div>
                          <div className="text-xs text-blue-600">{transaction.staftId} - {transaction.staftName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{transaction.siteId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.taxpayerName || 'Consumidor Final'}
                          </div>
                          <div className="text-sm text-gray-500">{transaction.taxpayerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{formatDateOnly(transaction.transDate)}</div>
                        <div className="text-sm text-gray-500">{formatTimeOnly(transaction.transDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.total)}</div>
                        <div className="text-xs text-gray-500">
                          {transaction.prods.length} productos
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">Ver detalles</span>
                      </button>
                    </td>
                  </tr>
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
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detalles de Transacción</h3>
                  <p className="text-sm text-gray-600">{selectedTransaction.transNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Información General</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Número de Transacción:</span>
                      <span className="text-sm font-medium">{selectedTransaction.transNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Número de CF:</span>
                      <span className="text-sm font-medium">{selectedTransaction.cfNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tipo de CF:</span>
                      <span className="text-sm font-medium">{getCfTypeText(selectedTransaction.cfType)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fecha:</span>
                      <span className="text-sm font-medium">{formatDate(selectedTransaction.transDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estado:</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedTransaction.cfStatus)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTransaction.cfStatus)}`}>
                          {getStatusText(selectedTransaction.cfStatus)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedTransaction.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ITBIS:</span>
                      <span className="text-sm font-medium">{formatCurrency(selectedTransaction.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(selectedTransaction.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Información del Contribuyente</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">RNC/Cédula:</span>
                      <span className="text-sm font-medium">{selectedTransaction.taxpayerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nombre:</span>
                      <span className="text-sm font-medium">{selectedTransaction.taxpayerName || 'Consumidor Final'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vendedor:</span>
                      <span className="text-sm font-medium">{selectedTransaction.staftName}</span>
                    </div>
                    {selectedTransaction.cfSecurityCode && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Código de Seguridad:</span>
                        <span className="text-sm font-medium">{selectedTransaction.cfSecurityCode}</span>
                      </div>
                    )}
                    {selectedTransaction.digitalSignatureDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Firma Digital:</span>
                        <span className="text-sm font-medium">{formatDate(selectedTransaction.digitalSignatureDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Productos ({selectedTransaction.prods.length})
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">ITBIS</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedTransaction.prods.map((product) => (
                        <tr key={product.productId}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                              <div className="text-sm text-gray-500">{product.productId}</div>
                              {product.isReturn && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  Devolución
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{product.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(product.price)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(product.tax)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(product.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pagos ({selectedTransaction.payms.length})
                </h4>
                <div className="space-y-3">
                  {selectedTransaction.payms.map((payment) => (
                    <div key={payment.paymentId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeColor(payment.type)}`}>
                                {getPaymentTypeText(payment.type)}
                              </span>
                              {payment.isReturn && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  Devolución
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              ID: {payment.paymentId}
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(payment.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zataca Information */}
              {selectedTransaction.zataca && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    Información Zataca
                  </h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Operador</div>
                        <div className="text-sm font-medium">{selectedTransaction.zataca.operator}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Monto</div>
                        <div className="text-sm font-medium">{formatCurrency(selectedTransaction.zataca.amount)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Número de Referencia Local</div>
                        <div className="text-sm font-medium">{selectedTransaction.zataca.localReferenceNumber}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Número de Teléfono</div>
                        <div className="text-sm font-medium">{selectedTransaction.zataca.phoneNumber}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">ID del Producto Z</div>
                        <div className="text-sm font-medium">{selectedTransaction.zataca.zProductId}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code */}
              {selectedTransaction.cfQr && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    Código QR
                  </h4>
                  <div className="flex justify-center">
                    <img 
                      src={selectedTransaction.cfQr} 
                      alt="Código QR" 
                      className="w-32 h-32 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
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
      </div>
    </div>
  );
};

export default TransactionsSection;