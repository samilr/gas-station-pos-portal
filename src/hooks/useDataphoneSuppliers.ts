import { useCallback, useEffect, useState } from 'react';
import dataphoneSupplierService, { DataphoneSupplier } from '../services/dataphoneSupplierService';

export function useDataphoneSuppliers() {
  const [suppliers, setSuppliers] = useState<DataphoneSupplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataphoneSupplierService.list();
      if (res.successful) setSuppliers(res.data);
      else setError(res.error || 'Error al cargar proveedores');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { suppliers, loading, error, refresh };
}

export default useDataphoneSuppliers;
