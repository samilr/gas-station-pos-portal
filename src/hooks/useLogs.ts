import { useCallback, useState } from 'react';
import {
  useGetActionLogsQuery,
  useGetErrorLogsQuery,
  useResolveErrorMutation,
} from '../store/api/logsApi';
import { getErrorMessage } from '../store/api/baseApi';
import { getCurrentSantoDomingoDate } from '../utils/transactionUtils';
import { PaginationMeta } from '../services/logService';

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
  const [startDateFilter, setStartDateFilter] = useState<string>(today);
  const [endDateFilter, setEndDateFilter] = useState<string>(today);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const { data, isLoading, error, refetch } = useGetActionLogsQuery({
    fromDate: startDateFilter,
    toDate: endDateFilter,
    page: currentPage,
    limit,
  });

  const loadActionLogsWithDates = useCallback((startDate: string, endDate: string) => {
    setStartDateFilter(startDate);
    setEndDateFilter(endDate);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => setCurrentPage(page), []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  return {
    actionLogs: data?.data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar logs de acciones'),
    startDateFilter,
    endDateFilter,
    setStartDateFilter,
    setEndDateFilter,
    refreshActionLogs: refetch,
    loadActionLogsWithDates,
    pagination: data?.pagination ?? defaultPagination,
    currentPage,
    goToPage,
    limit,
    changeLimit,
  };
};

export const useErrorLogs = () => {
  const today = getCurrentSantoDomingoDate();
  const [startDateFilter, setStartDateFilter] = useState<string>(today);
  const [endDateFilter, setEndDateFilter] = useState<string>(today);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const { data, isLoading, error, refetch } = useGetErrorLogsQuery({
    fromDate: startDateFilter,
    toDate: endDateFilter,
    page: currentPage,
    limit,
  });
  const [resolveMut] = useResolveErrorMutation();

  const loadErrorLogsWithDates = useCallback((startDate: string, endDate: string) => {
    setStartDateFilter(startDate);
    setEndDateFilter(endDate);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => setCurrentPage(page), []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const resolveError = useCallback(
    async (errorId: string, resolvedBy: string) => {
      try {
        await resolveMut({ errorId, resolvedBy }).unwrap();
        return true;
      } catch {
        return false;
      }
    },
    [resolveMut]
  );

  return {
    errorLogs: data?.data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar logs de errores'),
    startDateFilter,
    endDateFilter,
    setStartDateFilter,
    setEndDateFilter,
    refreshErrorLogs: refetch,
    loadErrorLogsWithDates,
    resolveError,
    pagination: data?.pagination ?? defaultPagination,
    currentPage,
    goToPage,
    limit,
    changeLimit,
  };
};
