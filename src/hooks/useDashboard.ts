import { useCallback, useMemo, useState } from 'react';
import { getCurrentSantoDomingoDate } from '../utils/transactionUtils';
import { ITransactionResume, ITopProduct } from '../types/transaction';
import { useSelectedSiteId } from './useSelectedSite';
import {
  useGetSalesAndReturnsSummaryQuery,
  useGetTopTransactionsQuery,
  useGetTransactionsQuery,
  useGetTopProductsQuery,
  useGetDailySalesQuery,
  useGetSalesBySiteQuery,
} from '../store/api/transactionsApi';
import { getErrorMessage } from '../store/api/baseApi';

export interface DashboardStats {
  totalTransactions: number;
  totalSales: number;
  totalReturns: number;
  totalFuelSales: number;
  totalStoreSales: number;
  salesByVendor: Array<{
    staftId: string;
    staftName: string;
    totalSales: number;
    transactionCount: number;
  }>;
  loading: boolean;
  error: string | null;
}

export interface DailySalesData {
  date: string;
  sales: number;
  transactions: number;
}

export interface ChartFilters {
  startDate: string;
  endDate: string;
  period: 'currentMonth' | 'lastMonth' | 'custom';
}

export interface SiteChartFilters {
  startDate: string;
  endDate: string;
  period: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';
}

export interface SiteSalesData {
  siteId: string;
  siteName: string;
  totalSales: number;
  transactionCount: number;
  averageTicket: number;
}

export interface CfTypeData {
  cfType: string;
  cfTypeName: string;
  sales: number;
  count: number;
  percentage: number;
}

const CF_TYPE_NAMES: Record<string, string> = {
  '31': 'Factura de Crédito Fiscal',
  '32': 'Factura de Consumo',
  '34': 'Factura de Exportación',
  '44': 'Factura de Régimen Especial',
  '45': 'Factura Gubernamental',
};

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSantoDomingoDate = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return new Date(parseInt(year!), parseInt(month!) - 1, parseInt(day!));
};

const computeChartDates = (filters: ChartFilters): { startDate: string; endDate: string } => {
  const today = getSantoDomingoDate();
  if (filters.period === 'currentMonth') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startDate: formatDateLocal(first), endDate: formatDateLocal(last) };
  }
  if (filters.period === 'lastMonth') {
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const last = new Date(today.getFullYear(), today.getMonth(), 0);
    return { startDate: formatDateLocal(first), endDate: formatDateLocal(last) };
  }
  return { startDate: filters.startDate, endDate: filters.endDate };
};

const computeSiteDates = (filters: SiteChartFilters): { startDate: string; endDate: string } => {
  const today = getSantoDomingoDate();
  switch (filters.period) {
    case 'today':
      return { startDate: formatDateLocal(today), endDate: formatDateLocal(today) };
    case 'yesterday': {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return { startDate: formatDateLocal(d), endDate: formatDateLocal(d) };
    }
    case 'thisWeek': {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { startDate: formatDateLocal(start), endDate: formatDateLocal(end) };
    }
    case 'lastWeek': {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() - 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { startDate: formatDateLocal(start), endDate: formatDateLocal(end) };
    }
    case 'thisMonth': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { startDate: formatDateLocal(first), endDate: formatDateLocal(last) };
    }
    case 'lastMonth': {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: formatDateLocal(first), endDate: formatDateLocal(last) };
    }
    case 'custom':
      return { startDate: filters.startDate, endDate: filters.endDate };
    default:
      return { startDate: formatDateLocal(today), endDate: formatDateLocal(today) };
  }
};

