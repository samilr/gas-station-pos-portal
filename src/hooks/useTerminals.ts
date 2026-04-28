import { useMemo } from 'react';
import { useListTerminalsQuery } from '../store/api/terminalsApi';
import { useSelectedSiteId } from './useSelectedSite';
import { getErrorMessage } from '../store/api/baseApi';

export interface UseTerminalsOptions {
  /** Override del sitio global. Si es `undefined`, usa el global de Redux. */
  siteId?: string;
}

export const useTerminals = (options: UseTerminalsOptions = {}) => {
  const globalSiteId = useSelectedSiteId();
  const effectiveSiteId = options.siteId !== undefined ? options.siteId : (globalSiteId ?? undefined);

  const queryParams = useMemo(
    () => (effectiveSiteId ? { siteId: effectiveSiteId } : undefined),
    [effectiveSiteId]
  );

  const { data, isLoading, error, refetch } = useListTerminalsQuery(queryParams);

  return {
    terminals: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar terminales'),
    refreshTerminals: refetch,
    siteId: effectiveSiteId,
  };
};
