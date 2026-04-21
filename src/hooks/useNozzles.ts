import { useCallback, useEffect, useState } from 'react';
import nozzleService, { Nozzle } from '../services/nozzleService';

export function useNozzles(initialFilters?: { dispenserId?: number; productId?: string }, autoLoad: boolean = true) {
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ dispenserId?: number; productId?: string }>(initialFilters || {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await nozzleService.list(filters);
      if (res.successful) {
        setNozzles(res.data);
      } else {
        setError(res.error || 'Error al cargar nozzles');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoLoad) refresh();
  }, [refresh, autoLoad]);

  return { nozzles, loading, error, refresh, filters, setFilters };
}

export default useNozzles;
