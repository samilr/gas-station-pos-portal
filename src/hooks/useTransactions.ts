import { useCallback, useMemo, useState } from 'react';
import {
  ITransactionResume,
  CFStatus,
  ITransactionStatistics,
  IPaginationMeta,
} from '../types/transaction';
import { getCurrentSantoDomingoDate } from '../utils/transactionUtils';
import ExcelService from '../services/excelService';
import { useSelectedSiteId } from './useSelectedSite';
import {
  useGetTransactionsQuery,
  GetTransactionsParams,
} from '../store/api/transactionsApi';
import { getErrorMessage } from '../store/api/baseApi';

interface TransactionStats {
  totalSales: number;
  acceptedTransactions: number;
  pendingTransactions: number;
  rejectedTransactions: number;
  totalTransactions: number;
}

export type SortField =
  | 'transNumber'
  | 'cfNumber'
  | 'transDate'
  | 'siteId'
  | 'taxpayerName'
  | 'total'
  | 'cfStatus'
  | 'staftId';
export type SortDirection = 'asc' | 'desc';

interface UseTransactionsReturn {
  transactions: ITransactionResume[];
  stats: TransactionStats;
  serverStats: ITransactionStatistics | null;
  pagination: IPaginationMeta | null;
  loading: boolean;
  error: string | null;
  selectedTransaction: ITransactionResume | null;
  searchTerm: string;
  transNumberFilter: string;
  cfNumberFilter: string;
  statusFilter: number | '';
  cfTypeFilter: string;
  siteIdFilter: string;
  terminalFilter: number | '';
  staftIdFilter: number | '';
  shiftFilter: number | '';
  startDateFilter: string;
  endDateFilter: string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setItemsPerPage: (limit: number) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  setSearchTerm: (term: string) => void;
  setTransNumberFilter: (v: string) => void;
  setCfNumberFilter: (v: string) => void;
  setStatusFilter: (v: number | '') => void;
  setCfTypeFilter: (v: string) => void;
  setSiteIdFilter: (v: string) => void;
  setTerminalFilter: (v: number | '') => void;
  setStaftIdFilter: (v: number | '') => void;
  setShiftFilter: (v: number | '') => void;
  setStartDateFilter: (v: string) => void;
  setEndDateFilter: (v: string) => void;
  setSelectedTransaction: (t: ITransactionResume | null) => void;
  setCurrentPage: (p: number) => void;
  setSortField: (f: SortField) => void;
  setSortDirection: (d: SortDirection) => void;
  handleSort: (f: SortField) => void;
  loadTransactions: () => Promise<void>;
  loadTransactionsWithDates: (startDate: string, endDate: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  searchTransactions: (params: SearchParams) => Promise<void>;
  searchTransactionsDirectly: (params: SearchParams & { page?: number; limit?: number }) => Promise<void>;
  exportTransactions: (format: 'pdf' | 'excel' | 'csv') => Promise<void>;
}

interface SearchParams {
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
}

const sortTransactions = (
  items: ITransactionResume[],
  field: SortField,
  direction: SortDirection
): ITransactionResume[] => {
  const copy = [...items];
  copy.sort((a, b) => {
    let av: any;
    let bv: any;
    switch (field) {
      case 'transNumber':
        av = parseInt(a.transNumber || '0') || 0;
        bv = parseInt(b.transNumber || '0') || 0;
        break;
      case 'cfNumber':
        av = parseInt(a.cfNumber || '0') || 0;
        bv = parseInt(b.cfNumber || '0') || 0;
        break;
      case 'transDate':
        av = a.transDate ? new Date(a.transDate).getTime() : 0;
        bv = b.transDate ? new Date(b.transDate).getTime() : 0;
        break;
      case 'siteId':
        av = (a.siteId || '').toLowerCase();
        bv = (b.siteId || '').toLowerCase();
        break;
      case 'taxpayerName':
        av = (a.taxpayerName || '').toLowerCase();
        bv = (b.taxpayerName || '').toLowerCase();
        break;
      case 'total':
        av = a.total;
        bv = b.total;
        break;
      case 'cfStatus':
        av = a.cfStatus;
        bv = b.cfStatus;
        break;
      case 'staftId':
        av = a.staftId;
        bv = b.staftId;
        break;
      default:
        av = a.transDate;
        bv = b.transDate;
    }
    if (typeof av === 'string') {
      return direction === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return direction === 'asc' ? av - bv : bv - av;
  });
  return copy;
};

const calculateStats = (items: ITransactionResume[]): TransactionStats => {
  const totalSales = items.reduce((sum, t) => sum + t.total, 0);
  const accepted = items.filter(
    (t) => t.cfStatus === CFStatus.ACCEPTED || t.cfStatus === CFStatus.ACCEPTED_ALT
  ).length;
  const pending = items.filter((t) =>
    [CFStatus.PENDING, 0, 1, 5, 6, 7, 8].includes(t.cfStatus as number)
  ).length;
  const rejected = items.filter((t) => t.cfStatus === CFStatus.REJECTED).length;
  return {
    totalSales,
    acceptedTransactions: accepted,
    pendingTransactions: pending,
    rejectedTransactions: rejected,
    totalTransactions: items.length,
  };
};

export const useTransactions = (
  isNCFView: boolean = false,
  isTiendaView: boolean = false
): UseTransactionsReturn => {
  const globalSiteId = useSelectedSiteId();
  const getTodayDate = () => getCurrentSantoDomingoDate();

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [transNumberFilter, setTransNumberFilter] = useState('');
  const [cfNumberFilter, setCfNumberFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [cfTypeFilter, setCfTypeFilter] = useState('');
  const [siteIdFilter, setSiteIdFilter] = useState('');
  const [terminalFilter, setTerminalFilter] = useState<number | ''>('');
  const [staftIdFilter, setStaftIdFilter] = useState<number | ''>('');
  const [shiftFilter, setShiftFilter] = useState<number | ''>('');
  const [startDateFilter, setStartDateFilter] = useState<string>(getTodayDate());
  const [endDateFilter, setEndDateFilter] = useState<string>(getTodayDate());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [sortField, setSortField] = useState<SortField>('transDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<ITransactionResume | null>(null);

  // Sitio efectivo: override manual del filtro > sitio global.
  const effectiveSiteId = siteIdFilter || globalSiteId || undefined;

  // Params para el query (RTK Query cachea por clave serializada).
  const queryParams: GetTransactionsParams = useMemo(
    () => ({
      startDate: startDateFilter,
      endDate: endDateFilter,
      page: currentPage,
      limit: itemsPerPage,
      siteId: effectiveSiteId,
      transNumber: transNumberFilter || undefined,
      cfNumber: cfNumberFilter || undefined,
      terminal: terminalFilter === '' ? undefined : terminalFilter,
      cfType: cfTypeFilter || undefined,
      staftId: staftIdFilter === '' ? undefined : staftIdFilter,
      shift: shiftFilter === '' ? undefined : shiftFilter,
      taxpayerId: searchTerm || undefined,
    }),
    [
      startDateFilter,
      endDateFilter,
      currentPage,
      itemsPerPage,
      effectiveSiteId,
      transNumberFilter,
      cfNumberFilter,
      terminalFilter,
      cfTypeFilter,
      staftIdFilter,
      shiftFilter,
      searchTerm,
    ]
  );

  const { data, isLoading, error, refetch } = useGetTransactionsQuery(queryParams);

  // Aplicar vista (NCF/Tienda) + ordenamiento local.
  const transactions: ITransactionResume[] = useMemo(() => {
    let list = data?.data ?? [];
    if (isNCFView) {
      list = list.filter((t) => t.prods?.[0]?.categoryId === 'COMB');
    } else if (isTiendaView) {
      list = list.filter((t) => {
        if (t.zataca) return false;
        if (t.prods?.[0]?.categoryId === 'COMB') return false;
        return true;
      });
    }
    return sortTransactions(list, sortField, sortDirection);
  }, [data?.data, isNCFView, isTiendaView, sortField, sortDirection]);

  const serverStats = data?.statistics ?? null;
  const pagination = data?.pagination ?? null;

  const stats: TransactionStats = useMemo(() => {
    if (serverStats) {
      return {
        totalSales: serverStats.totalSales,
        acceptedTransactions: serverStats.dgiiAcceptedTransactions,
        pendingTransactions: serverStats.dgiiPendingTransactions,
        rejectedTransactions: serverStats.dgiiRejectedTransactions,
        totalTransactions: serverStats.totalTransactions,
      };
    }
    return calculateStats(transactions);
  }, [serverStats, transactions]);

  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil(transactions.length / itemsPerPage));

  // Handlers que resetean página cuando cambia el filtro.
  const wrapSetter = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setCurrentPage(1);
  };

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
      setCurrentPage(1);
    },
    [sortField]
  );

