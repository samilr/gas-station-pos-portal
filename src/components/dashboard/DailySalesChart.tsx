import React, { useState } from 'react';
import { BarChart3, Calendar, DollarSign, RefreshCw, TrendingUp, TrendingDown, Minus, Filter, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../utils/dashboardUtils';
import { DailySalesData, ChartFilters } from '../../hooks/useDashboard';

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

const DailySalesChart: React.FC<DailySalesChartProps> = ({
  data,
  loading,
  error,
  chartFilters,
  onUpdateFilters,
  onRefresh,
  chartStats
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(chartFilters.startDate);
  const [customEndDate, setCustomEndDate] = useState(chartFilters.endDate);

  // Funciones para manejar filtros
  const handlePeriodChange = (period: ChartFilters['period']) => {
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

  const getTrendIcon = () => {
    switch (chartStats.trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    switch (chartStats.trend) {
      case 'up': return 'Tendencia al alza';
      case 'down': return 'Tendencia a la baja';
      default: return 'Tendencia estable';
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Función para obtener el nombre del día
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      weekday: 'short'
    });
  };

  // Calcular el valor máximo para la escala
  const maxSales = Math.max(...data.map(item => item.sales), 1);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ventas Diarias del Mes</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">Ventas Diarias del Mes</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <BarChart3 className="w-12 h-12 mx-auto" />
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
          <h3 className="text-lg font-semibold text-gray-900">Ventas Diarias del Mes</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Calendar className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500">No hay datos de ventas para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Ventas Diarias</h3>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className="text-sm text-gray-600">{getTrendText()}</span>
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
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">{data.length} días</span>
          </div>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Período:</span>
              <select
                value={chartFilters.period}
                onChange={(e) => handlePeriodChange(e.target.value as ChartFilters['period'])}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="currentMonth">Mes Actual</option>
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
          </div>
        </div>
      )}

      {/* Resumen del período */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total del Período</span>
          </div>
          <p className="text-lg font-bold text-blue-900">
            {formatCurrency(chartStats.totalPeriod)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Promedio Diario</span>
          </div>
          <p className="text-lg font-bold text-green-900">
            {formatCurrency(chartStats.averageDaily)}
          </p>
        </div>
        {chartStats.bestDay && (
          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Mejor Día</span>
            </div>
            <p className="text-lg font-bold text-emerald-900">
              {formatCurrency(chartStats.bestDay.sales)}
            </p>
            <p className="text-xs text-emerald-700">
              {formatDate(chartStats.bestDay.date)}
            </p>
          </div>
        )}
        {chartStats.worstDay && (
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Peor Día</span>
            </div>
            <p className="text-lg font-bold text-orange-900">
              {formatCurrency(chartStats.worstDay.sales)}
            </p>
            <p className="text-xs text-orange-700">
              {formatDate(chartStats.worstDay.date)}
            </p>
          </div>
        )}
      </div>

      {/* Gráfico de barras verticales */}
      <div className="mt-16">
        <div className="flex items-end justify-between space-x-2 h-64 border-b border-gray-200">
          {data.map((item, index) => {
            const percentage = (item.sales / maxSales) * 100;
            // Obtener fecha actual en Santo Domingo para comparar
            const now = new Date();
            const santoDomingoDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Santo_Domingo"}));
            const todayString = santoDomingoDate.toISOString().split('T')[0];
            const isToday = item.date === todayString;
            const barHeight = Math.max((percentage / 100) * 240, 8); // Mínimo 8px de altura
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 group">
                {/* Barra */}
                <div className="relative w-full flex flex-col items-center">
                  <div
                    className={`w-full transition-all duration-500 rounded-t-md ${
                      isToday 
                        ? 'bg-gradient-to-t from-blue-500 to-blue-400' 
                        : 'bg-gradient-to-t from-green-500 to-green-400'
                    }`}
                    style={{
                      height: `${barHeight}px`
                    }}
                  >
                    {/* Tooltip mejorado en hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-lg">
                      <div className="text-center">
                        <div className="font-semibold text-sm mb-1">{formatDate(item.date)}</div>
                        <div className="font-medium text-green-400">{formatCurrency(item.sales)}</div>
                        <div className="text-gray-300 mt-1">{item.transactions} transacciones</div>
                        <div className="text-gray-400 text-xs mt-1">
                          {getDayName(item.date)}
                        </div>
                        {isToday && (
                          <div className="mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                            Hoy
                          </div>
                        )}
                      </div>
                      {/* Flecha del tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                
                {/* Etiquetas en la parte inferior */}
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-gray-700">
                    {formatDate(item.date)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getDayName(item.date)}
                  </div>
                  {isToday && (
                    <div className="mt-1">
                      <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                        Hoy
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Eje Y con valores de referencia */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(maxSales / 4)}</span>
          <span>{formatCurrency(maxSales / 2)}</span>
          <span>{formatCurrency((maxSales * 3) / 4)}</span>
          <span>{formatCurrency(maxSales)}</span>
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Días anteriores</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySalesChart;
