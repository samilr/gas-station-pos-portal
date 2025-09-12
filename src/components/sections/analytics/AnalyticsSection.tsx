import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

// Componentes de gráficos
import SalesTrendChart from './charts/SalesTrendChart';
import SalesByCategoryChart from './charts/SalesByCategoryChart';
import HourlySalesChart from './charts/HourlySalesChart';
import MonthlySalesChart from './charts/MonthlySalesChart';
import SitePerformanceChart from './charts/SitePerformanceChart';
import TransactionVolumeChart from './charts/TransactionVolumeChart';
import AverageTicketChart from './charts/AverageTicketChart';
import PaymentMethodChart from './charts/PaymentMethodChart';
import TopProductsChart from './charts/TopProductsChart';
import ProductCategoryAnalysisChart from './charts/ProductCategoryAnalysisChart';
import { formatCurrency } from '../../../utils/transactionUtils';
import { formatNumber } from '../../../utils/dashboardUtils';
import { useTransactions } from '../../../hooks/useTransactions';

interface AnalyticsSectionProps {
  // Props si es necesario
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = () => {
  const { transactions, loading, error } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCharts, setVisibleCharts] = useState({
    salesTrend: true,
    salesByCategory: true,
    hourlySales: true,
    monthlySales: true,
    sitePerformance: true,
    transactionVolume: true,
    averageTicket: true,
    paymentMethod: true,
    topProducts: true,
    productCategoryAnalysis: true
  });

  // Calcular métricas principales
  const calculateMetrics = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalSales: 0,
        totalTransactions: 0,
        averageTicket: 0,
        topCategory: 'N/A',
        topSite: 'N/A',
        growthRate: 0
      };
    }

    const totalSales = transactions.reduce((sum, t) => sum + (t.total || 0), 0);
    const totalTransactions = transactions.length;
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Top categoría
    const categorySales = transactions.reduce((acc, t) => {
      const category = t.categoryId || 'Otros';
      acc[category] = (acc[category] || 0) + (t.total || 0);
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(categorySales).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Top sitio
    const siteSales = transactions.reduce((acc, t) => {
      const site = t.siteId || 'N/A';
      acc[site] = (acc[site] || 0) + (t.total || 0);
      return acc;
    }, {} as Record<string, number>);
    const topSite = Object.entries(siteSales).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalSales,
      totalTransactions,
      averageTicket,
      topCategory,
      topSite,
      growthRate: 0 // Se calcularía comparando con período anterior
    };
  };

  const metrics = calculateMetrics();

  const toggleChart = (chartKey: keyof typeof visibleCharts) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartKey]: !prev[chartKey]
    }));
  };


  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <BarChart3 className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-red-600 font-medium">Error al cargar datos de Analytics</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
              Analytics & Reportes
            </h2>
            <p className="text-gray-600 mt-1">Análisis detallado de ventas y rendimiento</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Selector de período */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Año</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </button>

            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Ventas Totales</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalSales)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Transacciones</p>
                <p className="text-2xl font-bold">{formatNumber(metrics.totalTransactions)}</p>
              </div>
              <Activity className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Ticket Promedio</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.averageTicket)}</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Categoría Top</p>
                <p className="text-lg font-bold">{metrics.topCategory}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros Avanzados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sitio</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Todos los sitios</option>
                {/* Opciones de sitios */}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Controles de visualización */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Gráficos Visibles</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVisibleCharts(Object.fromEntries(
                Object.keys(visibleCharts).map(key => [key, true])
              ) as typeof visibleCharts)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mostrar Todos
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setVisibleCharts(Object.fromEntries(
                Object.keys(visibleCharts).map(key => [key, false])
              ) as typeof visibleCharts)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Ocultar Todos
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          {Object.entries(visibleCharts).map(([key, visible]) => (
            <button
              key={key}
              onClick={() => toggleChart(key as keyof typeof visibleCharts)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                visible 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {visible ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Ventas */}
        {visibleCharts.salesTrend && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <SalesTrendChart 
              data={transactions} 
              period={selectedPeriod}
              title="Tendencia de Ventas"
            />
          </div>
        )}

        {/* Ventas por Categoría */}
        {visibleCharts.salesByCategory && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <SalesByCategoryChart 
              data={transactions}
              title="Ventas por Categoría"
            />
          </div>
        )}

        {/* Ventas por Hora */}
        {visibleCharts.hourlySales && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <HourlySalesChart 
              data={transactions}
              title="Ventas por Hora del Día"
            />
          </div>
        )}

        {/* Ventas Mensuales */}
        {visibleCharts.monthlySales && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <MonthlySalesChart 
              data={transactions}
              title="Ventas Mensuales"
            />
          </div>
        )}

        {/* Rendimiento por Sitio */}
        {visibleCharts.sitePerformance && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <SitePerformanceChart 
              data={transactions}
              title="Rendimiento por Sitio"
            />
          </div>
        )}

        {/* Volumen de Transacciones */}
        {visibleCharts.transactionVolume && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <TransactionVolumeChart 
              data={transactions}
              title="Volumen de Transacciones"
            />
          </div>
        )}

        {/* Ticket Promedio */}
        {visibleCharts.averageTicket && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <AverageTicketChart 
              data={transactions}
              title="Evolución del Ticket Promedio"
            />
          </div>
        )}

        {/* Métodos de Pago */}
        {visibleCharts.paymentMethod && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <PaymentMethodChart 
              data={transactions}
              title="Distribución por Método de Pago"
            />
          </div>
        )}

        {/* Productos Más Vendidos */}
        {visibleCharts.topProducts && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <TopProductsChart 
              data={transactions}
              title="Productos Más Vendidos"
            />
          </div>
        )}

        {/* Análisis de Categorías de Productos */}
        {visibleCharts.productCategoryAnalysis && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <ProductCategoryAnalysisChart 
              data={transactions}
              title="Análisis por Categorías de Productos"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsSection;