  const loadTransactions = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const loadTransactionsWithDates = useCallback(
    async (startDate: string, endDate: string) => {
      setStartDateFilter(startDate);
      setEndDateFilter(endDate);
      setCurrentPage(1);
      // RTK Query refetchea automáticamente al cambiar queryParams.
    },
    []
  );

  const refreshTransactions = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const applySearchParams = useCallback((params: SearchParams) => {
    if (params.startDate !== undefined) setStartDateFilter(params.startDate);
    if (params.endDate !== undefined) setEndDateFilter(params.endDate);
    if (params.transNumber !== undefined) setTransNumberFilter(params.transNumber || '');
    if (params.cfNumber !== undefined) setCfNumberFilter(params.cfNumber || '');
    if (params.siteId !== undefined) setSiteIdFilter(params.siteId || '');
    if (params.terminal !== undefined) setTerminalFilter(params.terminal);
    if (params.cfType !== undefined) setCfTypeFilter(params.cfType || '');
    if (params.staftId !== undefined) setStaftIdFilter(params.staftId);
    if (params.shift !== undefined) setShiftFilter(params.shift);
    if (params.taxpayerId !== undefined) setSearchTerm(params.taxpayerId || '');
    setCurrentPage(1);
  }, []);

  const searchTransactions = useCallback(
    async (params: SearchParams) => {
      applySearchParams(params);
    },
    [applySearchParams]
  );

