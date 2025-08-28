import { useState, useEffect, useCallback } from 'react';
import { hostService, IHost } from '../services/deviceService';

export const useDevices = () => {
  const [devices, setDevices] = useState<IHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hostService.getHosts();
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

