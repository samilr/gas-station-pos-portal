import { useMemo, useState } from 'react';
import { ListFilters } from '../services/cardPaymentService';
import {
  useListCardPaymentsQuery,
  useListOrphanedCardPaymentsQuery,
} from '../store/api/cardPaymentsApi';
import { useSelectedSiteId } from './useSelectedSite';
import { getErrorMessage } from '../store/api/baseApi';

export function useCardPayments(initialFilters: ListFilters = { page: 1, limit: 20 }) {
  const globalSiteId = useSelectedSiteId();
  const [filters, setFilters] = useState<ListFilters>(initialFilters);

  const effectiveFilters = useMemo<ListFilters>(
    () => ({ ...filters, siteId: filters.siteId ?? globalSiteId ?? undefined }),
    [filters, globalSiteId]
  );

  const { data, isLoading, error, refetch } = useListCardPaymentsQuery(effectiveFilters);

  return {
    payments: data?.data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar pagos con tarjeta'),
    refresh: refetch,
    filters: effectiveFilters,
    setFilters,
    pagination: data?.pagination ?? null,
  };
}

export function useOrphanedCardPayments(siteId?: string) {
  const globalSiteId = useSelectedSiteId();
  const effectiveSiteId = siteId !== undefined ? siteId : (globalSiteId ?? undefined);

  const { data, isLoading, error, refetch } = useListOrphanedCardPaymentsQuery(effectiveSiteId);

  return {
    orphans: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar huérfanos'),
    refresh: refetch,
  };
}
