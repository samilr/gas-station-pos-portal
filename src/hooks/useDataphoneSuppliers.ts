import { useListDataphoneSuppliersQuery } from '../store/api/dataphoneSuppliersApi';
import { getErrorMessage } from '../store/api/baseApi';

export function useDataphoneSuppliers() {
  const { data, isLoading, error, refetch } = useListDataphoneSuppliersQuery();

  return {
    suppliers: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar proveedores'),
    refresh: refetch,
  };
}

export default useDataphoneSuppliers;
