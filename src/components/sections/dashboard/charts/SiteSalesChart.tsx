import React, { useState } from 'react';
import { Building2, RefreshCw, TrendingUp, TrendingDown, Filter, Search, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';
import { SiteSalesData, SiteChartFilters } from '../../../../../hooks/useDashboard';
import { CompactButton } from '../../../ui';

interface SiteSalesChartProps {
  data: SiteSalesData[];
  loading: boolean;
  error: string | null;
  chartFilters: SiteChartFilters;
  onUpdateFilters: (filters: Partial<SiteChartFilters>) => void;
  onRefresh: () => void;
  siteStats: {
    topSite: SiteSalesData | null;
    bottomSite: SiteSalesData | null;
    totalSites: number;
    totalSales: number;
    averageSiteSales: number;
  };
}

const sectionHeaderClass = 'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

const SiteSalesChart: React.FC<SiteSalesChartProps> = ({
  data,
  loading,
  error,
  chartFilters,
  onUpdateFilters,
  onRefresh,
  siteStats,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopOnly, setShowTopOnly] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(chartFilters.startDate);
  const [customEndDate, setCustomEndDate] = useState(chartFilters.endDate);

  const filteredData = data
    .filter((site) => {
      const matchesSearch =
        site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.siteId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .slice(0, showTopOnly ? 20 : data.length);

  const maxSales = Math.max(...filteredData.map((item) => item.totalSales), 1);

  const handlePeriodChange = (period: SiteChartFilters['period']) => {
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

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={sectionHeaderClass}>
        <Building2 className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Ventas por Sucursal</span>
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
          <Building2 className="w-5 h-5 mb-2" />
          <p>No hay datos de ventas por sucursal</p>
        </div>
      </Shell>
    );
  }

  const periodLabel =
    chartFilters.period === 'today'
      ? 'Hoy'
      : chartFilters.period === 'yesterday'
      ? 'Ayer'
      : chartFilters.period === 'thisWeek'
      ? 'Esta Semana'
      : chartFilters.period === 'lastWeek'
      ? 'Semana Anterior'
      : chartFilters.period === 'thisMonth'
      ? 'Este Mes'
      : chartFilters.period === 'lastMonth'
      ? 'Mes Anterior'
      : 'Rango Personalizado';

  return (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={sectionHeaderClass}>
        <Building2 className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Ventas por Sucursal</span>
        <span className="ml-2 text-xs text-text-secondary">{siteStats.totalSites} sucursales</span>
        <div className="ml-auto flex items-center gap-2">
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
        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-table-border bg-gray-50">
          <span className="text-2xs uppercase tracking-wide text-text-muted">Período</span>
          <select
            value={chartFilters.period}
            onChange={(e) => handlePeriodChange(e.target.value as SiteChartFilters['period'])}
            className="h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="today">Hoy</option>
            <option value="yesterday">Ayer</option>
            <option value="thisWeek">Esta Semana</option>
            <option value="lastWeek">Semana Anterior</option>
            <option value="thisMonth">Este Mes</option>
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
          <label className="flex items-center gap-1 text-xs text-text-secondary ml-2">
            <input
              type="checkbox"
              checked={showTopOnly}
              onChange={(e) => setShowTopOnly(e.target.checked)}
              className="rounded-sm border-gray-300"
            />
            Solo Top 20
          </label>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 h-10 border-b border-table-border">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar sucursal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-7 pl-7 pr-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 h-8 border-b border-table-border">
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Total Ventas
          <strong className="text-text-primary">{formatCurrency(siteStats.totalSales)}</strong>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Promedio
          <strong className="text-text-primary">{formatCurrency(siteStats.averageSiteSales)}</strong>
        </span>
        {siteStats.topSite && (
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Top
            <strong className="text-text-primary">{formatCurrency(siteStats.topSite.totalSales)}</strong>
            <span className="text-text-muted truncate max-w-[120px]">({siteStats.topSite.siteName})</span>
          </span>
        )}
        {siteStats.bottomSite && (
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <TrendingDown className="w-3 h-3 text-orange-500" /> Menor
            <strong className="text-text-primary">{formatCurrency(siteStats.bottomSite.totalSales)}</strong>
            <span className="text-text-muted truncate max-w-[120px]">({siteStats.bottomSite.siteName})</span>
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-end justify-between gap-1 h-[240px] border-b border-table-border overflow-x-auto">
          {filteredData.slice(0, 20).map((site, index) => {
            const percentage = (site.totalSales / maxSales) * 100;
            const isTopSite = index < 3;
            const barHeight = Math.max((percentage / 100) * 220, 4);

            return (
              <div key={site.siteId} className="flex flex-col items-center flex-1 group min-w-0">
                <div className="relative w-full flex flex-col items-center">
                  <div
                    className={`w-full transition-all duration-300 rounded-t-sm ${
                      isTopSite ? 'bg-amber-400' : 'bg-blue-500'
                    }`}
                    style={{ height: `${barHeight}px` }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1.5 bg-gray-900 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10 shadow-lg text-xs">
                      <div className="font-semibold">{site.siteName}</div>
                      <div className="text-green-400">{formatCurrency(site.totalSales)}</div>
                      <div className="text-gray-300">{site.transactionCount} transacciones</div>
                      <div className="text-gray-400 text-2xs">Promedio: {formatCurrency(site.averageTicket)}</div>
                      <div className="text-gray-400 text-2xs">Posición: #{index + 1}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between gap-1 mt-1">
          {filteredData.slice(0, 20).map((site, index) => {
            const isTopSite = index < 3;
            return (
              <div key={site.siteId} className="flex-1 text-center min-w-0">
                <div
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-sm text-2xs font-semibold mb-0.5 ${
                    isTopSite ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-text-secondary'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="text-2xs text-text-secondary truncate">{site.siteName.split(' ')[0]}</div>
                <div className="text-2xs text-text-muted truncate">{formatCurrency(site.totalSales)}</div>
              </div>
            );
          })}
        </div>

        {filteredData.length === 0 && searchTerm && (
          <div className="flex flex-col items-center justify-center py-6 text-xs text-text-muted">
            <Search className="w-5 h-5 mb-2" />
            <p>No se encontraron sucursales que coincidan con "{searchTerm}"</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-table-border text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-amber-400" /> Top 3
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-blue-500" /> Otras
            </span>
          </div>
          <div>
            Top 20 de {data.length} sucursales · {periodLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSalesChart;
