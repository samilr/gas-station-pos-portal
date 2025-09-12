import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../../../utils/transactionUtils';

interface SitePerformanceChartProps {
  data: any[];
  title: string;
}

const SitePerformanceChart: React.FC<SitePerformanceChartProps> = ({ data, title }) => {
  // Procesar datos por sitio
  const processData = () => {
    if (!data || data.length === 0) return [];

    const siteMap: { [key: string]: { 
      siteId: string; 
      siteName: string; 
      sales: number; 
      transactions: number; 
      averageTicket: number;
      efficiency: number;
    } } = {};

    data.forEach(transaction => {
      const siteId = transaction.siteId || 'N/A';
      const siteName = getSiteName(siteId);

      if (!siteMap[siteId]) {
        siteMap[siteId] = {
          siteId,
          siteName,
          sales: 0,
          transactions: 0,
          averageTicket: 0,
          efficiency: 0
        };
      }

      siteMap[siteId].sales += transaction.total || 0;
      siteMap[siteId].transactions += 1;
    });

    // Calcular métricas
    Object.values(siteMap).forEach(site => {
      site.averageTicket = site.transactions > 0 ? site.sales / site.transactions : 0;
      // Eficiencia basada en ventas por transacción (métrica personalizada)
      site.efficiency = site.transactions > 0 ? site.sales / site.transactions : 0;
    });

    return Object.values(siteMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10); // Top 10 sitios
  };

  const getSiteName = (siteId: string) => {
    // Mapeo de IDs de sitio a nombres (esto debería venir de una API o configuración)
    const siteNames: { [key: string]: string } = {
      'SITE001': 'Sucursal Centro',
      'SITE002': 'Sucursal Norte',
      'SITE003': 'Sucursal Sur',
      'SITE004': 'Sucursal Este',
      'SITE005': 'Sucursal Oeste',
      'SITE006': 'Sucursal Plaza',
      'SITE007': 'Sucursal Mall',
      'SITE008': 'Sucursal Aeropuerto',
      'SITE009': 'Sucursal Terminal',
      'SITE010': 'Sucursal Industrial'
    };
    return siteNames[siteId] || `Sitio ${siteId}`;
  };

  const chartData = processData();

  // Colores para las barras (gradiente de rendimiento)
  const getBarColor = (index: number) => {
    const colors = [
      '#10B981', // Verde para top performers
      '#3B82F6', // Azul
      '#8B5CF6', // Púrpura
      '#F59E0B', // Amarillo
      '#EF4444', // Rojo
      '#06B6D4', // Cian
      '#84CC16', // Lima
      '#F97316', // Naranja
      '#EC4899', // Rosa
      '#6B7280'  // Gris
    ];
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{data.siteName}</p>
          <p className="text-green-400">Ventas: {formatCurrency(data.sales)}</p>
          <p className="text-blue-400">Transacciones: {data.transactions}</p>
          <p className="text-purple-400">Ticket Promedio: {formatCurrency(data.averageTicket)}</p>
          <p className="text-yellow-400">Eficiencia: {data.efficiency.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No hay datos de sitios disponibles</p>
      </div>
    );
  }

  const totalSales = chartData.reduce((sum, site) => sum + site.sales, 0);
  const topSite = chartData[0];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category"
              dataKey="siteName" 
              stroke="#666"
              fontSize={12}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Métricas de rendimiento */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Top Performer</p>
              <p className="text-lg font-bold text-green-900">{topSite.siteName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">{formatCurrency(topSite.sales)}</p>
              <p className="text-xs text-green-500">{topSite.transactions} trans.</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Ventas Totales</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(totalSales)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">{chartData.length} sitios</p>
              <p className="text-xs text-blue-500">activos</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Promedio por Sitio</p>
              <p className="text-lg font-bold text-purple-900">
                {formatCurrency(totalSales / chartData.length)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-600">
                {Math.round((topSite.sales / totalSales) * 100)}%
              </p>
              <p className="text-xs text-purple-500">del total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitePerformanceChart;
