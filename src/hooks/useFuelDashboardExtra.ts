import { FuelDashboardFilters } from '../services/fuelTransactionService';
import {
  useGetFuelPaymentMethodsQuery,
  useGetFuelByStaftQuery,
  useGetFuelByStaftByDayQuery,
  useGetFuelPeriodComparisonQuery,
  useGetFuelHeatmapQuery,
  useGetFuelByShiftQuery,
} from '../store/api/fuelDashboardExtraApi';

/**
 * Hook unificador para los 6 endpoints nuevos de dashboard fuel-based.
 * Recibe los filtros controlados externamente — no maneja state propio.
 * Las 6 queries se disparan en paralelo cuando cambian los filtros.
 *
 * Cada sección expone su propio `data`, `isLoading`, `isFetching`, `error`,
 * `refetch` para que el consumidor pueda renderizar skeleton/retry independiente.
 */
export function useFuelDashboardExtra(filters: FuelDashboardFilters) {
  const paymentMethods = useGetFuelPaymentMethodsQuery(filters);
  const byStaft = useGetFuelByStaftQuery(filters);
  const byStaftByDay = useGetFuelByStaftByDayQuery(filters);
  const periodComparison = useGetFuelPeriodComparisonQuery(filters);
  const heatmap = useGetFuelHeatmapQuery(filters);
  const byShift = useGetFuelByShiftQuery(filters);

  return {
    paymentMethods,
    byStaft,
    byStaftByDay,
    periodComparison,
    heatmap,
    byShift,
  };
}

export default useFuelDashboardExtra;
