import React, { useState } from 'react';
import { BarChart3, Calendar, RefreshCw, TrendingUp, TrendingDown, Minus, Filter, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';
import { DailySalesData, ChartFilters } from '../../../../../hooks/useDashboard';
import { CompactButton } from '../../../ui';

interface DailySalesChartProps {
  data: DailySalesData[];
  loading: boolean;
  error: string | null;
  chartFilters: ChartFilters;
  onUpdateFilters: (filters: Partial<ChartFilters>) => void;
  onRefresh: () => void;
  chartStats: {
    bestDay: DailySalesData | null;
    worstDay: DailySalesData | null;
    averageDaily: number;
    totalPeriod: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

const sectionHeaderClass = 'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

const DailySalesChart: React.FC<DailySalesChartProps> = ({
  data,
  loading,
  error,
  chartFilters,
  onUpdateFilters,
  onRefresh,
  chartStats,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(chartFilters.startDate);
  const [customEndDate, setCustomEndDate] = useState(chartFilters.endDate);

  const handlePeriodChange = (period: ChartFilters['period']) => {
    onUpdateFilters({ period });
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      onUpdateFilters({
        period: 'custom',
        startDate: customStartDate,
        endDate: customEndDate,
      });
    }
  };

  const getTrendIcon = () => {
    switch (chartStats.trend) {
      case 'up':
        return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    switch (chartStats.trend) {
      case 'up':
        return 'Tendencia al alza';
      case 'down':
        return 'Tendencia a la baja';
      default:
        return 'Tendencia estable';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit' });
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', { weekday: 'short' });
  };

  const maxSales = Math.max(...data.map((item) => item.sales), 1);

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={sectionHeaderClass}>
        <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Ventas Diarias</span>
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="p-3 flex items-center justify-center h-[280px]">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="p-3">
          <div className="flex items-center gap-2 p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Error al cargar datos: {error}</span>
          </div>
        </div>
      </Shell>
    );
  }

  if (data.length === 0) {
    return (
      <Shell>
        <div className="p-3 flex flex-col items-center justify-center h-[240px] text-xs text-text-muted">
          <Calendar className="w-5 h-5 mb-2" />
          <p>No hay datos de ventas para mostrar</p>
        </div>
      </Shell>
    );
  }

  return (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={sectionHeaderClass}>
        <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Ventas Diarias</span>
        <span className="flex items-center gap-1 ml-2 text-xs text-text-secondary">
          {getTrendIcon()}
          {getTrendText()}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-text-muted">{data.length} días</span>
          <CompactButton variant="ghost" onClick={() => setShowFilters((s) => !s)}>
            <Filter className="w-3.5 h-3.5" />
            Filtros
          </CompactButton>
          <CompactButton variant="icon" onClick={onRefresh} disabled={loading} aria-label="Refrescar">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </CompactButton>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-2 px-3 h-10 border-b border-table-border bg-gray-50">
          <span className="text-2xs uppercase tracking-wide text-text-muted">Período</span>
          <select
            value={chartFilters.period}
            onChange={(e) => handlePeriodChange(e.target.value as ChartFilters['period'])}
            className="h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="currentMonth">Mes Actual</option>
            <option value="lastMonth">Mes Anterior</option>
            <option value="custom">Rango Personalizado</option>
          </select>
          {chartFilters.period === 'custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-text-muted">a</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <CompactButton variant="primary" onClick={handleCustomDateApply}>Aplicar</CompactButton>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 h-8 border-b border-table-border">
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Total
          <strong className="text-text-primary">{formatCurrency(chartStats.totalPeriod)}</strong>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Promedio
          <strong className="text-text-primary">{formatCurrency(chartStats.averageDaily)}</strong>
        </span>
        {chartStats.bestDay && (
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Mejor
            <strong className="text-text-primary">{formatCurrency(chartStats.bestDay.sales)}</strong>
            <span className="text-text-muted">({formatDate(chartStats.bestDay.date)})</span>
          </span>
        )}
        {chartStats.worstDay && (
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Menor
            <strong className="text-text-primary">{formatCurrency(chartStats.worstDay.sales)}</strong>
            <span className="text-text-muted">({formatDate(chartStats.worstDay.date)})</span>
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-end justify-between gap-1 h-[220px] border-b border-table-border">
          {data.map((item, index) => {
            const percentage = (item.sales / maxSales) * 100;
            const now = new Date();
            const santoDomingoDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' }));
            const todayString = santoDomingoDate.toISOString().split('T')[0];
            const isToday = item.date === todayString;
            const barHeight = Math.max((percentage / 100) * 200, 4);

            return (
              <div key={index} className="flex flex-col items-center flex-1 group min-w-0">
                <div className="relative w-full flex flex-col items-center">
                  <div
                    className={`w-full transition-all duration-300 rounded-t-sm ${
                      isToday ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ height: `${barHeight}px` }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1.5 bg-gray-900 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10 shadow-lg text-xs">
                      <div className="font-semibold">{formatDate(item.date)}</div>
                      <div className="text-green-400">{formatCurrency(item.sales)}</div>
                      <div className="text-gray-300">{item.transactions} transacciones</div>
                      <div className="text-gray-400 text-2xs">{getDayName(item.date)}</div>
                      {isToday && <div className="text-blue-300 text-2xs mt-0.5">Hoy</div>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between gap-1 mt-1">
          {data.map((item, index) => {
            const now = new Date();
            const santoDomingoDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' }));
            const todayString = santoDomingoDate.toISOString().split('T')[0];
            const isToday = item.date === todayString;
            return (
              <div key={index} className="flex-1 text-center min-w-0">
                <div className={`text-xs ${isToday ? 'font-semibold text-blue-600' : 'text-text-secondary'}`}>
                  {formatDate(item.date)}
                </div>
                <div className="text-2xs text-text-muted">{getDayName(item.date)}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-3 mt-2 pt-2 border-t border-table-border text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-green-500" /> Días anteriores
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-blue-500" /> Hoy
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailySalesChart;