export const useDashboard = () => {
  const globalSiteId = useSelectedSiteId();
  const siteIdParam = globalSiteId ?? undefined;
  const todayDate = getCurrentSantoDomingoDate();

  const [chartFilters, setChartFilters] = useState<ChartFilters>({
    startDate: '',
    endDate: '',
    period: 'currentMonth',
  });

  const [siteChartFilters, setSiteChartFilters] = useState<SiteChartFilters>({
    startDate: '',
    endDate: '',
    period: 'today',
  });

  // Core queries (cache automática por siteId + fecha).
  const summaryQ = useGetSalesAndReturnsSummaryQuery({ startDate: todayDate, siteId: siteIdParam });
  const topTransactionsQ = useGetTopTransactionsQuery({ startDate: todayDate, limit: 5, siteId: siteIdParam });
  const allTransQ = useGetTransactionsQuery({
    startDate: todayDate,
    endDate: todayDate,
    limit: 100,
    siteId: siteIdParam,
  });
  const topProductsQ = useGetTopProductsQuery({ startDate: todayDate, limit: 10, siteId: siteIdParam });

  const chartDates = useMemo(() => computeChartDates(chartFilters), [chartFilters]);
  const dailySalesQ = useGetDailySalesQuery(
    { startDate: chartDates.startDate, siteId: siteIdParam },
    { skip: !chartDates.startDate }
  );

  const siteChartDates = useMemo(() => computeSiteDates(siteChartFilters), [siteChartFilters]);
  const salesBySiteQ = useGetSalesBySiteQuery(
    { startDate: siteChartDates.startDate, siteId: siteIdParam },
    { skip: !siteChartDates.startDate }
  );

  // Derivar stats combinados.
  const stats: DashboardStats = useMemo(() => {
    const summary = summaryQ.data;
    const allTrans = allTransQ.data?.data ?? [];

    const fuelSales = allTrans.filter((t) => t.prods?.[0]?.categoryId === 'COMB');
    const storeSales = allTrans.filter((t) => {
      if (t.prods?.[0]?.categoryId === 'COMB') return false;
      if (t.zataca) return false;
      return true;
    });

    const totalFuelSales = fuelSales.reduce((sum, t) => sum + (t.total || 0), 0);
    const totalStoreSales = storeSales.reduce((sum, t) => sum + (t.total || 0), 0);

    const vendorMap = new Map<string, { staftName: string; totalSales: number; transactionCount: number }>();
    allTrans.filter((t) => (t.total || 0) > 0).forEach((t) => {
      const staftId = t.staftId?.toString() || 'N/A';
      const staftName = t.staftName || 'Vendedor Desconocido';
      const existing = vendorMap.get(staftId);
      if (existing) {
        existing.totalSales += t.total || 0;
        existing.transactionCount += 1;
      } else {
        vendorMap.set(staftId, { staftName, totalSales: t.total || 0, transactionCount: 1 });
      }
    });

    const salesByVendor = Array.from(vendorMap.entries())
      .map(([staftId, d]) => ({ staftId, ...d }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    return {
      totalTransactions: (summary?.countSales ?? 0) + (summary?.countReturns ?? 0),
      totalSales: summary?.totalSales ?? 0,
      totalReturns: summary?.totalReturn ?? 0,
      totalFuelSales,
      totalStoreSales,
      salesByVendor,
      loading: summaryQ.isLoading || allTransQ.isLoading,
      error: getErrorMessage(summaryQ.error ?? allTransQ.error, 'Error al cargar los datos del dashboard'),
    };
  }, [summaryQ.data, summaryQ.isLoading, summaryQ.error, allTransQ.data, allTransQ.isLoading, allTransQ.error]);

  const recentTransactions: ITransactionResume[] = useMemo(() => {
    const list = topTransactionsQ.data ?? [];
    return list.map((t) => ({
      categoryId: '',
      transNumber: t.transNumber,
      cfNumber: t.cfNumber,
      returnCfNumber: '',
      returnTransNUmber: '',
      cfValidity: '',
      cfType: '',
      transDate: t.date,
      siteId: t.siteId,
      siteName: t.siteName,
      shift: 0,
      terminalId: 0,
      status: 1,
      cfStatus: 0,
      isReturn: t.transType === 2,
      subtotal: t.total,
      tax: 0,
      total: t.total,
      taxpayerName: t.taxpayerName,
      taxpayerId: t.taxpayerId,
      staftId: 0,
      staftName: '',
      cfQr: null,
      cfSecurityCode: null,
      digitalSignatureDate: null,
      prods: [],
      payms: [],
      zataca: undefined,
    }));
  }, [topTransactionsQ.data]);

  const allTransactions: ITransactionResume[] = allTransQ.data?.data ?? [];
  const topProducts: ITopProduct[] = topProductsQ.data ?? [];

  const cfTypeData: CfTypeData[] = useMemo(() => {
    if (allTransactions.length === 0) return [];
    const map = new Map<string, { sales: number; count: number }>();
    allTransactions.forEach((t) => {
      const cf = t.cfType || '31';
      const existing = map.get(cf);
      if (existing) {
        existing.sales += t.total || 0;
        existing.count += 1;
      } else {
        map.set(cf, { sales: t.total || 0, count: 1 });
      }
    });
    const totalSales = Array.from(map.values()).reduce((sum, d) => sum + d.sales, 0);
    return Array.from(map.entries())
      .map(([cfType, d]) => ({
        cfType,
        cfTypeName: CF_TYPE_NAMES[cfType] || `Tipo ${cfType}`,
        sales: d.sales,
        count: d.count,
        percentage: totalSales > 0 ? (d.sales / totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [allTransactions]);

  const dailySales: DailySalesData[] = useMemo(() => {
    const rows = dailySalesQ.data ?? [];
    return rows
      .map((r) => ({ date: r.dayOfMonth, sales: r.totalSales, transactions: 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dailySalesQ.data]);

  const siteSales: SiteSalesData[] = useMemo(() => {
    const rows = salesBySiteQ.data ?? [];
    return rows
      .map((r) => ({
        siteId: r.siteId,
        siteName: r.siteName,
        totalSales: r.total,
        transactionCount: 0,
        averageTicket: 0,
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [salesBySiteQ.data]);

  const refresh = useCallback(async () => {
    await Promise.all([
      summaryQ.refetch(),
      topTransactionsQ.refetch(),
      allTransQ.refetch(),
      topProductsQ.refetch(),
    ]);
  }, [summaryQ, topTransactionsQ, allTransQ, topProductsQ]);

  const updateChartFilters = useCallback((patch: Partial<ChartFilters>) => {
    setChartFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const refreshChartData = useCallback(() => {
    dailySalesQ.refetch();
  }, [dailySalesQ]);

  const loadChartData = useCallback(
    (patch?: Partial<ChartFilters>) => {
      if (patch) updateChartFilters(patch);
      else dailySalesQ.refetch();
    },
    [updateChartFilters, dailySalesQ]
  );

  const updateSiteChartFilters = useCallback((patch: Partial<SiteChartFilters>) => {
    setSiteChartFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const refreshSiteData = useCallback(() => {
    salesBySiteQ.refetch();
  }, [salesBySiteQ]);

  const loadSiteSalesData = useCallback(
    (patch?: Partial<SiteChartFilters>) => {
      if (patch) updateSiteChartFilters(patch);
      else salesBySiteQ.refetch();
    },
    [updateSiteChartFilters, salesBySiteQ]
  );

  const getChartStats = useMemo(() => {
    if (dailySales.length === 0) {
      return { bestDay: null, worstDay: null, averageDaily: 0, totalPeriod: 0, trend: 'neutral' as const };
    }
    const bestDay = dailySales.reduce((m, i) => (i.sales > m.sales ? i : m));
    const worstDay = dailySales.reduce((m, i) => (i.sales < m.sales ? i : m));
    const salesValues = dailySales.map((i) => i.sales);
    const totalPeriod = salesValues.reduce((s, v) => s + v, 0);
    const averageDaily = totalPeriod / salesValues.length;
    const mid = Math.floor(salesValues.length / 2);
    const first = salesValues.slice(0, mid).reduce((s, v) => s + v, 0) / Math.max(mid, 1);
    const second =
      salesValues.slice(mid).reduce((s, v) => s + v, 0) / Math.max(salesValues.length - mid, 1);
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (second > first * 1.1) trend = 'up';
    else if (second < first * 0.9) trend = 'down';
    return { bestDay, worstDay, averageDaily, totalPeriod, trend };
  }, [dailySales]);

  const getSiteStats = useMemo(() => {
    if (siteSales.length === 0) {
      return { topSite: null, bottomSite: null, totalSites: 0, totalSales: 0, averageSiteSales: 0 };
    }
    const topSite = siteSales[0];
    const bottomSite = siteSales[siteSales.length - 1];
    const totalSales = siteSales.reduce((s, x) => s + x.totalSales, 0);
    return {
      topSite,
      bottomSite,
      totalSites: siteSales.length,
      totalSales,
      averageSiteSales: totalSales / siteSales.length,
    };
  }, [siteSales]);

  return {
    ...stats,
    dailySales,
    chartLoading: dailySalesQ.isLoading,
    chartError: getErrorMessage(dailySalesQ.error, 'Error al cargar los datos del gráfico'),
    chartFilters,
    siteSales,
    siteLoading: salesBySiteQ.isLoading,
    siteError: getErrorMessage(salesBySiteQ.error, 'Error al cargar los datos de ventas por sucursal'),
    siteChartFilters,
    cfTypeData,
    recentTransactions,
    allTransactions,
    topProducts,
    refresh,
    loadChartData,
    updateChartFilters,
    refreshChartData,
    getChartStats,
    loadSiteSalesData,
    refreshSiteData,
    updateSiteChartFilters,
    getSiteStats,
  };
};
