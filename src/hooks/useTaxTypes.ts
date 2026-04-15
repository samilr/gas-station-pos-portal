import { useCallback, useEffect, useState } from 'react';
import { taxService } from '../services/taxService';
import { ITaxType } from '../types/tax';

export function useTaxTypes() {
  const [taxTypes, setTaxTypes] = useState<ITaxType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await taxService.getTaxTypes();
      if (res.successful) setTaxTypes(Array.isArray(res.data) ? res.data : []);
      else setError(res.error || 'Error al cargar tax types');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { taxTypes, loading, error, refresh };
}

export default useTaxTypes;
