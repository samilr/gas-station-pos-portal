import { useCallback, useEffect, useState } from 'react';
import dispensersConfigService, { Dispenser } from '../services/dispensersConfigService';

export function useDispensersConfig(initialFilters?: { siteId?: string; ptsId?: string }) {
  const [dispensers, setDispensers] = useState<Dispenser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ siteId?: string; ptsId?: string }>(initialFilters || {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dispensersConfigService.list(filters);
      if (res.successful) {
        setDispensers(res.data);
      } else {
        setError(res.error || 'Error al cargar dispensadoras');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { dispensers, loading, error, refresh, filters, setFilters };
}

export default useDispensersConfig;
