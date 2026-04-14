import { useState, useEffect, useCallback } from 'react';
import { logService, PaginationMeta } from '../services/logService';
import { IActionLog, IErrorLog } from '../types/logs';
import { getCurrentSantoDomingoDate } from '../utils/transactionUtils';

const DEFAULT_LIMIT = 20;

const defaultPagination: PaginationMeta = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export const useActionLogs = () => {
  const today = getCurrentSantoDomingoDate();
  const [actionLogs, setActionLogs] = useState<IActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDateFilter, setStartDateFilter] = useState<string>(today);
  const [endDateFilter, setEndDateFilter] = useState<string>(today);
  const [pagination, setPagination] = useState<PaginationMeta>(defaultPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const loadActionLogs = useCallback(async (
    fromDate: string,
    toDate: string,
    page: number,
    pageLimit: number = limit,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await logService.getActionLogs({ fromDate, toDate, page, limit: pageLimit });
      if (response.successful) {
        setActionLogs(response.data || []);
        setPagination(response.pagination ?? defaultPagination);
      } else {
        setError('Error al cargar logs de acciones');
      }
    } catch (err) {
      console.warn('Error cargando logs de acciones:', err);
      setError('Error de conexión al servidor');
      setActionLogs([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refreshActionLogs = useCallback(async () => {
    await loadActionLogs(startDateFilter, endDateFilter, currentPage, limit);
  }, [loadActionLogs, startDateFilter, endDateFilter, currentPage, limit]);

  const loadActionLogsWithDates = useCallback(async (startDate: string, endDate: string) => {
    setStartDateFilter(startDate);
    setEndDateFilter(endDate);
    setCurrentPage(1);
    await loadActionLogs(startDate, endDate, 1, limit);
  }, [loadActionLogs, limit]);

  const goToPage = useCallback(async (page: number) => {
    setCurrentPage(page);
    await loadActionLogs(startDateFilter, endDateFilter, page, limit);
  }, [loadActionLogs, startDateFilter, endDateFilter, limit]);

  const changeLimit = useCallback(async (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
    await loadActionLogs(startDateFilter, endDateFilter, 1, newLimit);
  }, [loadActionLogs, startDateFilter, endDateFilter]);

  useEffect(() => {
    loadActionLogs(today, today, 1, DEFAULT_LIMIT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    actionLogs,
    loading,
    error,
    startDateFilter,
    endDateFilter,
    setStartDateFilter,
    setEndDateFilter,
    refreshActionLogs,
    loadActionLogsWithDates,
    pagination,
    currentPage,
    goToPage,
    limit,
    changeLimit,
  };
};

export const useErrorLogs = () => {
  const today = getCurrentSantoDomingoDate();
  const [errorLogs, setErrorLogs] = useState<IErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDateFilter, setStartDateFilter] = useState<string>(today);
  const [endDateFilter, setEndDateFilter] = useState<string>(today);
  const [pagination, setPagination] = useState<PaginationMeta>(defaultPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const loadErrorLogs = useCallback(async (
    fromDate: string,
    toDate: string,
    page: number,
    pageLimit: number = limit,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await logService.getErrorLogs({ fromDate, toDate, page, limit: pageLimit });
      if (response.successful) {
        setErrorLogs(response.data || []);
        setPagination(response.pagination ?? defaultPagination);
      } else {
        setError('Error al cargar logs de errores');
      }
    } catch (err) {
      console.warn('Error cargando logs de errores:', err);
      setError('Error de conexión al servidor');
      setErrorLogs([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refreshErrorLogs = useCallback(async () => {
    await loadErrorLogs(startDateFilter, endDateFilter, currentPage, limit);
  }, [loadErrorLogs, startDateFilter, endDateFilter, currentPage, limit]);

  const loadErrorLogsWithDates = useCallback(async (startDate: string, endDate: string) => {
    setStartDateFilter(startDate);
    setEndDateFilter(endDate);
    setCurrentPage(1);
    await loadErrorLogs(startDate, endDate, 1, limit);
  }, [loadErrorLogs, limit]);

  const goToPage = useCallback(async (page: number) => {
    setCurrentPage(page);
    await loadErrorLogs(startDateFilter, endDateFilter, page, limit);
  }, [loadErrorLogs, startDateFilter, endDateFilter, limit]);

  const changeLimit = useCallback(async (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
    await loadErrorLogs(startDateFilter, endDateFilter, 1, newLimit);
  }, [loadErrorLogs, startDateFilter, endDateFilter]);

  const resolveError = useCallback(async (errorId: string, resolvedBy: string) => {
    try {
      const response = await logService.resolveError(errorId, resolvedBy);
      if (response.successful) {
        setErrorLogs(prev => prev.map(log =>
          log.errorId.toString() === errorId
            ? { ...log, resolved: true, resolvedBy: resolvedBy, resolvedAt: new Date() }
            : log
        ));
        return true;
      } else {
        setError('Error al marcar como resuelto');
        return false;
      }
    } catch (err) {
      setError('Error al marcar como resuelto');
      return false;
    }
  }, []);

  useEffect(() => {
    loadErrorLogs(today, today, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    errorLogs,
    loading,
    error,
    startDateFilter,
    endDateFilter,
    setStartDateFilter,
    setEndDateFilter,
    refreshErrorLogs,
    loadErrorLogsWithDates,
    resolveError,
    pagination,
    currentPage,
    goToPage,
    limit,
    changeLimit,
  };
};
