import { useState, useEffect, useCallback } from 'react';
import { deviceService, IDevice } from '../services/deviceService';

export const useDevices = () => {
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await deviceService.getDevices();
      if (response.successful) {
        setDevices(response.data || []);
      } else {
        setError('Error al cargar dispositivos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar dispositivos');
      console.warn('Error cargando dispositivos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    await loadDevices();
  }, [loadDevices]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  return {
    devices,
    loading,
    error,
    refreshDevices
  };
};

