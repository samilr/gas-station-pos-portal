import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import fuelTransactionService, {
  FuelDashboardFilters,
  FuelSummary,
  FuelDailyTrendRow,
  FuelByPumpRow,
  FuelByFuelGradeRow,
  FuelHourlyRow,
  FuelTopTransactionRow,
} from '../services/fuelTransactionService';

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
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function rangeFor(period: FuelRangePeriod): { startDate: string; endDate: string } {
  const today = new Date();
  const end = toIsoDate(today);
  if (period === 'today') return { startDate: end, endDate: end };
  if (period === '7d') {
    const s = new Date(today);
    s.setUTCDate(s.getUTCDate() - 6);
    return { startDate: toIsoDate(s), endDate: end };
  }
  if (period === '30d') {
    const s = new Date(today);
    s.setUTCDate(s.getUTCDate() - 29);
    return { startDate: toIsoDate(s), endDate: end };
  }
  return { startDate: end, endDate: end };
}

export function useFuelDashboard(options: UseFuelDashboardOptions = {}) {
  const {
    initialPeriod = 'today',
    siteId = null,
    excludeOffline = true,
    topLimit = 10,
    enabled = ALL_ENABLED,
    autoLoad = true,
  } = options;

  const [period, setPeriod] = useState<FuelRangePeriod>(initialPeriod);
  const [filters, setFiltersState] = useState<FuelDashboardFilters>(() => ({
    ...rangeFor(initialPeriod),
    siteId,
    excludeOffline,
  }));

  const [summary, setSummary] = useState<FuelSummary | null>(null);
  const [dailyTrend, setDailyTrend] = useState<FuelDailyTrendRow[]>([]);
  const [byPump, setByPump] = useState<FuelByPumpRow[]>([]);
  const [byFuelGrade, setByFuelGrade] = useState<FuelByFuelGradeRow[]>([]);
  const [hourly, setHourly] = useState<FuelHourlyRow[]>([]);
  const [top, setTop] = useState<FuelTopTransactionRow[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

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
    setLoading(true);
    setError(null);
    try {
      const e = enabledRef.current;
      const tasks: Array<Promise<void>> = [];
      if (e.summary) tasks.push(fuelTransactionService.getDashboardSummary(filters).then(setSummary));
      if (e.dailyTrend) tasks.push(fuelTransactionService.getDashboardDailyTrend(filters).then(setDailyTrend));
      if (e.byPump) tasks.push(fuelTransactionService.getDashboardByPump(filters).then(setByPump));
      if (e.byFuelGrade) tasks.push(fuelTransactionService.getDashboardByFuelGrade(filters).then(setByFuelGrade));
      if (e.hourly) tasks.push(fuelTransactionService.getDashboardHourly(filters).then(setHourly));
      if (e.top) tasks.push(fuelTransactionService.getDashboardTopTransactions(filters, topLimit).then(setTop));
      await Promise.all(tasks);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar dashboard';
      setError(msg);
      console.error('[FuelDashboard]', err);
    } finally {
      setLoading(false);
    }
  }, [filters, topLimit]);

  useEffect(() => {
    if (autoLoad) refresh();
  }, [autoLoad, refresh]);

  return useMemo(
    () => ({
      period, filters, setRange, setFilters,
      summary, dailyTrend, byPump, byFuelGrade, hourly, top,
      loading, error, refresh,
    }),
    [period, filters, setRange, setFilters, summary, dailyTrend, byPump, byFuelGrade, hourly, top, loading, error, refresh],
  );
}

export default useFuelDashboard;
