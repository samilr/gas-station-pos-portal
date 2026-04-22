import { useMemo, useState } from 'react';
import { useListDataphonesQuery } from '../store/api/dataphonesApi';
import { useSelectedSiteId } from './useSelectedSite';
import { getErrorMessage } from '../store/api/baseApi';

export function useDataphones(initialFilters?: { siteId?: string }) {
  const globalSiteId = useSelectedSiteId();
  const [filters, setFilters] = useState<{ siteId?: string }>(initialFilters || {});

  const effectiveFilters = useMemo(
    () => ({ siteId: filters.siteId ?? globalSiteId ?? undefined }),
    [filters, globalSiteId]
  );

  const { data, isLoading, error, refetch } = useListDataphonesQuery(effectiveFilters);

  return {
    dataphones: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar dataphones'),
    refresh: refetch,
    filters: effectiveFilters,
    setFilters,
  };
}

export default useDataphones;
