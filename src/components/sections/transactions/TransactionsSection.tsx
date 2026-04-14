import React, { useState, useEffect } from 'react';
import {
  Filter,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  RefreshCw,
  FileX,
  ChevronUp,
  ChevronDown,
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
import { CompactButton, Pagination } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

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

  const canReverseTransaction = user?.role === 'ADMIN' || user?.role === 'AUDIT';

  const {
    transactions,
    stats,
    serverStats,
    pagination,
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
    setItemsPerPage,
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

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col ml-0.5">
          <ChevronUp className="w-2.5 h-2.5 text-gray-300" />
          <ChevronDown className="w-2.5 h-2.5 text-gray-300 -mt-0.5" />
        </div>
      );
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-3 h-3 text-blue-600 ml-0.5" />;
    }
    return <ChevronDown className="w-3 h-3 text-blue-600 ml-0.5" />;
  };

  const renderSortableHeader = (field: SortField, label: string) => (
    <th
      className="text-left px-2 h-8 text-xs font-medium text-text-secondary uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        <span>{label}</span>
        {renderSortIcon(field)}
      </div>
    </th>
  );

  const filteredTransactions = filterTransactionsByStatus(
    filterTransactionsBySearch(transactions, searchTerm),
    statusFilter
  );

  const paginatedTransactions = filteredTransactions;
  const startIndex = pagination ? (pagination.page - 1) * pagination.limit : (currentPage - 1) * itemsPerPage;
  const endIndex = pagination ? Math.min(startIndex + pagination.limit, pagination.total) : Math.min(startIndex + itemsPerPage, filteredTransactions.length);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (format === 'excel') {
      setIsExporting(true);
      try {
        await exportTransactions(format);
        toast.success('Exportación a Excel completada', { duration: 4000, icon: '✅' });
      } catch (error) {
        console.error('Error al exportar:', error);
        toast.error('Error al exportar a Excel', { duration: 4000, icon: '❌' });
      } finally {
        setIsExporting(false);
      }
    } else {
      try { await exportTransactions(format); } catch (error) { console.error('Error al exportar:', error); }
    }
  };

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

  const handleOpenFilters = () => {
    initializeTempFilters();
    setShowFilters(true);
  };

  const handleApplyFilters = async () => {
    setCurrentPage(1);
    const params: any = { page: 1, limit: itemsPerPage };

    const hasSpecificFilters =
      tempTransNumberFilter !== '' || tempCfNumberFilter !== '' || tempSiteIdFilter !== '' ||
      tempTerminalFilter !== '' || tempCfTypeFilter !== '' || tempStaftIdFilter !== '' ||
      tempShiftFilter !== '' || tempSearchTerm.trim() !== '';

    if (tempStartDateFilter !== '' && tempEndDateFilter !== '') {
      params.startDate = tempStartDateFilter;
      params.endDate = tempEndDateFilter;
    } else if (hasSpecificFilters) {
      const todayDate = getCurrentSantoDomingoDate();
      params.startDate = todayDate;
      params.endDate = todayDate;
    } else {
      params.startDate = tempStartDateFilter;
      params.endDate = tempEndDateFilter;
    }

    if (tempTransNumberFilter !== '') params.transNumber = tempTransNumberFilter;
    if (tempCfNumberFilter !== '') params.cfNumber = tempCfNumberFilter;
    if (tempSiteIdFilter !== '') params.siteId = tempSiteIdFilter;
    if (tempTerminalFilter !== '') params.terminal = tempTerminalFilter;
    if (tempCfTypeFilter !== '') params.cfType = tempCfTypeFilter;
    if (tempStaftIdFilter !== '') params.staftId = tempStaftIdFilter;
    if (tempShiftFilter !== '') params.shift = tempShiftFilter;
    if (tempSearchTerm.trim() !== '') params.taxpayerId = tempSearchTerm.trim();

    setTransNumberFilter(tempTransNumberFilter);
    setCfNumberFilter(tempCfNumberFilter);
    setStatusFilter(tempStatusFilter);
    setCfTypeFilter(tempCfTypeFilter);
    setSiteIdFilter(tempSiteIdFilter);
    setTerminalFilter(tempTerminalFilter);
    setStaftIdFilter(tempStaftIdFilter);
    setShiftFilter(tempShiftFilter);
    setStartDateFilter(params.startDate || tempStartDateFilter);
    setEndDateFilter(params.endDate || tempEndDateFilter);
    if (tempSearchTerm.trim() !== '') setSearchTerm(tempSearchTerm.trim());

    await searchTransactionsDirectlyWrapper(params);

    const readable = (d: string) => {
      if (!d) return '';
      const [year, month, day] = d.split('-');
      return `${Number(month)}/${Number(day)}/${year}`;
    };
    const parts: string[] = [];
    if (params.startDate && params.endDate) {
      const startText = readable(params.startDate);
      const endText = readable(params.endDate);
      parts.push(startText === endText ? `Transacciones del ${startText}` : `Transacciones del ${startText} al ${endText}`);
    }
    const extra: string[] = [];
    if (params.transNumber) extra.push(`Trans: ${params.transNumber}`);
    if (params.cfNumber) extra.push(`e-NCF: ${params.cfNumber}`);
    if (params.siteId) extra.push(`Sucursal: ${params.siteId}`);
    if (params.terminal !== undefined) extra.push(`Terminal: ${params.terminal}`);
    if (params.cfType) extra.push(`Tipo: ${params.cfType}`);
    if (params.staftId !== undefined) extra.push(`Vendedor: ${params.staftId}`);
    if (params.taxpayerId) extra.push(`RNC: ${params.taxpayerId}`);
    if (params.shift !== undefined) extra.push(`Turno: ${params.shift}`);
    if (extra.length) parts.push(extra.join(' · '));
    setSubtitle(parts.join(' — '));
    setShowFilters(false);
  };

  useEffect(() => {
    const readable = (d: string) => {
      if (!d) return '';
      const [year, month, day] = d.split('-');
      return `${Number(month)}/${Number(day)}/${year}`;
    };
    if (startDateFilter && endDateFilter) {
      const startText = readable(startDateFilter);
      const endText = readable(endDateFilter);
      setSubtitle(startText === endText ? `Transacciones del ${startText}` : `Transacciones del ${startText} al ${endText}`);
    }
    return () => { setSubtitle(''); };
  }, [startDateFilter, endDateFilter, setSubtitle]);

  const searchTransactionsDirectlyWrapper = async (params: any) => {
    try {
      await searchTransactionsDirectly(params);
    } catch (err) {
      console.warn('Error en búsqueda directa:', err);
    }
  };

  const handleClearFilters = async () => {
    const todayDate = getCurrentSantoDomingoDate();
    setSearchTerm(''); setTransNumberFilter(''); setCfNumberFilter('');
    setStatusFilter(''); setCfTypeFilter(''); setSiteIdFilter('');
    setTerminalFilter(''); setStaftIdFilter(''); setShiftFilter('');
    setStartDateFilter(todayDate); setEndDateFilter(todayDate);
    setTempSearchTerm(''); setTempTransNumberFilter(''); setTempCfNumberFilter('');
    setTempStatusFilter(''); setTempCfTypeFilter(''); setTempSiteIdFilter('');
    setTempTerminalFilter(''); setTempStaftIdFilter(''); setTempShiftFilter('');
    setTempStartDateFilter(todayDate); setTempEndDateFilter(todayDate);
    setCurrentPage(1);
    setShowFilters(false);
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
      if (result.successful) {
        toast.success(`Reversada: #${result.data.transNumber} · e-NCF: ${result.data.encf}`, { duration: 10000, icon: '✅' });
        setSelectedTransaction(null);
        await refreshTransactions();
      } else {
        toast.error(`Error: ${result.message || 'No se pudo reversar'}`, { duration: 5000, icon: '❌' });
      }
    } catch (error) {
      console.error('Error al reversar:', error);
      toast.error('Error al reversar la transacción', { duration: 5000, icon: '❌' });
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

  const getStatusDot = (cfStatus: number) => {
    switch (cfStatus) {
      case CFStatus.ACCEPTED:
      case CFStatus.ACCEPTED_ALT:
        return 'green';
      case CFStatus.PENDING:
      case 0: case 1: case 5: case 6: case 7: case 8:
        return 'yellow';
      case CFStatus.REJECTED:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (cfStatus: number) => {
    switch (cfStatus) {
      case CFStatus.ACCEPTED:
      case CFStatus.ACCEPTED_ALT:
        return 'Aceptada';
      case CFStatus.PENDING:
      case 0: case 1: case 5: case 6: case 7: case 8:
        return 'Pendiente';
      case CFStatus.REJECTED:
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  };

  // Build search params helper for pagination
  const buildSearchParams = (page: number, limit?: number) => ({
    transNumber: transNumberFilter || undefined,
    cfNumber: cfNumberFilter || undefined,
    siteId: siteIdFilter || undefined,
    terminal: terminalFilter || undefined,
    cfType: cfTypeFilter || undefined,
    staftId: staftIdFilter || undefined,
    taxpayerId: searchTerm || undefined,
    shift: shiftFilter || undefined,
    startDate: startDateFilter,
    endDate: endDateFilter,
    page,
    limit: limit || itemsPerPage,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-sm p-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar with stats + actions */}
      <Toolbar
        chips={[
          { label: 'Ventas', value: formatCurrency(serverStats?.totalSales ?? stats.totalSales) },
          { label: 'Retornos', value: formatCurrency(serverStats?.totalReturn ?? 0), color: 'red' },
          { label: 'Aceptadas', value: serverStats?.dgiiAcceptedTransactions ?? stats.acceptedTransactions, color: 'green' },
          { label: 'Rechazadas', value: serverStats?.dgiiRejectedTransactions ?? stats.rejectedTransactions, color: 'red' },
          { label: 'Pendientes', value: serverStats?.dgiiPendingTransactions ?? stats.pendingTransactions, color: 'yellow' },
        ]}
      >
        <CompactButton variant="icon" onClick={showFilters ? () => setShowFilters(false) : handleOpenFilters} title="Filtros">
          <Filter className={`w-[13px] h-[13px] ${showFilters ? 'text-blue-600' : ''}`} />
        </CompactButton>
        <CompactButton variant="icon" onClick={refreshTransactions} disabled={loading} title="Actualizar">
          <RefreshCw className={`w-[13px] h-[13px] ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
        <CompactButton variant="icon" onClick={() => handleExport('excel')} disabled={isExporting} title="Exportar Excel">
          {isExporting ? (
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-[13px] h-[13px]" />
          )}
        </CompactButton>
      </Toolbar>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-base font-semibold text-text-primary">Filtros de Búsqueda</span>
              </div>
              <button onClick={() => setShowFilters(false)} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Dates */}
              <div>
                <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2">Rango de Fechas</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Fecha Inicio</label>
                    <input type="date" value={tempStartDateFilter} onChange={(e) => setTempStartDateFilter(e.target.value)}
                      className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Fecha Fin</label>
                    <input type="date" value={tempEndDateFilter} onChange={(e) => setTempEndDateFilter(e.target.value)}
                      className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              {/* Transaction filters */}
              <div>
                <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2">Transacción</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nro. Trans.</label>
                    <input type="text" placeholder="CO0017P" value={tempTransNumberFilter} onChange={(e) => setTempTransNumberFilter(e.target.value)}
                      className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">e-NCF</label>
                    <input type="text" placeholder="E310000" value={tempCfNumberFilter} onChange={(e) => setTempCfNumberFilter(e.target.value)}
                      className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Estado</label>
                    <select value={tempStatusFilter} onChange={(e) => setTempStatusFilter(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                      <option value="">Todos</option>
                      <option value={CFStatus.ACCEPTED}>Aceptadas</option>
                      <option value={CFStatus.PENDING}>Pendientes</option>
                      <option value={CFStatus.REJECTED}>Rechazadas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Tipo NCF</label>
                    <select value={tempCfTypeFilter} onChange={(e) => setTempCfTypeFilter(e.target.value)}
                      className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                      <option value="">Todos</option>
                      <option value="31">31 - Crédito Fiscal</option>
                      <option value="32">32 - Consumidor Final</option>
                      <option value="34">34 - Nota de Credito</option>
                      <option value="44">44 - Regimen Especial</option>
                      <option value="45">45 - Gubernamental</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Location & staff */}
              <div>
                <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2">Ubicación y Personal</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Sucursal</label>
                    <input type="text" placeholder="CO-0017" value={tempSiteIdFilter} onChange={(e) => setTempSiteIdFilter(e.target.value)}
                      className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Terminal</label>
                    <input type="number" placeholder="1, 2, 3" value={tempTerminalFilter} onChange={(e) => setTempTerminalFilter(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Vendedor</label>
                    <input type="number" placeholder="0000" value={tempStaftIdFilter} onChange={(e) => setTempStaftIdFilter(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Turno</label>
                    <input type="number" placeholder="1, 2 o 3" value={tempShiftFilter} onChange={(e) => setTempShiftFilter(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              {/* Customer */}
              <div>
                <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2">Cliente</h4>
                <div className="w-1/4">
                  <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">RNC/Cédula</label>
                  <input type="text" placeholder="RNC o Cédula" value={tempSearchTerm} onChange={(e) => setTempSearchTerm(e.target.value)}
                    className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
              <CompactButton variant="ghost" onClick={handleClearFilters} disabled={loading}>
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Limpiando...' : 'Limpiar'}
              </CompactButton>
              <CompactButton variant="primary" onClick={handleApplyFilters} disabled={loading}>
                <Filter className="w-3 h-3" />
                {loading ? 'Aplicando...' : 'Aplicar'}
              </CompactButton>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-sm border border-table-border overflow-hidden">
        {paginatedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-table-header border-b border-table-border">
                <tr>
                  <th className="w-8 px-2 h-8"></th>
                  {renderSortableHeader('transNumber', 'Transacción / e-NCF')}
                  {renderSortableHeader('transDate', 'Fecha')}
                  {renderSortableHeader('siteId', 'Sucursal')}
                  <th className="text-left px-2 h-8 text-xs font-medium text-text-secondary uppercase tracking-wide">Term.</th>
                  {renderSortableHeader('staftId', 'Vendedor')}
                  {renderSortableHeader('taxpayerName', 'Cliente')}
                  <th className="text-left px-2 h-8 text-xs font-medium text-text-secondary uppercase tracking-wide">Tipo</th>
                  {renderSortableHeader('total', 'Total')}
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => {
                  const isAnulada = transaction.status === 0;
                  const textColor = transaction.isReturn ? 'text-red-600' : isAnulada ? 'text-text-muted line-through' : 'text-text-primary';
                  const mutedColor = transaction.isReturn ? 'text-red-500' : 'text-text-muted';

                  return (
                    <tr
                      key={transaction.transNumber}
                      className={`h-8 max-h-8 border-b border-table-border hover:bg-row-hover cursor-pointer transition-colors ${isAnulada ? 'bg-gray-50' : ''}`}
                      onClick={() => setSelectedTransaction(transaction)}
                      title={isAnulada ? 'Transacción anulada' : ''}
                    >
                      {/* Status indicator */}
                      <td className="px-2 text-center">
                        <span className="inline-flex">
                          <StatusDot color={getStatusDot(transaction.cfStatus)} label="" />
                        </span>
                      </td>

                      {/* Transaction + e-NCF */}
                      <td className="px-2 text-sm whitespace-nowrap overflow-hidden max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-medium ${textColor}`}>{transaction.transNumber}</span>
                          <span className={mutedColor}>·</span>
                          <span className={`font-mono text-xs ${mutedColor} truncate`}>{transaction.cfNumber}</span>
                          {isAnulada && <StatusDot color="gray" label="Anulada" />}
                          {transaction.isReturn && <StatusDot color="red" label="Devolución" />}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-2 text-sm whitespace-nowrap">
                        <span className={textColor}>{formatDateOnly(transaction.transDate)}</span>
                        <span className={`${mutedColor} ml-1.5`}>{formatTimeOnly(transaction.transDate)}</span>
                      </td>

                      {/* Site */}
                      <td className="px-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                        <span className={`${textColor} font-mono text-xs`}>{transaction.siteId}</span>
                        {transaction.siteName && (
                          <span className={`${mutedColor} ml-1.5`}>{transaction.siteName}</span>
                        )}
                      </td>

                      {/* Terminal */}
                      <td className="px-2 text-sm whitespace-nowrap">
                        <span className={`${textColor} font-mono`}>T{transaction.terminalId}</span>
                        <span className={`${mutedColor} ml-1`}>·</span>
                        <span className={`${mutedColor} ml-1`} title="Turno">t{transaction.shift}</span>
                      </td>

                      {/* Vendor */}
                      <td className="px-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                        <span className={textColor}>{transaction.staftName}</span>
                        <span className={`${mutedColor} ml-1 text-xs font-mono`}>#{transaction.staftId}</span>
                      </td>

                      {/* Customer */}
                      <td className="px-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                        <span className={textColor}>{transaction.taxpayerName || 'Consumidor Final'}</span>
                        {transaction.taxpayerId && (
                          <span className={`${mutedColor} ml-1.5 text-xs font-mono`}>{transaction.taxpayerId}</span>
                        )}
                      </td>

                      {/* CF Type */}
                      <td className="px-2 text-xs whitespace-nowrap">
                        <span className={`${mutedColor} font-mono px-1.5 py-0.5 bg-gray-100 rounded-sm`}>{transaction.cfType}</span>
                      </td>

                      {/* Total */}
                      <td className="px-2 text-sm whitespace-nowrap text-right font-mono font-bold tabular-nums">
                        <span className={transaction.isReturn ? 'text-red-600' : 'text-text-primary'}>
                          {transaction.isReturn ? `-${formatCurrency(transaction.total)}` : formatCurrency(transaction.total)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <FileX className="w-8 h-8 text-text-muted mb-2" />
            <p className="text-sm text-text-secondary mb-1">No se encontraron transacciones</p>
            <CompactButton variant="primary" onClick={handleClearFilters}>Limpiar filtros</CompactButton>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={pagination?.total ?? filteredTransactions.length}
        pageSize={pagination?.limit ?? itemsPerPage}
        onPageChange={(page) => { if (startDateFilter && endDateFilter) searchTransactionsDirectly(buildSearchParams(page)); }}
        onPageSizeChange={async (newLimit) => {
          setItemsPerPage(newLimit);
          setCurrentPage(1);
          if (startDateFilter && endDateFilter) {
            await searchTransactionsDirectly(buildSearchParams(1, newLimit));
          }
        }}
        itemLabel="transacciones"
      />

      {/* Reverse Confirmation Dialog */}
      <Dialog open={showReverseDialog} onClose={cancelReverseTransaction} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-sm bg-white shadow-xl">
            <div className="p-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <Dialog.Title className="text-base font-semibold text-text-primary text-center mb-1">
                Reversar {selectedTransaction?.transNumber}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-secondary text-center mb-4">
                ¿Aplicar nota de crédito?
                <br />
                <span className="font-medium text-red-600">Esta acción no se puede deshacer.</span>
              </Dialog.Description>
              <div className="flex gap-2">
                <CompactButton variant="ghost" onClick={cancelReverseTransaction} disabled={isReversing} className="flex-1">
                  Cancelar
                </CompactButton>
                <CompactButton variant="danger" onClick={confirmReverseTransaction} disabled={isReversing} className="flex-1">
                  {isReversing ? <><RefreshCw className="w-3 h-3 animate-spin" /> Reversando...</> : 'Reversar'}
                </CompactButton>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default TransactionsSection;
