import { useState } from 'react';
import { useListNozzlesQuery } from '../store/api/nozzlesApi';
import { getErrorMessage } from '../store/api/baseApi';

type NozzleFilters = { dispenserId?: number; productId?: string };

export function useNozzles(initialFilters?: NozzleFilters, autoLoad: boolean = true) {
  const [filters, setFilters] = useState<NozzleFilters>(initialFilters || {});

  const { data, isLoading, error, refetch } = useListNozzlesQuery(filters, {
    skip: !autoLoad,
  });

  return {
    nozzles: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar nozzles'),
    refresh: refetch,
    filters,
    setFilters,
  };
}

export default useNozzles;
