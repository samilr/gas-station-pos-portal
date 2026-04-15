import { useCallback, useEffect, useState } from 'react';
import { taxService } from '../services/taxService';
import { ITaxLine } from '../types/tax';

export function useTaxLines(taxId?: string) {
  const [taxLines, setTaxLines] = useState<ITaxLine[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!taxId) {
      setTaxLines([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await taxService.getTaxLines(taxId);
      if (res.successful) setTaxLines(Array.isArray(res.data) ? res.data : []);
      else setError(res.error || 'Error al cargar líneas de impuesto');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [taxId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { taxLines, loading, error, refresh };
}

export default useTaxLines;
