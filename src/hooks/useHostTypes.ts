import { useState, useEffect, useCallback } from 'react';
import { hostTypeService, IHostType } from '../services/hostTypeService';

export const useHostTypes = () => {
  const [hostTypes, setHostTypes] = useState<IHostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHostTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hostTypeService.getHostTypes();
      if (response.successful) {
        setHostTypes(response.data || []);
      } else {
        setError('Error al cargar tipos de dispositivo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tipos de dispositivo');
      console.warn('Error cargando tipos de dispositivo:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHostTypes = useCallback(async () => {
    await loadHostTypes();
  }, [loadHostTypes]);

  useEffect(() => {
    loadHostTypes();
  }, [loadHostTypes]);

  return {
    hostTypes,
    loading,
    error,
    refreshHostTypes,
  };
};
