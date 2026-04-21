import { useCallback, useEffect, useState } from 'react';
import fuelIslandService, { FuelIsland } from '../services/fuelIslandService';

export function useFuelIslands(initialFilters?: { siteId?: string }) {
  const [fuelIslands, setFuelIslands] = useState<FuelIsland[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ siteId?: string }>(initialFilters || {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fuelIslandService.list(filters);
      if (res.successful) {
        setFuelIslands(res.data);
      } else {
        setError(res.error || 'Error al cargar fuel islands');
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

  return { fuelIslands, loading, error, refresh, filters, setFilters };
}

export default useFuelIslands;
