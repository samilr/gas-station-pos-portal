import { useListTaxLinesQuery } from '../store/api/taxesApi';
import { getErrorMessage } from '../store/api/baseApi';

export function useTaxLines(taxId?: string) {
  const { data, isLoading, error, refetch } = useListTaxLinesQuery(taxId ?? '', {
    skip: !taxId,
  });

  return {
    taxLines: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar líneas de impuesto'),
    refresh: refetch,
  };
}

export default useTaxLines;