  const searchTransactionsDirectly = useCallback(
    async (params: SearchParams & { page?: number; limit?: number }) => {
      applySearchParams(params);
      if (params.page !== undefined) setCurrentPage(params.page);
      if (params.limit !== undefined && params.limit !== itemsPerPage) {
        setItemsPerPage(params.limit);
      }
    },
    [applySearchParams, itemsPerPage]
  );

  const exportTransactions = useCallback(
    async (format: 'pdf' | 'excel' | 'csv') => {
      try {
        if (format === 'excel') {
          ExcelService.exportTransactionsToExcel(transactions, {
            filename: `transacciones_${startDateFilter}_${endDateFilter}.xlsx`,
            includeFilters: true,
            dateRange: { startDate: startDateFilter, endDate: endDateFilter },
          });
        } else if (format === 'pdf') {
          alert('La exportación a PDF no está disponible por el momento.');
        }
      } catch (err) {
        alert(`Error al exportar: ${getErrorMessage(err, 'Error al exportar transacciones')}`);
      }
    },
    [transactions, startDateFilter, endDateFilter]
  );

  return {
    transactions,
    stats,
    serverStats,
    pagination,
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar transacciones'),
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
    setSearchTerm: wrapSetter(setSearchTerm),
    setTransNumberFilter: wrapSetter(setTransNumberFilter),
    setCfNumberFilter: wrapSetter(setCfNumberFilter),
    setStatusFilter: wrapSetter(setStatusFilter),
    setCfTypeFilter: wrapSetter(setCfTypeFilter),
    setSiteIdFilter: wrapSetter(setSiteIdFilter),
    setTerminalFilter: wrapSetter(setTerminalFilter),
    setStaftIdFilter: wrapSetter(setStaftIdFilter),
    setShiftFilter: wrapSetter(setShiftFilter),
    setStartDateFilter: wrapSetter(setStartDateFilter),
    setEndDateFilter: wrapSetter(setEndDateFilter),
    setSelectedTransaction,
    setCurrentPage,
    setSortField,
    setSortDirection,
    handleSort,
    loadTransactions,
    loadTransactionsWithDates,
    refreshTransactions,
    searchTransactions,
    searchTransactionsDirectly,
    exportTransactions,
  };
};
