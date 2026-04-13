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

// Componentes de graficos
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
import { CompactButton } from '../../ui';
import Toolbar from '../../ui/Toolbar';

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

  // Calcular metricas principales
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

    // Top categoria
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
      growthRate: 0
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
      <div className="bg-white rounded-sm p-3 border border-gray-200">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-sm p-3 border border-gray-200">
        <div className="text-center py-8">
          <BarChart3 className="w-8 h-8 mx-auto text-red-500 mb-2" />
          <p className="text-red-600 text-sm font-medium">Error al cargar datos de Analytics</p>
          <p className="text-gray-500 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        chips={[
          { label: "Ventas", value: formatCurrency(metrics.totalSales), color: "blue" },
          { label: "Trans.", value: formatNumber(metrics.totalTransactions), color: "green" },
          { label: "Ticket", value: formatCurrency(metrics.averageTicket), color: "purple" },
          { label: "Top Cat.", value: metrics.topCategory, color: "orange" },
        ]}
      >
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="h-7 px-2 text-sm border border-gray-300 rounded-sm"
        >
          <option value="today">Hoy</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
          <option value="quarter">Trimestre</option>
          <option value="year">Ano</option>
        </select>
        <CompactButton variant="ghost" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-3.5 h-3.5" />
          Filtros
        </CompactButton>
        <CompactButton variant="primary">
          <Download className="w-3.5 h-3.5" />
          Exportar
        </CompactButton>
      </Toolbar>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="bg-white rounded-sm p-2 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Filtros Avanzados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sitio</label>
              <select className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm">
                <option value="">Todos los sitios</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Controles de visualizacion */}
      <div className="bg-white rounded-sm p-2 border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-900">Graficos Visibles</h3>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setVisibleCharts(Object.fromEntries(
                Object.keys(visibleCharts).map(key => [key, true])
              ) as typeof visibleCharts)}
              className="text-blue-600 hover:text-blue-800"
            >
              Todos
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setVisibleCharts(Object.fromEntries(
                Object.keys(visibleCharts).map(key => [key, false])
              ) as typeof visibleCharts)}
              className="text-gray-600 hover:text-gray-800"
            >
              Ninguno
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
          {Object.entries(visibleCharts).map(([key, visible]) => (
            <button
              key={key}
              onClick={() => toggleChart(key as keyof typeof visibleCharts)}
              className={`flex items-center px-2 py-1 rounded-sm text-xs transition-colors ${
                visible
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {visible ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Graficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {visibleCharts.salesTrend && (
          <div className="bg-white rounded-sm p-3 border border-gray-200">
            <SalesTrendChart data={transactions} period={selectedPeriod} title="Tendencia de Ventas" />
          </div>
        )}
        {visibleCharts.salesByCategory && (
          <div className="bg-white rounded-sm p-3 border border-gray-200">
            <SalesByCategoryChart data={transactions} title="Ventas por Categoria" />
          </div>
        )}
        {visibleCharts.hourlySales && (
          <div className="bg-white rounded-sm p-3 border border-gray-200">
            <HourlySalesChart data={transactions} title="Ventas por Hora del Dia" />
          </div>
        )}
        {visibleCharts.monthlySales && (
          <div className="bg-white rounded-sm p-3 border border-gray-200">
            <MonthlySalesChart data={transactions} title="Ventas Mensuales" />
          </div>
        )}
        {visibleCharts.sitePerformance && (
          <div className="bg-white rounded-sm p-3 border border-gray-200">
            <SitePerformanceChart data={transactions} title="Rendimiento por Sitio" />
          </div>
        )}
        {visibleCharts.transactionVolume && (
          <div className="bg-white rounded-sm p-3 border border-gray-200">
            <TransactionVolumeChart data={transactions} title="Volumen de Transacciones" />
          </div>
        )}
        {visibleCharts.averageTicket && (
          <div className="bg-white rounded-sm p-3 border border-gray-200">
            <AverageTicketChart data={transactions} title="Evolucion del Ticket Promedio" />
          </div>
        )}
        {visibleCharts.paymentMethod && (
          <div className="bg-white rounded-sm p-3 border border-gray-200">
            <PaymentMethodChart data={transactions} title="Distribucion por Metodo de Pago" />
          </div>
        )}
        {visibleCharts.topProducts && (
          <div className="bg-white rounded-sm p-3 border border-gray-200">
            <TopProductsChart data={transactions} title="Productos Mas Vendidos" />
          </div>
        )}
        {visibleCharts.productCategoryAnalysis && (
          <div className="bg-white rounded-sm p-3 border border-gray-200">
            <ProductCategoryAnalysisChart data={transactions} title="Analisis por Categorias de Productos" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsSection;
