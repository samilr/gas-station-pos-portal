import { useState, useEffect, useCallback } from 'react';
import { ITransactionResume, CFStatus, ITransactionStatistics, IPaginationMeta } from '../types/transaction';
import { getCurrentSantoDomingoDate } from '../utils/transactionUtils';
import { transactionService } from '../services/transactionService';
import { mockTransactions } from '../data/mockTransactions';
import ExcelService from '../services/excelService';

interface TransactionStats {
  totalSales: number;
  acceptedTransactions: number;
  pendingTransactions: number;
  rejectedTransactions: number;
  totalTransactions: number;
}

export type SortField = 'transNumber' | 'cfNumber' | 'transDate' | 'siteId' | 'taxpayerName' | 'total' | 'cfStatus' | 'staftId';
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
  setTransNumberFilter: (transNumber: string) => void;
  setCfNumberFilter: (cfNumber: string) => void;
  setStatusFilter: (status: number | '') => void;
  setCfTypeFilter: (cfType: string) => void;
  setSiteIdFilter: (siteId: string) => void;
  setTerminalFilter: (terminal: number | '') => void;
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
  loadTransactionsWithDates: (startDate: string, endDate: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  searchTransactions: (params: {
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
  }) => Promise<void>;
  searchTransactionsDirectly: (params: {
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
    page?: number;
    limit?: number;
  }) => Promise<void>;
  exportTransactions: (format: 'pdf' | 'excel' | 'csv') => Promise<void>;
}

