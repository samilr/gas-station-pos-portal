import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Building2 } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';

interface SitePerformanceChartProps {
  data: any[];
  title: string;
}

const SitePerformanceChart: React.FC<SitePerformanceChartProps> = ({ data, title }) => {
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

    Object.values(siteMap).forEach(site => {
      site.averageTicket = site.transactions > 0 ? site.sales / site.transactions : 0;
      site.efficiency = site.transactions > 0 ? site.sales / site.transactions : 0;
    });

    return Object.values(siteMap).sort((a, b) => b.sales - a.sales).slice(0, 10);
  };

  const getSiteName = (siteId: string) => {
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

  const getBarColor = (index: number) => {
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'];
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-sm p-2 shadow-md text-xs">
          <p className="font-semibold text-text-primary">{d.siteName}</p>
          <p className="text-text-secondary">Ventas: <strong className="text-text-primary">{formatCurrency(d.sales)}</strong></p>
          <p className="text-text-secondary">Transacciones: <strong className="text-text-primary">{d.transactions}</strong></p>
          <p className="text-text-secondary">Ticket Promedio: <strong className="text-text-primary">{formatCurrency(d.averageTicket)}</strong></p>
          <p className="text-text-secondary">Eficiencia: <strong className="text-text-primary">{d.efficiency.toFixed(2)}</strong></p>
        </div>
      );
    }
    return null;
  };

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <Building2 className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Shell>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-text-muted">No hay datos de sitios disponibles</p>
        </div>
      </Shell>
    );
  }

  const totalSales = chartData.reduce((sum, site) => sum + site.sales, 0);
  const topSite = chartData[0];

  return (
    <Shell>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            stroke="#666"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="siteName"
            stroke="#666"
            tick={{ fontSize: 11 }}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} contentStyle={{ fontSize: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="sales">
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 flex flex-wrap gap-3">
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Top Performer <strong className="text-text-primary">{topSite.siteName}</strong>
          <span className="text-text-muted">({formatCurrency(topSite.sales)})</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Ventas Totales <strong className="text-text-primary">{formatCurrency(totalSales)}</strong>
          <span className="text-text-muted">({chartData.length} sitios)</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Promedio por Sitio <strong className="text-text-primary">{formatCurrency(totalSales / chartData.length)}</strong>
          <span className="text-text-muted">({Math.round((topSite.sales / totalSales) * 100)}% top)</span>
        </span>
      </div>
    </Shell>
  );
};

export default SitePerformanceChart;
