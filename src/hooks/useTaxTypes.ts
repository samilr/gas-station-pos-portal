import { useListTaxTypesQuery } from '../store/api/taxesApi';
import { getErrorMessage } from '../store/api/baseApi';

export function useTaxTypes() {
  const { data, isLoading, error, refetch } = useListTaxTypesQuery();

  return {
    taxTypes: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar tax types'),
    refresh: refetch,
  };
}

export default useTaxTypes;
