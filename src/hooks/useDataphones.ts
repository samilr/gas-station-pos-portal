import { useCallback, useEffect, useState } from 'react';
import dataphoneService, { Dataphone } from '../services/dataphoneService';

export function useDataphones(initialFilters?: { siteId?: string }) {
  const [dataphones, setDataphones] = useState<Dataphone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ siteId?: string }>(initialFilters || {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataphoneService.list(filters);
      if (res.successful) setDataphones(res.data);
      else setError(res.error || 'Error al cargar dataphones');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { refresh(); }, [refresh]);

  return { dataphones, loading, error, refresh, filters, setFilters };
}

export default useDataphones;
