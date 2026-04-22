import { useListHostTypesQuery } from '../store/api/hostTypesApi';
import { getErrorMessage } from '../store/api/baseApi';

export const useHostTypes = () => {
  const { data, isLoading, error, refetch } = useListHostTypesQuery();

  return {
    hostTypes: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar tipos de dispositivo'),
    refreshHostTypes: refetch,
  };
};
