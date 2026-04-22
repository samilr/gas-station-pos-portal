import { useMemo, useState } from 'react';
import { useListDataphoneTerminalsQuery } from '../store/api/dataphoneTerminalsApi';
import { useSelectedSiteId } from './useSelectedSite';
import { getErrorMessage } from '../store/api/baseApi';

export function useDataphoneTerminals(initialFilters?: { siteId?: string }) {
  const globalSiteId = useSelectedSiteId();
  const [filters, setFilters] = useState<{ siteId?: string }>(initialFilters || {});

  const effectiveFilters = useMemo(
    () => ({ siteId: filters.siteId ?? globalSiteId ?? undefined }),
    [filters, globalSiteId]
  );

  const { data, isLoading, error, refetch } = useListDataphoneTerminalsQuery(effectiveFilters);

  return {
    terminals: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar mapeo dataphone-terminal'),
    refresh: refetch,
    filters: effectiveFilters,
    setFilters,
  };
}

export default useDataphoneTerminals;
