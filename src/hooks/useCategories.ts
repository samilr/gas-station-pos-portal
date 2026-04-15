import { useCallback, useEffect, useState } from 'react';
import categoryService, { Category } from '../services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.list();
      if (res.successful) setCategories(res.data);
      else setError(res.error || 'Error al cargar categorías');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { categories, loading, error, refresh };
}

export default useCategories;
