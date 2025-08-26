import { useState, useEffect, useCallback } from 'react';
import { ITransactionResume, TransactionStatus, CFStatus } from '../types/transaction';
import { getCurrentSantoDomingoDate } from '../utils/transactionUtils';
import { transactionService } from '../services/transactionService';
import { mockTransactions } from '../data/mockTransactions';

interface TransactionStats {
  totalSales: number;
  acceptedTransactions: number;
  pendingTransactions: number;
  rejectedTransactions: number;
  totalTransactions: number;
}

export type SortField = 'transNumber' | 'cfNumber' | 'transDate' | 'siteId' | 'taxpayerName' | 'total' | 'cfStatus';
export type SortDirection = 'asc' | 'desc';

interface UseTransactionsReturn {
  transactions: ITransactionResume[];
  stats: TransactionStats;
  loading: boolean;
  error: string | null;
  selectedTransaction: ITransactionResume | null;
  searchTerm: string;
  statusFilter: number | '';
  cfTypeFilter: string;
  siteIdFilter: string;
  staftIdFilter: number | '';
  shiftFilter: number | '';
  startDateFilter: string;
  endDateFilter: string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  sortField: SortField;
  sortDirection: SortDirection;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: number | '') => void;
  setCfTypeFilter: (cfType: string) => void;
  setSiteIdFilter: (siteId: string) => void;
  setStaftIdFilter: (staftId: number | '') => void;
  setShiftFilter: (shift: number | '') => void;
  setStartDateFilter: (date: string) => void;
  setEndDateFilter: (date: string) => void;
  setSelectedTransaction: (transaction: ITransactionResume | null) => void;
  setCurrentPage: (page: number) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  handleSort: (field: SortField) => void;
  loadTransactions: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  searchTransactions: (params: {
    startDate?: string;
    endDate?: string;
    status?: number;
    taxpayerId?: string;
    cfNumber?: string;
    cfType?: string;
    siteId?: string;
    terminal?: number;
    staftId?: number;
    shift?: number;
  }) => Promise<void>;
  exportTransactions: (format: 'pdf' | 'excel' | 'csv') => Promise<void>;
}

