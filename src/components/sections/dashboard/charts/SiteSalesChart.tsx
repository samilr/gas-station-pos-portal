import React, { useState } from 'react';
import { BarChart3, Building2, DollarSign, RefreshCw, TrendingUp, TrendingDown, Filter, ChevronDown, Search } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';
import { SiteSalesData, SiteChartFilters } from '../../../../../hooks/useDashboard';

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

const SiteSalesChart: React.FC<SiteSalesChartProps> = ({
  data,
  loading,
  error,
  chartFilters,
  onUpdateFilters,
  onRefresh,
  siteStats
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopOnly, setShowTopOnly] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(chartFilters.startDate);
  const [customEndDate, setCustomEndDate] = useState(chartFilters.endDate);

  // Filtrar datos basado en búsqueda y opciones
  const filteredData = data.filter(site => {
    const matchesSearch = site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.siteId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).slice(0, showTopOnly ? 20 : data.length); // Limitar a top 20 si está activado

  // Calcular el valor máximo para la escala
  const maxSales = Math.max(...filteredData.map(item => item.totalSales), 1);

  // Funciones para manejar filtros
  const handlePeriodChange = (period: SiteChartFilters['period']) => {
    onUpdateFilters({ period });
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      onUpdateFilters({
        period: 'custom',
        startDate: customStartDate,
        endDate: customEndDate
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ventas por Sucursal</h3>
          <Building2 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ventas por Sucursal</h3>
          <Building2 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <Building2 className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-red-600 font-medium">Error al cargar datos</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ventas por Sucursal</h3>
          <Building2 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Building2 className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500">No hay datos de ventas por sucursal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Ventas por Sucursal</h3>
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">{siteStats.totalSites} sucursales</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Período:</span>
              <select
                value={chartFilters.period}
                onChange={(e) => handlePeriodChange(e.target.value as SiteChartFilters['period'])}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Hoy</option>
                <option value="yesterday">Ayer</option>
                <option value="thisWeek">Esta Semana</option>
                <option value="lastWeek">Semana Anterior</option>
                <option value="thisMonth">Este Mes</option>
                <option value="lastMonth">Mes Anterior</option>
                <option value="custom">Rango Personalizado</option>
              </select>
            </div>
            
            {chartFilters.period === 'custom' && (
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">a</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCustomDateApply}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showTopOnly}
                  onChange={(e) => setShowTopOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Solo Top 20</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar sucursal por nombre o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Resumen del período */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Ventas</span>
          </div>
          <p className="text-lg font-bold text-blue-900">
            {formatCurrency(siteStats.totalSales)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Promedio por Sucursal</span>
          </div>
          <p className="text-lg font-bold text-green-900">
            {formatCurrency(siteStats.averageSiteSales)}
          </p>
        </div>
        {siteStats.topSite && (
          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Mejor Sucursal</span>
            </div>
            <p className="text-lg font-bold text-emerald-900">
              {formatCurrency(siteStats.topSite.totalSales)}
            </p>
            <p className="text-xs text-emerald-700 truncate">
              {siteStats.topSite.siteName}
            </p>
          </div>
        )}
        {siteStats.bottomSite && (
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Menor Sucursal</span>
            </div>
            <p className="text-lg font-bold text-orange-900">
              {formatCurrency(siteStats.bottomSite.totalSales)}
            </p>
            <p className="text-xs text-orange-700 truncate">
              {siteStats.bottomSite.siteName}
            </p>
          </div>
        )}
      </div>

      {/* Gráfico de barras verticales */}
      <div className="mt-8">
        <div className="flex items-end justify-between space-x-1 h-80 border-b border-gray-200 overflow-x-auto">
          {filteredData.slice(0, 20).map((site, index) => {
            const percentage = (site.totalSales / maxSales) * 100;
            const isTopSite = index < 3; // Destacar top 3
            const barHeight = Math.max((percentage / 100) * 300, 8); // Mínimo 8px de altura
            
            return (
              <div key={site.siteId} className="flex flex-col items-center flex-1 group min-w-0">
                {/* Barra */}
                <div className="relative w-full flex flex-col items-center">
                  <div
                    className={`w-full transition-all duration-500 rounded-t-md ${
                      isTopSite 
                        ? 'bg-gradient-to-t from-yellow-400 to-yellow-500' 
                        : 'bg-gradient-to-t from-blue-500 to-blue-600'
                    }`}
                    style={{
                      height: `${barHeight}px`
                    }}
                  >
                    {/* Tooltip en hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-lg">
                      <div className="text-center">
                        <div className="font-semibold text-sm mb-1">{site.siteName}</div>
                        <div className="font-medium text-green-400">{formatCurrency(site.totalSales)}</div>
                        <div className="text-gray-300 mt-1">{site.transactionCount} transacciones</div>
                        <div className="text-gray-400 text-xs mt-1">
                          Promedio: {formatCurrency(site.averageTicket)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          Posición: #{index + 1}
                        </div>
                      </div>
                      {/* Flecha del tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                
                {/* Etiquetas en la parte inferior */}
                <div className="mt-2 text-center min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mx-auto mb-1 ${
                    isTopSite ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-xs font-medium text-gray-700 truncate max-w-16">
                    {site.siteName.split(' ')[0]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(site.totalSales)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredData.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No se encontraron sucursales que coincidan con "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>Top 3 sucursales</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Otras sucursales</span>
            </div>
          </div>
          <div className="text-right">
            <p>Mostrando top 20 de {data.length} sucursales</p>
            <p>Período: {chartFilters.period === 'today' ? 'Hoy' : 
                        chartFilters.period === 'yesterday' ? 'Ayer' :
                        chartFilters.period === 'thisWeek' ? 'Esta Semana' :
                        chartFilters.period === 'lastWeek' ? 'Semana Anterior' :
                        chartFilters.period === 'thisMonth' ? 'Este Mes' :
                        chartFilters.period === 'lastMonth' ? 'Mes Anterior' :
                        'Rango Personalizado'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSalesChart;
