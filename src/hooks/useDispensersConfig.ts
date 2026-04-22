import { useMemo, useState } from 'react';
import { useListDispensersConfigQuery } from '../store/api/dispensersConfigApi';
import { useSelectedSiteId } from './useSelectedSite';
import { getErrorMessage } from '../store/api/baseApi';

export function useDispensersConfig(initialFilters?: { siteId?: string; ptsId?: string }) {
  const globalSiteId = useSelectedSiteId();
  const [filters, setFilters] = useState<{ siteId?: string; ptsId?: string }>(initialFilters || {});

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      siteId: filters.siteId ?? globalSiteId ?? undefined,
    }),
    [filters, globalSiteId]
  );

  const { data, isLoading, error, refetch } = useListDispensersConfigQuery(effectiveFilters);

  return {
    dispensers: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar dispensadoras'),
    refresh: refetch,
    filters: effectiveFilters,
    setFilters,
  };
}

export default useDispensersConfig;
