import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';

interface MonthlySalesChartProps {
  data: any[];
  title: string;
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ data, title }) => {
  const processData = () => {
    if (!data || data.length === 0) return [];

    const monthlyData: { [key: string]: {
      month: string;
      sales: number;
      transactions: number;
      averageTicket: number;
      monthNumber: number;
    } } = {};

    data.forEach(transaction => {
      const date = new Date(transaction.transDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          sales: 0,
          transactions: 0,
          averageTicket: 0,
          monthNumber: date.getMonth() + 1
        };
      }

      monthlyData[monthKey].sales += transaction.total || 0;
      monthlyData[monthKey].transactions += 1;
    });

    Object.values(monthlyData).forEach(month => {
      month.averageTicket = month.transactions > 0 ? month.sales / month.transactions : 0;
    });

    return Object.values(monthlyData).sort((a, b) => a.monthNumber - b.monthNumber);
  };

  const chartData = processData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-sm p-2 shadow-md text-xs">
          <p className="font-semibold text-text-primary">{d.month}</p>
          <p className="text-text-secondary">Ventas: <strong className="text-text-primary">{formatCurrency(d.sales)}</strong></p>
          <p className="text-text-secondary">Transacciones: <strong className="text-text-primary">{d.transactions}</strong></p>
          <p className="text-text-secondary">Ticket Promedio: <strong className="text-text-primary">{formatCurrency(d.averageTicket)}</strong></p>
        </div>
      );
    }
    return null;
  };

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <Calendar className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Shell>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-text-muted">No hay datos mensuales disponibles</p>
        </div>
      </Shell>
    );
  }

  const calculateGrowth = () => {
    if (chartData.length < 2) return 0;
    const current = chartData[chartData.length - 1].sales;
    const previous = chartData[chartData.length - 2].sales;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const growth = calculateGrowth();
  const isPositiveGrowth = growth > 0;

  const bestMonth = chartData.reduce((max, month) => month.sales > max.sales ? month : max);
  const avgMonthlySales = chartData.reduce((sum, month) => sum + month.sales, 0) / chartData.length;
  const avgTicket = chartData.reduce((sum, month) => sum + month.averageTicket, 0) / chartData.length;

  return (
    <Shell>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        {chartData.length >= 2 && (
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <span className={`w-1.5 h-1.5 rounded-full ${isPositiveGrowth ? 'bg-green-500' : 'bg-red-500'}`} />
            vs mes anterior <strong className="text-text-primary">{isPositiveGrowth ? '+' : ''}{growth.toFixed(1)}%</strong>
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Mejor Mes <strong className="text-text-primary">{bestMonth.month}</strong>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Promedio Mensual <strong className="text-text-primary">{formatCurrency(avgMonthlySales)}</strong>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Ticket Promedio <strong className="text-text-primary">{formatCurrency(avgTicket)}</strong>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="sales"
            stroke="#666"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="ticket"
            orientation="right"
            stroke="#666"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} contentStyle={{ fontSize: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar yAxisId="sales" dataKey="sales" fill="#3B82F6" name="Ventas" />
          <Line
            yAxisId="ticket"
            type="monotone"
            dataKey="averageTicket"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
            name="Ticket Promedio"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Shell>
  );
};

export default MonthlySalesChart;
