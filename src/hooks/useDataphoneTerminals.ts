import { useCallback, useEffect, useState } from 'react';
import dataphoneTerminalService, { DataphoneTerminal } from '../services/dataphoneTerminalService';

export function useDataphoneTerminals(initialFilters?: { siteId?: string }) {
  const [terminals, setTerminals] = useState<DataphoneTerminal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ siteId?: string }>(initialFilters || {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataphoneTerminalService.list(filters);
      if (res.successful) setTerminals(res.data);
      else setError(res.error || 'Error al cargar mapeo dataphone-terminal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { refresh(); }, [refresh]);

  return { terminals, loading, error, refresh, filters, setFilters };
}

export default useDataphoneTerminals;
