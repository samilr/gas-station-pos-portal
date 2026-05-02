import { useCallback, useMemo, useState } from 'react';
import {
  FuelDashboardFilters,
  FuelSummary,
  FuelDailyTrendRow,
  FuelByPumpRow,
  FuelByFuelGradeRow,
  FuelHourlyRow,
  FuelTopTransactionRow,
} from '../services/fuelTransactionService';
import {
  useGetFuelSummaryQuery,
  useGetFuelDailyTrendQuery,
  useGetFuelByPumpQuery,
  useGetFuelByGradeQuery,
  useGetFuelHourlyQuery,
  useGetFuelTopTransactionsQuery,
} from '../store/api/fuelDashboardApi';
import { useSelectedSiteId } from './useSelectedSite';
import { getErrorMessage } from '../store/api/baseApi';

export type FuelRangePeriod = 'today' | '7d' | '30d' | 'custom';

export interface UseFuelDashboardOptions {
  initialPeriod?: FuelRangePeriod;
  siteId?: string | null;
  excludeOffline?: boolean;
  topLimit?: number;
  enabled?: {
    summary?: boolean;
    dailyTrend?: boolean;
    byPump?: boolean;
    byFuelGrade?: boolean;
    hourly?: boolean;
    top?: boolean;
  };
  autoLoad?: boolean;
}

const ALL_ENABLED = {
  summary: true,
  dailyTrend: true,
  byPump: true,
  byFuelGrade: true,
  hourly: true,
  top: true,
};

function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function rangeFor(period: FuelRangePeriod): { startDate: string; endDate: string } {
  const today = new Date();
  const end = toIsoDate(today);
  if (period === 'today') return { startDate: end, endDate: end };
  if (period === '7d') {
    const s = new Date(today);
    s.setDate(s.getDate() - 6);
    return { startDate: toIsoDate(s), endDate: end };
  }
  if (period === '30d') {
    const s = new Date(today);
    s.setDate(s.getDate() - 29);
    return { startDate: toIsoDate(s), endDate: end };
  }
  return { startDate: end, endDate: end };
}

export function useFuelDashboard(options: UseFuelDashboardOptions = {}) {
  const {
    initialPeriod = 'today',
    siteId: overrideSiteId,
    excludeOffline = true,
    topLimit = 10,
    enabled = ALL_ENABLED,
    autoLoad = true,
  } = options;

  const globalSiteId = useSelectedSiteId();
  const effectiveSiteId = overrideSiteId !== undefined ? overrideSiteId : globalSiteId;

  const [period, setPeriod] = useState<FuelRangePeriod>(initialPeriod);
  const [localFilters, setFiltersState] = useState<FuelDashboardFilters>(() => ({
    ...rangeFor(initialPeriod),
    siteId: null,
    excludeOffline,
  }));

  const filters = useMemo<FuelDashboardFilters>(
    () => ({ ...localFilters, siteId: effectiveSiteId ?? null }),
    [localFilters, effectiveSiteId]
  );

  const skip = !autoLoad;

  const summaryQuery = useGetFuelSummaryQuery(filters, { skip: skip || !enabled.summary });
  const dailyTrendQuery = useGetFuelDailyTrendQuery(filters, { skip: skip || !enabled.dailyTrend });
  const byPumpQuery = useGetFuelByPumpQuery(filters, { skip: skip || !enabled.byPump });
  const byGradeQuery = useGetFuelByGradeQuery(filters, { skip: skip || !enabled.byFuelGrade });
  const hourlyQuery = useGetFuelHourlyQuery(filters, { skip: skip || !enabled.hourly });
  const topQuery = useGetFuelTopTransactionsQuery(
    { filters, limit: topLimit },
    { skip: skip || !enabled.top }
  );

  const setRange = useCallback((p: FuelRangePeriod, customStart?: string, customEnd?: string) => {
    setPeriod(p);
    if (p === 'custom' && customStart && customEnd) {
      setFiltersState((f) => ({ ...f, startDate: customStart, endDate: customEnd }));
    } else {
      const r = rangeFor(p);
      setFiltersState((f) => ({ ...f, ...r }));
    }
  }, []);

  const setFilters = useCallback((patch: Partial<FuelDashboardFilters>) => {
    setFiltersState((f) => ({ ...f, ...patch }));
  }, []);

  const refresh = useCallback(async () => {
    const refetches: Promise<unknown>[] = [];
    if (enabled.summary) refetches.push(summaryQuery.refetch());
    if (enabled.dailyTrend) refetches.push(dailyTrendQuery.refetch());
    if (enabled.byPump) refetches.push(byPumpQuery.refetch());
    if (enabled.byFuelGrade) refetches.push(byGradeQuery.refetch());
    if (enabled.hourly) refetches.push(hourlyQuery.refetch());
    if (enabled.top) refetches.push(topQuery.refetch());
    await Promise.all(refetches);
  }, [
    enabled.summary,
    enabled.dailyTrend,
    enabled.byPump,
    enabled.byFuelGrade,
    enabled.hourly,
    enabled.top,
    summaryQuery,
    dailyTrendQuery,
    byPumpQuery,
    byGradeQuery,
    hourlyQuery,
    topQuery,
  ]);

  const loading =
    summaryQuery.isLoading ||
    dailyTrendQuery.isLoading ||
    byPumpQuery.isLoading ||
    byGradeQuery.isLoading ||
    hourlyQuery.isLoading ||
    topQuery.isLoading;

  const firstError =
    summaryQuery.error ??
    dailyTrendQuery.error ??
    byPumpQuery.error ??
    byGradeQuery.error ??
    hourlyQuery.error ??
    topQuery.error;

  return {
    period,
    filters,
    setRange,
    setFilters,
    summary: summaryQuery.data ?? (null as FuelSummary | null),
    dailyTrend: dailyTrendQuery.data ?? ([] as FuelDailyTrendRow[]),
    byPump: byPumpQuery.data ?? ([] as FuelByPumpRow[]),
    byFuelGrade: byGradeQuery.data ?? ([] as FuelByFuelGradeRow[]),
    hourly: hourlyQuery.data ?? ([] as FuelHourlyRow[]),
    top: topQuery.data ?? ([] as FuelTopTransactionRow[]),
    loading,
    error: getErrorMessage(firstError, 'Error al cargar dashboard'),
    refresh,
  };
}

export default useFuelDashboard;