export const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<ITransactionResume[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalSales: 0,
    acceptedTransactions: 0,
    pendingTransactions: 0,
    rejectedTransactions: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransactionResume | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [cfTypeFilter, setCfTypeFilter] = useState<string>('');
  const [siteIdFilter, setSiteIdFilter] = useState<string>('');
  const [staftIdFilter, setStaftIdFilter] = useState<number | ''>('');
  const [shiftFilter, setShiftFilter] = useState<number | ''>('');
  // Obtener fecha de hoy en formato YYYY-MM-DD en zona horaria de Santo Domingo
  const getTodayDate = () => {
    return getCurrentSantoDomingoDate();
  };

  const [startDateFilter, setStartDateFilter] = useState<string>(getTodayDate());
  const [endDateFilter, setEndDateFilter] = useState<string>(getTodayDate());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('transDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Función para calcular estadísticas
  const calculateStats = useCallback((transactions: ITransactionResume[]) => {
    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
    const acceptedTransactions = transactions.filter(t => t.cfStatus === CFStatus.ACCEPTED || t.cfStatus === CFStatus.ACCEPTED_ALT).length;
    const pendingTransactions = transactions.filter(t => t.cfStatus === CFStatus.PENDING).length;
    const rejectedTransactions = transactions.filter(t => t.cfStatus === CFStatus.REJECTED).length;

    return {
      totalSales,
      acceptedTransactions,
      pendingTransactions,
      rejectedTransactions,
      totalTransactions: transactions.length
    };
  }, []);

  // Función para ordenar transacciones
  const sortTransactions = useCallback((transactions: ITransactionResume[], field: SortField, direction: SortDirection) => {
    return [...transactions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case 'transNumber':
          aValue = parseInt(a.transNumber || '0') || 0;
          bValue = parseInt(b.transNumber || '0') || 0;
          break;
        case 'cfNumber':
          aValue = parseInt(a.cfNumber || '0') || 0;
          bValue = parseInt(b.cfNumber || '0') || 0;
          break;
        case 'transDate':
          aValue = a.transDate ? new Date(a.transDate).getTime() : 0;
          bValue = b.transDate ? new Date(b.transDate).getTime() : 0;
          break;
        case 'siteId':
          aValue = (a.siteId || '').toLowerCase();
          bValue = (b.siteId || '').toLowerCase();
          break;
        case 'taxpayerName':
          aValue = (a.taxpayerName || '').toLowerCase();
          bValue = (b.taxpayerName || '').toLowerCase();
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'cfStatus':
          aValue = a.cfStatus;
          bValue = b.cfStatus;
          break;
        default:
          aValue = a.transDate;
          bValue = b.transDate;
      }

      if (typeof aValue === 'string') {
        if (direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        if (direction === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
    });
  }, []);

  // Función para manejar el ordenamiento
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      // Si es el mismo campo, cambiar la dirección
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es un campo nuevo, establecerlo y dirección ascendente por defecto
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Resetear a la primera página
  }, [sortField]);

  // Función para cargar transacciones
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Enviar fecha de hoy por defecto en la primera carga
      const params = {
        startDate: startDateFilter,
        endDate: endDateFilter
      };
      
      const data = await transactionService.getTransactions(params);
      const sortedData = sortTransactions(data, sortField, sortDirection);
      setTransactions(sortedData);
      setStats(calculateStats(sortedData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones');
      // En caso de error, usamos datos mock como fallback
      console.warn('Usando datos mock como fallback:', err);
      const sortedData = sortTransactions(mockTransactions, sortField, sortDirection);
      setTransactions(sortedData);
      setStats(calculateStats(sortedData));
    } finally {
      setLoading(false);
    }
  }, [calculateStats, startDateFilter, endDateFilter, sortField, sortDirection, sortTransactions]);

  // Calcular total de páginas
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // Funciones wrapper para resetear página
  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSetStatusFilter = (status: number | '') => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSetCfTypeFilter = (cfType: string) => {
    setCfTypeFilter(cfType);
    setCurrentPage(1);
  };

  const handleSetSiteIdFilter = (siteId: string) => {
    setSiteIdFilter(siteId);
    setCurrentPage(1);
  };

  const handleSetStaftIdFilter = (staftId: number | '') => {
    setStaftIdFilter(staftId);
    setCurrentPage(1);
  };

  const handleSetShiftFilter = (shift: number | '') => {
    setShiftFilter(shift);
    setCurrentPage(1);
  };

  const handleSetStartDateFilter = (date: string) => {
    setStartDateFilter(date);
    setCurrentPage(1);
  };

  const handleSetEndDateFilter = (date: string) => {
    setEndDateFilter(date);
    setCurrentPage(1);
  };

  // Función para refrescar transacciones
  const refreshTransactions = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  // Función para buscar transacciones con filtros avanzados
  const searchTransactions = useCallback(async (params: {
    startDate?: string;
    endDate?: string;
    status?: number;
    taxpayerId?: string;
    cfNumber?: string;
    cfType?: string;
    siteId?: string;
    terminal?: number;
    staftId?: number;
    shift?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar el endpoint /trans con filtros
      const data = await transactionService.getTransactions(params);
      const sortedData = sortTransactions(data, sortField, sortDirection);
      setTransactions(sortedData);
      setStats(calculateStats(sortedData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar transacciones');
      console.warn('Error en búsqueda de transacciones:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, sortField, sortDirection, sortTransactions]);

  // Función para exportar transacciones (por ahora solo simula la exportación)
  const exportTransactions = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      // Por ahora solo mostramos un mensaje de que la funcionalidad no está disponible
      console.log(`Exportación a ${format} no implementada aún`);
      alert(`La exportación a ${format.toUpperCase()} no está disponible por el momento.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar transacciones');
    }
  }, []);

  // Cargar transacciones al montar el componente
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Reordenar transacciones cuando cambie el ordenamiento
  useEffect(() => {
    if (transactions.length > 0) {
      const sortedData = sortTransactions(transactions, sortField, sortDirection);
      setTransactions(sortedData);
    }
  }, [sortField, sortDirection, sortTransactions]);

  return {
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
    setSearchTerm: handleSetSearchTerm,
    setStatusFilter: handleSetStatusFilter,
    setCfTypeFilter: handleSetCfTypeFilter,
    setSiteIdFilter: handleSetSiteIdFilter,
    setStaftIdFilter: handleSetStaftIdFilter,
    setShiftFilter: handleSetShiftFilter,
    setStartDateFilter: handleSetStartDateFilter,
    setEndDateFilter: handleSetEndDateFilter,
    setSelectedTransaction,
    setCurrentPage,
    setSortField,
    setSortDirection,
    handleSort,
    loadTransactions,
    refreshTransactions,
    searchTransactions,
    exportTransactions
  };
};