export const useTransactions = (isNCFView: boolean = false, isTiendaView: boolean = false): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<ITransactionResume[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalSales: 0,
    acceptedTransactions: 0,
    pendingTransactions: 0,
    rejectedTransactions: 0,
    totalTransactions: 0
  });
  const [serverStats, setServerStats] = useState<ITransactionStatistics | null>(null);
  const [pagination, setPagination] = useState<IPaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransactionResume | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [transNumberFilter, setTransNumberFilter] = useState<string>('');
  const [cfNumberFilter, setCfNumberFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [cfTypeFilter, setCfTypeFilter] = useState<string>('');
  const [siteIdFilter, setSiteIdFilter] = useState<string>('');
  const [terminalFilter, setTerminalFilter] = useState<number | ''>('');
  const [staftIdFilter, setStaftIdFilter] = useState<number | ''>('');
  const [shiftFilter, setShiftFilter] = useState<number | ''>('');
  // Obtener fecha de hoy en formato YYYY-MM-DD en zona horaria de Santo Domingo
  const getTodayDate = () => {
    return getCurrentSantoDomingoDate();
  };

  const [startDateFilter, setStartDateFilter] = useState<string>(getTodayDate());
  const [endDateFilter, setEndDateFilter] = useState<string>(getTodayDate());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); // Por defecto 15 items por página
  
  const [sortField, setSortField] = useState<SortField>('transDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Rango de fechas de los datos actuales cargados
  const [currentDataDateRange, setCurrentDataDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: getTodayDate(),
    endDate: getTodayDate()
  });

  // Función para calcular estadísticas
  const calculateStats = useCallback((transactions: ITransactionResume[]) => {
    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
    const acceptedTransactions = transactions.filter(t => t.cfStatus === CFStatus.ACCEPTED || t.cfStatus === CFStatus.ACCEPTED_ALT).length;
    
    // Facturas con cf_status 0, 1, 5, 6, 7, 8 se consideran como "Pendientes"
    const pendingTransactions = transactions.filter(t => 
      t.cfStatus === CFStatus.PENDING || 
      t.cfStatus === 0 || 
      t.cfStatus === 1 || 
      t.cfStatus === 5 || 
      t.cfStatus === 6 || 
      t.cfStatus === 7 || 
      t.cfStatus === 8
    ).length;
    
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
        case 'staftId':
          aValue = a.staftId;
          bValue = b.staftId;
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

  // Función para filtrar transacciones de combustible
  const filterCombustibleTransactions = useCallback((transactions: ITransactionResume[]) => {
    if (!isNCFView) return transactions;
    
    return transactions.filter(transaction => {
      // Verificar si tiene productos y si el primer producto es combustible
      if (transaction.prods && transaction.prods.length > 0) {
        const firstProduct = transaction.prods[0];
        return firstProduct.categoryId === 'COMB';
      }
      return false;
    });
  }, [isNCFView]);

  // Función para filtrar transacciones de productos de tienda (excluye zataca y combustibles)
  const filterTiendaTransactions = useCallback((transactions: ITransactionResume[]) => {
    if (!isTiendaView) return transactions;
    
    return transactions.filter(transaction => {
      // Excluir transacciones con zataca (verificar si existe)
      if (transaction.zataca) {
        return false;
      }
      
      // Excluir transacciones de combustible
      if (transaction.prods && transaction.prods.length > 0) {
        const firstProduct = transaction.prods[0];
        if (firstProduct.categoryId === 'COMB') {
          return false;
        }
      }
      
      return true;
    });
  }, [isTiendaView]);

  // Función combinada para filtrar transacciones
  const filterTransactions = useCallback((transactions: ITransactionResume[]) => {
    if (isNCFView) {
      return filterCombustibleTransactions(transactions);
    }
    
    if (isTiendaView) {
      return filterTiendaTransactions(transactions);
    }
    
    return transactions;
  }, [isNCFView, isTiendaView, filterCombustibleTransactions, filterTiendaTransactions]);

  // Función para buscar localmente por transNumber
  const findTransactionByNumber = useCallback((transNumber: string): boolean => {
    const found = transactions.some(t => t.transNumber === transNumber);
    console.log(`🔍 Buscando transNumber "${transNumber}":`, found);
    if (found) {
      console.log('📋 Transacciones disponibles:', transactions.map(t => t.transNumber));
    }
    return found;
  }, [transactions]);

  // Función para buscar localmente por cfNumber
  const findTransactionByCfNumber = useCallback((cfNumber: string): boolean => {
    const found = transactions.some(t => t.cfNumber === cfNumber);
    console.log(`🔍 Buscando cfNumber "${cfNumber}":`, found);
    if (found) {
      console.log('📋 CfNumbers disponibles:', transactions.map(t => t.cfNumber));
    }
    return found;
  }, [transactions]);

  // Función para buscar localmente por siteId
  const findTransactionBySiteId = useCallback((siteId: string): boolean => {
    const found = transactions.some(t => t.siteId?.toLowerCase().includes(siteId.toLowerCase()));
    console.log(`🔍 Buscando siteId "${siteId}":`, found);
    return found;
  }, [transactions]);

  // Función para buscar localmente por terminal
  const findTransactionByTerminal = useCallback((terminal: number): boolean => {
    const found = transactions.some(t => t.terminalId === terminal);
    console.log(`🔍 Buscando terminal "${terminal}":`, found);
    return found;
  }, [transactions]);

  // Función para buscar localmente por cfType
  const findTransactionByCfType = useCallback((cfType: string): boolean => {
    const found = transactions.some(t => t.cfType === cfType);
    console.log(`🔍 Buscando cfType "${cfType}":`, found);
    return found;
  }, [transactions]);

  // Función para buscar localmente por staftId
  const findTransactionByStaftId = useCallback((staftId: number): boolean => {
    const found = transactions.some(t => t.staftId === staftId);
    console.log(`🔍 Buscando staftId "${staftId}":`, found);
    return found;
  }, [transactions]);

  // Función para buscar localmente por taxpayerId
  const findTransactionByTaxpayerId = useCallback((taxpayerId: string): boolean => {
    const found = transactions.some(t => t.taxpayerId?.toLowerCase().includes(taxpayerId.toLowerCase()));
    console.log(`🔍 Buscando taxpayerId "${taxpayerId}":`, found);
    return found;
  }, [transactions]);

  // Función para buscar localmente por shift
  const findTransactionByShift = useCallback((shift: number): boolean => {
    const found = transactions.some(t => t.shift === shift);
    console.log(`🔍 Buscando shift "${shift}":`, found);
    return found;
  }, [transactions]);

  // Función para verificar si el rango de fechas solicitado está dentro del rango de datos actuales
  const isDateRangeWithinCurrentData = useCallback((startDate: string, endDate: string): boolean => {
    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);
    const currentStart = new Date(currentDataDateRange.startDate);
    const currentEnd = new Date(currentDataDateRange.endDate);
    
    return requestedStart >= currentStart && requestedEnd <= currentEnd;
  }, [currentDataDateRange]);


  // Función para cargar transacciones (solo en la carga inicial)
  const loadTransactions = useCallback(async () => {
    // Solo cargar si no hay datos o si las fechas han cambiado
    // Esto evita recargar cuando se aplican filtros manualmente
    if (transactions.length > 0 && currentDataDateRange.startDate === startDateFilter && currentDataDateRange.endDate === endDateFilter) {
      console.log('⏭️ Saltando carga: ya hay datos para estas fechas');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Enviar fecha de hoy por defecto en la primera carga con paginación
      const params = {
        startDate: startDateFilter,
        endDate: endDateFilter,
        page: currentPage,
        limit: itemsPerPage
      };
      
      const response = await transactionService.getTransactions(params);
      
      // Filtrar transacciones según la vista activa
      const filteredData = filterTransactions(response.data);
      
      const sortedData = sortTransactions(filteredData, sortField, sortDirection);
      setTransactions(sortedData);
      
      // SIEMPRE usar estadísticas del servidor cuando estén disponibles
      if (response.statistics) {
        setServerStats(response.statistics);
        // Actualizar stats locales con las estadísticas del servidor (del total de transacciones filtradas)
        setStats({
          totalSales: response.statistics.totalSales,
          acceptedTransactions: response.statistics.dgiiAcceptedTransactions,
          pendingTransactions: response.statistics.dgiiPendingTransactions,
          rejectedTransactions: response.statistics.dgiiRejectedTransactions,
          totalTransactions: response.statistics.totalTransactions
        });
      } else {
        // Solo calcular localmente si NO hay estadísticas del servidor (fallback)
        console.warn('⚠️ No se recibieron estadísticas del servidor, calculando localmente (puede ser inexacto)');
        setStats(calculateStats(sortedData));
        setServerStats(null);
      }
      
      // Guardar paginación del servidor
      setPagination(response.pagination);
      
      // Actualizar el rango de fechas de los datos actuales
      setCurrentDataDateRange({
        startDate: startDateFilter,
        endDate: endDateFilter
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones');
      // En caso de error, usamos datos mock como fallback
      console.warn('Usando datos mock como fallback:', err);
      const mockFiltered = filterTransactions(mockTransactions);
      const sortedData = sortTransactions(mockFiltered, sortField, sortDirection);
      setTransactions(sortedData);
      setStats(calculateStats(sortedData));
      setServerStats(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, sortField, sortDirection, sortTransactions, filterTransactions, startDateFilter, endDateFilter, currentPage, itemsPerPage, transactions.length, currentDataDateRange]);

  // Función para cargar transacciones con fechas específicas (usada por los filtros)
  const loadTransactionsWithDates = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        startDate,
        endDate,
        page: 1, // Resetear a la primera página
        limit: itemsPerPage
      };
      
      const response = await transactionService.getTransactions(params);
      
      // Filtrar transacciones según la vista activa
      const filteredData = filterTransactions(response.data);
      
      const sortedData = sortTransactions(filteredData, sortField, sortDirection);
      setTransactions(sortedData);
      setStats(calculateStats(sortedData));
      
      // Guardar estadísticas y paginación del servidor
      setServerStats(response.statistics);
      setPagination(response.pagination);
      
      // Resetear a la primera página
      setCurrentPage(1);
      
      // Actualizar el rango de fechas de los datos actuales
      setCurrentDataDateRange({
        startDate,
        endDate
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones');
      // En caso de error, usamos datos mock como fallback
      console.warn('Usando datos mock como fallback:', err);
      const mockFiltered = filterTransactions(mockTransactions);
      const sortedData = sortTransactions(mockFiltered, sortField, sortDirection);
      setTransactions(sortedData);
      setStats(calculateStats(sortedData));
      setServerStats(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, sortField, sortDirection, sortTransactions, filterTransactions, itemsPerPage]);

  // Calcular total de páginas desde la paginación del servidor o localmente
  const totalPages = pagination?.totalPages || Math.ceil(transactions.length / itemsPerPage);

  // Funciones wrapper para resetear página
  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSetTransNumberFilter = (transNumber: string) => {
    setTransNumberFilter(transNumber);
    setCurrentPage(1);
  };

  const handleSetCfNumberFilter = (cfNumber: string) => {
    setCfNumberFilter(cfNumber);
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

  const handleSetTerminalFilter = (terminal: number | '') => {
    setTerminalFilter(terminal);
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


  // Función para filtrar transacciones localmente
  const filterTransactionsLocally = useCallback((params: {
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
    let filteredData = [...transactions];
    console.log('🏠 Iniciando filtrado local con', transactions.length, 'transacciones');
    
    // Filtrar por transNumber
    if (params.transNumber) {
      const beforeCount = filteredData.length;
      filteredData = filteredData.filter(t => 
        t.transNumber?.toLowerCase().includes(params.transNumber!.toLowerCase())
      );
      console.log(`🔍 Filtro transNumber "${params.transNumber}": ${beforeCount} -> ${filteredData.length}`);
    }
    
    // Filtrar por cfNumber
    if (params.cfNumber) {
      const beforeCount = filteredData.length;
      filteredData = filteredData.filter(t => 
        t.cfNumber?.toLowerCase().includes(params.cfNumber!.toLowerCase())
      );
      console.log(`🔍 Filtro cfNumber "${params.cfNumber}": ${beforeCount} -> ${filteredData.length}`);
    }
    
    // Filtrar por siteId
    if (params.siteId) {
      filteredData = filteredData.filter(t => 
        t.siteId?.toLowerCase().includes(params.siteId!.toLowerCase())
      );
    }
    
    // Filtrar por terminal
    if (params.terminal !== undefined) {
      filteredData = filteredData.filter(t => t.terminalId === params.terminal);
    }
    
    // Filtrar por cfType
    if (params.cfType) {
      filteredData = filteredData.filter(t => t.cfType === params.cfType);
    }
    
    // Filtrar por staftId
    if (params.staftId !== undefined) {
      filteredData = filteredData.filter(t => t.staftId === params.staftId);
    }
    
    // Filtrar por taxpayerId
    if (params.taxpayerId) {
      filteredData = filteredData.filter(t => 
        t.taxpayerId?.toLowerCase().includes(params.taxpayerId!.toLowerCase())
      );
    }
    
    // Filtrar por shift
    if (params.shift !== undefined) {
      filteredData = filteredData.filter(t => t.shift === params.shift);
    }
    
    // Filtrar por rango de fechas (solo si no estamos buscando solo por campos específicos)
    const isOnlySearchingBySpecificFields = (params.cfNumber || params.transNumber || 
      params.siteId || params.terminal || params.cfType || 
      params.staftId || params.taxpayerId || params.shift) && 
      // Verificar que no hay múltiples filtros activos
      [params.cfNumber, params.transNumber, params.siteId, params.terminal, 
       params.cfType, params.staftId, params.taxpayerId, params.shift]
      .filter(Boolean).length === 1;
    
    if (params.startDate && params.endDate && !isOnlySearchingBySpecificFields) {
      const beforeCount = filteredData.length;
      const startDate = new Date(params.startDate);
      const endDate = new Date(params.endDate);
      endDate.setHours(23, 59, 59, 999); // Incluir todo el día final
      
      console.log(`📅 Filtro de fechas: ${params.startDate} a ${params.endDate}`);
      console.log(`📅 Rango de búsqueda: ${startDate.toISOString()} a ${endDate.toISOString()}`);
      
      filteredData = filteredData.filter(t => {
        const transDate = new Date(t.transDate);
        const isInRange = transDate >= startDate && transDate <= endDate;
        if (!isInRange) {
          console.log(`❌ Transacción ${t.transNumber} (${t.cfNumber}) fuera de rango: ${transDate.toISOString()}`);
        }
        return isInRange;
      });
      
      console.log(`🔍 Filtro de fechas: ${beforeCount} -> ${filteredData.length}`);
    } else if (isOnlySearchingBySpecificFields) {
      console.log('⏭️ Saltando filtro de fechas porque solo se busca por campos específicos');
    }
    
    console.log('🏠 Filtrado local completado:', filteredData.length, 'resultados');
    return filteredData;
  }, [transactions]);

  // Función para buscar transacciones con filtros avanzados
  const searchTransactions = useCallback(async (params: {
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
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Parámetros de búsqueda:', params);
      console.log('📊 Transacciones actuales:', transactions.length);
      console.log('📅 Rango de datos actuales:', currentDataDateRange);
      
      // Determinar si necesitamos buscar en la API o filtrar localmente
      const dateRangeExceeds = params.startDate && params.endDate && !isDateRangeWithinCurrentData(params.startDate, params.endDate);
      const transNumberNotFound = params.transNumber && !findTransactionByNumber(params.transNumber);
      const cfNumberNotFound = params.cfNumber && !findTransactionByCfNumber(params.cfNumber);
      const siteIdNotFound = params.siteId && !findTransactionBySiteId(params.siteId);
      const terminalNotFound = params.terminal !== undefined && !findTransactionByTerminal(params.terminal);
      const cfTypeNotFound = params.cfType && !findTransactionByCfType(params.cfType);
      const staftIdNotFound = params.staftId !== undefined && !findTransactionByStaftId(params.staftId);
      const taxpayerIdNotFound = params.taxpayerId && !findTransactionByTaxpayerId(params.taxpayerId);
      const shiftNotFound = params.shift !== undefined && !findTransactionByShift(params.shift);
      
      // Si solo estamos buscando por campos específicos y los encontramos localmente,
      // no necesitamos buscar en la API, incluso si el rango de fechas es diferente
      const isOnlySearchingBySpecificFields = (params.cfNumber || params.transNumber || 
        params.siteId || params.terminal || params.cfType || 
        params.staftId || params.taxpayerId || params.shift) && 
        // Verificar que no hay múltiples filtros activos
        [params.cfNumber, params.transNumber, params.siteId, params.terminal, 
         params.cfType, params.staftId, params.taxpayerId, params.shift]
        .filter(Boolean).length === 1;
      
      const needsApiSearch = (dateRangeExceeds && !isOnlySearchingBySpecificFields) || 
        (transNumberNotFound && !isOnlySearchingBySpecificFields) || 
        (cfNumberNotFound && !isOnlySearchingBySpecificFields) ||
        (siteIdNotFound && !isOnlySearchingBySpecificFields) ||
        (terminalNotFound && !isOnlySearchingBySpecificFields) ||
        (cfTypeNotFound && !isOnlySearchingBySpecificFields) ||
        (staftIdNotFound && !isOnlySearchingBySpecificFields) ||
        (taxpayerIdNotFound && !isOnlySearchingBySpecificFields) ||
        (shiftNotFound && !isOnlySearchingBySpecificFields);
      
      console.log('📈 Análisis de búsqueda:');
      console.log('  - Rango de fechas excede datos actuales:', dateRangeExceeds);
      console.log('  - TransNumber no encontrado:', transNumberNotFound);
      console.log('  - CfNumber no encontrado:', cfNumberNotFound);
      console.log('  - SiteId no encontrado:', siteIdNotFound);
      console.log('  - Terminal no encontrado:', terminalNotFound);
      console.log('  - CfType no encontrado:', cfTypeNotFound);
      console.log('  - StaftId no encontrado:', staftIdNotFound);
      console.log('  - TaxpayerId no encontrado:', taxpayerIdNotFound);
      console.log('  - Shift no encontrado:', shiftNotFound);
      console.log('  - Solo buscando por campos específicos:', isOnlySearchingBySpecificFields);
      console.log('  - Necesita búsqueda en API:', needsApiSearch);
      
      if (needsApiSearch) {
        console.log('🌐 Buscando en la API...');
        // Buscar en la API con paginación
        const apiParams = {
          ...params,
          page: currentPage,
          limit: itemsPerPage
        };
        const response = await transactionService.getTransactions(apiParams);
        
        // Filtrar transacciones según la vista activa
        const filteredData = filterTransactions(response.data);
        
        const sortedData = sortTransactions(filteredData, sortField, sortDirection);
        setTransactions(sortedData);
        setStats(calculateStats(sortedData));
        
        // Guardar estadísticas y paginación del servidor
        setServerStats(response.statistics);
        setPagination(response.pagination);
        
        // Actualizar el rango de fechas de los datos actuales
        if (params.startDate && params.endDate) {
          setCurrentDataDateRange({
            startDate: params.startDate,
            endDate: params.endDate
          });
        }
        console.log('✅ Datos cargados desde API:', sortedData.length);
      } else {
        console.log('🏠 Filtrando localmente...');
        // Filtrar localmente
        const filteredData = filterTransactionsLocally(params);
        const sortedData = sortTransactions(filteredData, sortField, sortDirection);
        setTransactions(sortedData);
        setStats(calculateStats(sortedData));
        console.log('✅ Datos filtrados localmente:', sortedData.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar transacciones');
      console.warn('Error en búsqueda de transacciones:', err);
      setServerStats(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, sortField, sortDirection, sortTransactions, filterTransactions, isDateRangeWithinCurrentData, findTransactionByNumber, findTransactionByCfNumber, findTransactionBySiteId, findTransactionByTerminal, findTransactionByCfType, findTransactionByStaftId, findTransactionByTaxpayerId, findTransactionByShift, filterTransactionsLocally, transactions, currentDataDateRange, currentPage, itemsPerPage]);

  // Función para buscar directamente en la API sin lógica de filtrado local
  const searchTransactionsDirectly = useCallback(async (params: {
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
    page?: number; // Permitir pasar la página como parámetro
    limit?: number; // Permitir pasar el límite como parámetro
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Buscando directamente en la API con parámetros:', params);
      
      // Actualizar los estados de filtros para que coincidan con los parámetros
      if (params.startDate) setStartDateFilter(params.startDate);
      if (params.endDate) setEndDateFilter(params.endDate);
      if (params.transNumber !== undefined) setTransNumberFilter(params.transNumber || '');
      if (params.cfNumber !== undefined) setCfNumberFilter(params.cfNumber || '');
      if (params.siteId !== undefined) setSiteIdFilter(params.siteId || '');
      if (params.terminal !== undefined) setTerminalFilter(params.terminal || '');
      if (params.cfType !== undefined) setCfTypeFilter(params.cfType || '');
      if (params.staftId !== undefined) setStaftIdFilter(params.staftId || '');
      if (params.shift !== undefined) setShiftFilter(params.shift || '');
      if (params.taxpayerId !== undefined) setSearchTerm(params.taxpayerId || '');
      
      // Buscar directamente en la API con paginación
      const apiParams = {
        ...params,
        page: params.page ?? currentPage, // Usar la página del parámetro o la actual
        limit: params.limit ?? itemsPerPage // Usar el límite del parámetro o el actual
      };
      
      // Si se pasó un nuevo límite, actualizar el estado
      if (params.limit !== undefined && params.limit !== itemsPerPage) {
        setItemsPerPage(params.limit);
      }
      
      const response = await transactionService.getTransactions(apiParams);
      
      console.log('🔍 Respuesta completa de la API:', response);
      console.log('📄 Paginación recibida:', response.pagination);
      console.log('📊 Estadísticas recibidas:', response.statistics);
      
      // Filtrar transacciones según la vista activa
      const filteredData = filterTransactions(response.data);
      
      const sortedData = sortTransactions(filteredData, sortField, sortDirection);
      setTransactions(sortedData);
      
      // SIEMPRE usar estadísticas del servidor cuando estén disponibles
      // Nunca calcular estadísticas localmente basándose en los datos de la página actual
      if (response.statistics) {
        console.log('✅ Usando estadísticas del servidor:', response.statistics);
        setServerStats(response.statistics);
        // Actualizar stats locales con las estadísticas del servidor (del total de transacciones filtradas)
        setStats({
          totalSales: response.statistics.totalSales,
          acceptedTransactions: response.statistics.dgiiAcceptedTransactions,
          pendingTransactions: response.statistics.dgiiPendingTransactions,
          rejectedTransactions: response.statistics.dgiiRejectedTransactions,
          totalTransactions: response.statistics.totalTransactions
        });
      } else {
        // Solo calcular localmente si NO hay estadísticas del servidor (fallback)
        // Pero esto solo debería pasar en casos de error
        console.warn('⚠️ No se recibieron estadísticas del servidor, calculando localmente (puede ser inexacto)');
        setStats(calculateStats(sortedData));
        setServerStats(null);
      }
      
      // Guardar paginación del servidor
      if (response.pagination) {
        console.log('✅ Guardando paginación del servidor:', response.pagination);
        setPagination(response.pagination);
      } else {
        console.warn('⚠️ No se recibió paginación del servidor');
        setPagination(null);
      }
      
      // Actualizar la página actual si se pasó como parámetro
      if (params.page !== undefined) {
        setCurrentPage(params.page);
      }
      
      // Actualizar el rango de fechas de los datos actuales
      if (params.startDate && params.endDate) {
        setCurrentDataDateRange({
          startDate: params.startDate,
          endDate: params.endDate
        });
      }
      
      console.log('✅ Datos cargados directamente desde API:', sortedData.length);
      console.log('📊 Estadísticas establecidas:', response.statistics);
      console.log('📄 Paginación establecida:', response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar transacciones');
      console.warn('Error en búsqueda directa de transacciones:', err);
      setServerStats(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, sortField, sortDirection, sortTransactions, filterTransactions, currentPage, itemsPerPage]);

  // Función para refrescar transacciones (definida después de searchTransactionsDirectly)
  const refreshTransactions = useCallback(async () => {
    // Usar searchTransactionsDirectly con los filtros actuales para mantener los filtros aplicados
    const params: any = {
      startDate: startDateFilter,
      endDate: endDateFilter,
      page: currentPage,
      limit: itemsPerPage
    };
    
    // Agregar otros filtros si están activos
    if (transNumberFilter) params.transNumber = transNumberFilter;
    if (cfNumberFilter) params.cfNumber = cfNumberFilter;
    if (siteIdFilter) params.siteId = siteIdFilter;
    if (terminalFilter !== '') params.terminal = terminalFilter;
    if (cfTypeFilter) params.cfType = cfTypeFilter;
    if (staftIdFilter !== '') params.staftId = staftIdFilter;
    if (shiftFilter !== '') params.shift = shiftFilter;
    if (searchTerm) params.taxpayerId = searchTerm;
    
    await searchTransactionsDirectly(params);
  }, [startDateFilter, endDateFilter, currentPage, itemsPerPage, transNumberFilter, cfNumberFilter, siteIdFilter, terminalFilter, cfTypeFilter, staftIdFilter, shiftFilter, searchTerm, searchTransactionsDirectly]);

  // Función para exportar transacciones
  const exportTransactions = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      if (format === 'excel') {
        // Exportar a Excel con 3 hojas
        const options = {
          filename: `transacciones_${startDateFilter}_${endDateFilter}.xlsx`,
          includeFilters: true,
          dateRange: {
            startDate: startDateFilter,
            endDate: endDateFilter
          }
        };
        
        ExcelService.exportTransactionsToExcel(transactions, options);
      } else if (format === 'csv') {

      } else if (format === 'pdf') {

        alert('La exportación a PDF no está disponible por el momento.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al exportar transacciones';
      setError(errorMessage);
      console.error('Error en exportación:', err);
      alert(`Error al exportar: ${errorMessage}`);
    }
  }, [transactions, startDateFilter, endDateFilter]);

  // Cargar transacciones al montar el componente (solo una vez)
  useEffect(() => {
    // Solo cargar si no hay transacciones cargadas
    if (transactions.length === 0) {
      loadTransactions();
    }
  }, []); // Solo ejecutar una vez al montar

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
    setSearchTerm: handleSetSearchTerm,
    setTransNumberFilter: handleSetTransNumberFilter,
    setCfNumberFilter: handleSetCfNumberFilter,
    setStatusFilter: handleSetStatusFilter,
    setCfTypeFilter: handleSetCfTypeFilter,
    setSiteIdFilter: handleSetSiteIdFilter,
    setTerminalFilter: handleSetTerminalFilter,
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
    loadTransactionsWithDates,
    refreshTransactions,
    searchTransactions,
    searchTransactionsDirectly,
    exportTransactions
  };
};
