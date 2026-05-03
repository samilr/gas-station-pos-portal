import { api } from './baseApi';
import { FuelDashboardFilters } from '../../services/fuelTransactionService';
import {
  PaymentMethodRow,
  ByStaftRow,
  ByStaftByDayRow,
  PeriodComparisonResult,
  HeatmapCell,
  ByShiftRow,
} from '../../services/fuelDashboardExtraTypes';

const buildQuery = (filters?: FuelDashboardFilters): string => {
  const qs = new URLSearchParams();
  if (filters?.startDate) qs.append('startDate', filters.startDate);
  if (filters?.endDate) qs.append('endDate', filters.endDate);
  if (filters?.siteId) qs.append('siteId', filters.siteId);
  if (filters?.excludeOffline !== undefined) {
    qs.append('excludeOffline', String(filters.excludeOffline));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
};

const unwrapData = <T>(response: unknown): T => {
  const body = response as { data?: T } | T;
  if (body && typeof body === 'object' && 'data' in (body as object)) {
    return (body as { data: T }).data;
  }
  return body as T;
};

export const fuelDashboardExtraApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFuelPaymentMethods: build.query<PaymentMethodRow[], FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/payment-methods${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<PaymentMethodRow[]>,
    }),
    getFuelByStaft: build.query<ByStaftRow[], FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/by-staft${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<ByStaftRow[]>,
    }),
    getFuelByStaftByDay: build.query<ByStaftByDayRow[], FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/by-staft-by-day${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<ByStaftByDayRow[]>,
    }),
    getFuelPeriodComparison: build.query<PeriodComparisonResult, FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/period-comparison${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<PeriodComparisonResult>,
    }),
    getFuelHeatmap: build.query<HeatmapCell[], FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/heatmap${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<HeatmapCell[]>,
    }),
    getFuelByShift: build.query<ByShiftRow[], FuelDashboardFilters | void>({
      query: (filters) => `fuel-transactions/dashboard/by-shift${buildQuery(filters || undefined)}`,
      transformResponse: unwrapData<ByShiftRow[]>,
    }),
  }),
});

export const {
  useGetFuelPaymentMethodsQuery,
  useGetFuelByStaftQuery,
  useGetFuelByStaftByDayQuery,
  useGetFuelPeriodComparisonQuery,
  useGetFuelHeatmapQuery,
  useGetFuelByShiftQuery,
} = fuelDashboardExtraApi;
