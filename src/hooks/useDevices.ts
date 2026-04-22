import { useListDevicesQuery } from '../store/api/devicesApi';
import { getErrorMessage } from '../store/api/baseApi';

export const useDevices = () => {
  const { data, isLoading, error, refetch } = useListDevicesQuery();

  return {
    devices: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar dispositivos'),
    refreshDevices: refetch,
  };
};
