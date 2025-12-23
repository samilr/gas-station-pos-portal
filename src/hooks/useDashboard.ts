import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services/transactionService';
import { getCurrentSantoDomingoDate } from '../utils/transactionUtils';
import { ITransactionResume, IDailySales, ITopTransaction, ITopProduct, ISalesBySite } from '../types/transaction';

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

export interface ChartData {
  dailySales: DailySalesData[];
  loading: boolean;
  error: string | null;
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

export interface SiteChartData {
  siteSales: SiteSalesData[];
  loading: boolean;
  error: string | null;
}

export interface CfTypeData {
  cfType: string;
  cfTypeName: string;
  sales: number;
  count: number;
  percentage: number;
}

export const useDashboard = () => {
  // Función helper para formatear fechas sin conversión UTC
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Función helper para obtener fecha actual en Santo Domingo
  const getSantoDomingoDate = () => {
    const now = new Date();
    // Usar Intl.DateTimeFormat para obtener fecha en Santo Domingo
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santo_Domingo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(now);
    const year = parts.find(part => part.type === 'year')?.value;
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;
    
    return new Date(parseInt(year!), parseInt(month!) - 1, parseInt(day!));
  };
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalSales: 0,
    totalReturns: 0,
    totalFuelSales: 0,
    totalStoreSales: 0,
    salesByVendor: [],
    loading: true,
    error: null
  });

  const [chartData, setChartData] = useState<ChartData>({
    dailySales: [],
    loading: false,
    error: null
  });

  const [chartFilters, setChartFilters] = useState<ChartFilters>({
    startDate: '',
    endDate: '',
    period: 'currentMonth'
  });

  const [siteChartFilters, setSiteChartFilters] = useState<SiteChartFilters>({
    startDate: '',
    endDate: '',
    period: 'today'
  });

  const [siteChartData, setSiteChartData] = useState<SiteChartData>({
    siteSales: [],
    loading: false,
    error: null
  });

  const [cfTypeData, setCfTypeData] = useState<CfTypeData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<ITransactionResume[]>([]);
  const [allTransactions, setAllTransactions] = useState<ITransactionResume[]>([]);
  const [topProducts, setTopProducts] = useState<ITopProduct[]>([]);

  const loadDashboardData = async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Obtener fecha de hoy en zona horaria de Santo Domingo
      const todayDate = getCurrentSantoDomingoDate();
      
      // Usar el nuevo endpoint del dashboard para obtener resumen de ventas y retornos
      const salesSummary = await transactionService.getSalesAndReturnsSummary(todayDate);
      
      // Obtener top transacciones
      const topTransactions = await transactionService.getTopTransactions(todayDate, 5);
      
      // Convertir topTransactions a ITransactionResume para compatibilidad
      const recentTrans: ITransactionResume[] = topTransactions.map(trans => ({
        categoryId: '',
        transNumber: trans.transNumber,
        cfNumber: trans.cfNumber,
        returnCfNumber: '',
        returnTransNUmber: '',
        cfValidity: '',
        cfType: '',
        transDate: trans.date,
        siteId: trans.siteId,
        siteName: trans.siteName,
        shift: 0,
        terminalId: 0,
        status: 1,
        cfStatus: 0,
        isReturn: trans.transType === 2,
        subtotal: trans.total,
        tax: 0,
        total: trans.total,
        taxpayerName: trans.taxpayerName,
        taxpayerId: trans.taxpayerId,
        staftId: 0,
        staftName: '',
        cfQr: null,
        cfSecurityCode: null,
        digitalSignatureDate: null,
        prods: [],
        payms: [],
        zataca: undefined
      }));

      // Calcular ventas por vendedor desde las transacciones recientes
      // (esto se puede mejorar cuando haya un endpoint específico)
      let salesByVendor: Array<{
        staftId: string;
        staftName: string;
        totalSales: number;
        transactionCount: number;
      }> = [];

      // Para totalFuelSales y totalStoreSales, necesitamos cargar las transacciones completas
      // o usar los datos del resumen. Por ahora, usamos valores del resumen
      const totalTransactions = salesSummary.countSales + salesSummary.countReturns;
      const totalSales = salesSummary.totalSales;
      const totalReturns = salesSummary.totalReturn;
      
      // Estos valores necesitarían endpoints adicionales o procesamiento local
      // Por ahora los dejamos en 0 o calculamos desde las transacciones recientes
      let totalFuelSales = 0;
      let totalStoreSales = 0;
      
      // Intentar obtener más datos si es necesario
      try {
        const transactionsResponse = await transactionService.getTransactions({
          startDate: todayDate,
          endDate: todayDate,
          limit: 100 // Obtener más transacciones para calcular fuel/store
        });
        
        if (transactionsResponse && transactionsResponse.data && transactionsResponse.data.length > 0) {
          const transactions = transactionsResponse.data;
          
          // Separar ventas de combustible y tienda
          const fuelSales = transactions.filter(transaction => {
            if (transaction.prods && transaction.prods.length > 0) {
              const firstProduct = transaction.prods[0];
              return firstProduct.categoryId === 'COMB';
            }
            return false;
          });
          
          const storeSales = transactions.filter(transaction => {
            if (transaction.prods && transaction.prods.length > 0) {
              const firstProduct = transaction.prods[0];
              if (firstProduct.categoryId === 'COMB') {
                return false;
              }
              if (transaction.zataca) {
                return false;
              }
            }
            return true;
          });
          
          totalFuelSales = fuelSales.reduce((sum, trans) => sum + (trans.total || 0), 0);
          totalStoreSales = storeSales.reduce((sum, trans) => sum + (trans.total || 0), 0);
          
          // Calcular ventas por vendedor
          const vendorSalesMap = new Map<string, { staftName: string; totalSales: number; transactionCount: number }>();
          
          transactions.filter(t => (t.total || 0) > 0).forEach(transaction => {
            const staftId = transaction.staftId?.toString() || 'N/A';
            const staftName = transaction.staftName || 'Vendedor Desconocido';
            const total = transaction.total || 0;
            
            if (vendorSalesMap.has(staftId)) {
              const existing = vendorSalesMap.get(staftId)!;
              existing.totalSales += total;
              existing.transactionCount += 1;
            } else {
              vendorSalesMap.set(staftId, {
                staftName,
                totalSales: total,
                transactionCount: 1
              });
            }
          });
          
          salesByVendor = Array.from(vendorSalesMap.entries())
            .map(([staftId, data]) => ({
              staftId,
              staftName: data.staftName,
              totalSales: data.totalSales,
              transactionCount: data.transactionCount
            }))
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 5);
          
          // Procesar datos por tipo de CF
          const cfData = getCfTypeData(transactions);
          setCfTypeData(cfData);
          
          // Guardar todas las transacciones para el gráfico de productos
          setAllTransactions(transactions);
        }
      } catch (err) {
        console.warn('No se pudieron cargar transacciones completas, usando solo resumen:', err);
      }
      
      // Cargar top productos usando el nuevo endpoint
      try {
        const topProductsData = await transactionService.getTopProducts(todayDate, undefined, 10);
        setTopProducts(topProductsData);
      } catch (err) {
        console.warn('No se pudieron cargar top productos:', err);
        setTopProducts([]);
      }

      setStats({
        totalTransactions,
        totalSales,
        totalReturns,
        totalFuelSales,
        totalStoreSales,
        salesByVendor,
        loading: false,
        error: null
      });

      // Actualizar transacciones recientes
      setRecentTransactions(recentTrans);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar los datos del dashboard'
      }));
    }
  };

  const loadChartData = useCallback(async (filters?: Partial<ChartFilters>) => {
    setChartData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let startDate: string;
      let endDate: string;
      
      if (filters) {
        // Usar filtros proporcionados
        startDate = filters.startDate || '';
        endDate = filters.endDate || '';
      } else {
        // Usar filtros del estado
        const currentFilters = chartFilters;
        
        if (currentFilters.period === 'currentMonth') {
          const santoDomingoDate = getSantoDomingoDate();
          const firstDay = new Date(santoDomingoDate.getFullYear(), santoDomingoDate.getMonth(), 1);
          const lastDay = new Date(santoDomingoDate.getFullYear(), santoDomingoDate.getMonth() + 1, 0);
          startDate = formatDateLocal(firstDay);
          endDate = formatDateLocal(lastDay);
        } else if (currentFilters.period === 'lastMonth') {
          const santoDomingoDate = getSantoDomingoDate();
          const firstDay = new Date(santoDomingoDate.getFullYear(), santoDomingoDate.getMonth() - 1, 1);
          const lastDay = new Date(santoDomingoDate.getFullYear(), santoDomingoDate.getMonth(), 0);
          startDate = formatDateLocal(firstDay);
          endDate = formatDateLocal(lastDay);
        } else {
          // custom
          startDate = currentFilters.startDate;
          endDate = currentFilters.endDate;
        }
      }
      
      console.log('📊 Cargando datos del gráfico para el mes:', { startDate, endDate });
      
      // Usar el nuevo endpoint del dashboard para obtener ventas diarias
      const dailySalesResponse = await transactionService.getDailySales(startDate);

      if (dailySalesResponse && dailySalesResponse.length > 0) {
        // Convertir IDailySales[] a DailySalesData[]
        const dailySales = dailySalesResponse.map(item => ({
          date: item.dayOfMonth,
          sales: item.totalSales,
          transactions: 0 // El endpoint no proporciona cantidad de transacciones, se puede calcular si es necesario
        })).sort((a, b) => a.date.localeCompare(b.date));
        
        console.log('📈 Datos del gráfico procesados:', dailySales);
        console.log('📊 Total de días con transacciones:', dailySales.length);
        
        setChartData({
          dailySales,
          loading: false,
          error: null
        });
      } else {
        setChartData({
          dailySales: [],
          loading: false,
          error: null
        });
      }
      
    } catch (error) {
      console.error('Error loading chart data:', error);
      setChartData(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar los datos del gráfico'
      }));
    }
  }, [chartFilters]); // Depende de chartFilters

  const updateChartFilters = useCallback((newFilters: Partial<ChartFilters>) => {
    setChartFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refreshChartData = useCallback(() => {
    loadChartData();
  }, [loadChartData]);

  const loadSiteSalesData = useCallback(async (filters?: Partial<SiteChartFilters>) => {
    setSiteChartData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let startDate: string;
      let endDate: string;
      
      if (filters) {
        startDate = filters.startDate || '';
        endDate = filters.endDate || '';
      } else {
        const currentFilters = siteChartFilters;
        const santoDomingoDate = getSantoDomingoDate();
        
        switch (currentFilters.period) {
          case 'today':
            startDate = formatDateLocal(santoDomingoDate);
            endDate = formatDateLocal(santoDomingoDate);
            break;
            
          case 'yesterday':
            const yesterday = new Date(santoDomingoDate);
            yesterday.setDate(yesterday.getDate() - 1);
            startDate = formatDateLocal(yesterday);
            endDate = formatDateLocal(yesterday);
            break;
            
          case 'thisWeek':
            const startOfWeek = new Date(santoDomingoDate);
            startOfWeek.setDate(santoDomingoDate.getDate() - santoDomingoDate.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            startDate = formatDateLocal(startOfWeek);
            endDate = formatDateLocal(endOfWeek);
            break;
            
          case 'lastWeek':
            const lastWeekStart = new Date(santoDomingoDate);
            lastWeekStart.setDate(santoDomingoDate.getDate() - santoDomingoDate.getDay() - 7);
            const lastWeekEnd = new Date(lastWeekStart);
            lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
            startDate = formatDateLocal(lastWeekStart);
            endDate = formatDateLocal(lastWeekEnd);
            break;
            
          case 'thisMonth':
            const firstDay = new Date(santoDomingoDate.getFullYear(), santoDomingoDate.getMonth(), 1);
            const lastDay = new Date(santoDomingoDate.getFullYear(), santoDomingoDate.getMonth() + 1, 0);
            startDate = formatDateLocal(firstDay);
            endDate = formatDateLocal(lastDay);
            break;
            
          case 'lastMonth':
            const firstDayLastMonth = new Date(santoDomingoDate.getFullYear(), santoDomingoDate.getMonth() - 1, 1);
            const lastDayLastMonth = new Date(santoDomingoDate.getFullYear(), santoDomingoDate.getMonth(), 0);
            startDate = formatDateLocal(firstDayLastMonth);
            endDate = formatDateLocal(lastDayLastMonth);
            break;
            
          case 'custom':
            startDate = currentFilters.startDate;
            endDate = currentFilters.endDate;
            break;
            
          default:
            startDate = formatDateLocal(santoDomingoDate);
            endDate = formatDateLocal(santoDomingoDate);
        }
      }
      
      console.log('🏢 Cargando datos de ventas por sucursal:', { startDate });
      
      // Usar el nuevo endpoint del dashboard para obtener ventas por sucursal
      const salesBySiteResponse = await transactionService.getSalesBySite(startDate);

      if (salesBySiteResponse && salesBySiteResponse.length > 0) {
        // Convertir ISalesBySite[] a SiteSalesData[]
        const siteSales = salesBySiteResponse.map(item => ({
          siteId: item.siteId,
          siteName: item.siteName,
          totalSales: item.total,
          transactionCount: 0, // El endpoint no proporciona cantidad, se puede calcular si es necesario
          averageTicket: 0 // Se puede calcular si tenemos transactionCount
        })).sort((a, b) => b.totalSales - a.totalSales);
        
        console.log('🏢 Datos de sucursales procesados:', siteSales);
        
        setSiteChartData({
          siteSales,
          loading: false,
          error: null
        });
      } else {
        setSiteChartData({
          siteSales: [],
          loading: false,
          error: null
        });
      }
      
    } catch (error) {
      console.error('Error loading site sales data:', error);
      setSiteChartData(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar los datos de ventas por sucursal'
      }));
    }
  }, [siteChartFilters]);

  // Calcular estadísticas adicionales del gráfico
  const getChartStats = useCallback(() => {
    if (chartData.dailySales.length === 0) {
    return {
      bestDay: null,
      worstDay: null,
      averageDaily: 0,
      totalPeriod: 0,
      trend: 'neutral' as const
    };
    }

    const sales = chartData.dailySales.map(item => item.sales);
    const bestDay = chartData.dailySales.reduce((max, item) => 
      item.sales > max.sales ? item : max
    );
    const worstDay = chartData.dailySales.reduce((min, item) => 
      item.sales < min.sales ? item : min
    );
    const totalPeriod = sales.reduce((sum, sale) => sum + sale, 0);
    const averageDaily = totalPeriod / sales.length;

    // Calcular tendencia (comparar primera mitad vs segunda mitad)
    const midPoint = Math.floor(sales.length / 2);
    const firstHalf = sales.slice(0, midPoint).reduce((sum, sale) => sum + sale, 0) / midPoint;
    const secondHalf = sales.slice(midPoint).reduce((sum, sale) => sum + sale, 0) / (sales.length - midPoint);
    
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (secondHalf > firstHalf * 1.1) trend = 'up';
    else if (secondHalf < firstHalf * 0.9) trend = 'down';

    return {
      bestDay,
      worstDay,
      averageDaily,
      totalPeriod,
      trend
    };
  }, [chartData.dailySales]);

  // Calcular estadísticas de sucursales
  const getSiteStats = useCallback(() => {
    if (siteChartData.siteSales.length === 0) {
      return {
        topSite: null,
        bottomSite: null,
        totalSites: 0,
        totalSales: 0,
        averageSiteSales: 0
      };
    }

    const topSite = siteChartData.siteSales[0]; // Ya está ordenado por ventas descendente
    const bottomSite = siteChartData.siteSales[siteChartData.siteSales.length - 1];
    const totalSales = siteChartData.siteSales.reduce((sum, site) => sum + site.totalSales, 0);
    const averageSiteSales = totalSales / siteChartData.siteSales.length;

    return {
      topSite,
      bottomSite,
      totalSites: siteChartData.siteSales.length,
      totalSales,
      averageSiteSales
    };
  }, [siteChartData.siteSales]);

  const refreshSiteData = useCallback(() => {
    loadSiteSalesData();
  }, [loadSiteSalesData]);

  const updateSiteChartFilters = useCallback((newFilters: Partial<SiteChartFilters>) => {
    setSiteChartFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Función para procesar datos por tipo de CF
  const getCfTypeData = useCallback((transactions: any[]): CfTypeData[] => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Mapeo de tipos de CF a nombres
    const cfTypeNames: { [key: string]: string } = {
      '31': 'Factura de Crédito Fiscal',
      '32': 'Factura de Consumo',
      '34': 'Factura de Exportación',
      '44': 'Factura de Régimen Especial',
      '45': 'Factura Gubernamental'
    };

    // Agrupar transacciones por tipo de CF
    const cfTypeMap = new Map<string, { sales: number; count: number }>();
    
    transactions.forEach(transaction => {
      const cfType = transaction.cfType || '31'; // Default a tipo 31 si no tiene cfType
      const total = transaction.total || 0;
      
      if (cfTypeMap.has(cfType)) {
        const existing = cfTypeMap.get(cfType)!;
        existing.sales += total;
        existing.count += 1;
      } else {
        cfTypeMap.set(cfType, {
          sales: total,
          count: 1
        });
      }
    });

    // Calcular total de ventas
    const totalSales = Array.from(cfTypeMap.values()).reduce((sum, data) => sum + data.sales, 0);

    // Convertir a array y calcular porcentajes
    const cfTypeData = Array.from(cfTypeMap.entries())
      .map(([cfType, data]) => ({
        cfType,
        cfTypeName: cfTypeNames[cfType] || `Tipo ${cfType}`,
        sales: data.sales,
        count: data.count,
        percentage: totalSales > 0 ? (data.sales / totalSales) * 100 : 0
      }))
      .sort((a, b) => b.sales - a.sales); // Ordenar por ventas descendente

    return cfTypeData;
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    ...stats,
    dailySales: chartData.dailySales,
    chartLoading: chartData.loading,
    chartError: chartData.error,
    chartFilters,
    siteSales: siteChartData.siteSales,
    siteLoading: siteChartData.loading,
    siteError: siteChartData.error,
    siteChartFilters,
    cfTypeData,
    recentTransactions,
    allTransactions,
    topProducts,
    refresh: loadDashboardData,
    loadChartData,
    updateChartFilters,
    refreshChartData,
    getChartStats: getChartStats(),
    loadSiteSalesData,
    refreshSiteData,
    updateSiteChartFilters,
    getSiteStats: getSiteStats()
  };
};
