import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';


interface AverageTicketChartProps {
  data: any[];
  title: string;
}

const AverageTicketChart: React.FC<AverageTicketChartProps> = ({ data, title }) => {
  const processData = () => {
    if (!data || data.length === 0) return [];

    const dailyData: { [key: string]: {
      date: string;
      totalSales: number;
      transactions: number;
      averageTicket: number;
      dayOfWeek: string;
    } } = {};

    data.forEach(transaction => {
      const date = new Date(transaction.transDate);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'short' });

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: `${date.getDate()}/${date.getMonth() + 1}`,
          totalSales: 0,
          transactions: 0,
          averageTicket: 0,
          dayOfWeek
        };
      }

      dailyData[dateKey].totalSales += transaction.total || 0;
      dailyData[dateKey].transactions += 1;
    });

    Object.values(dailyData).forEach(day => {
      day.averageTicket = day.transactions > 0 ? day.totalSales / day.transactions : 0;
    });

    return Object.values(dailyData)
      .sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-30);
  };

  const chartData = processData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-sm p-2 shadow-md text-xs">
          <p className="font-semibold text-text-primary">{d.date} ({d.dayOfWeek})</p>
          <p className="text-text-secondary">Ticket Promedio: <strong className="text-text-primary">{formatCurrency(d.averageTicket)}</strong></p>
          <p className="text-text-secondary">Transacciones: <strong className="text-text-primary">{d.transactions}</strong></p>
          <p className="text-text-secondary">Ventas Totales: <strong className="text-text-primary">{formatCurrency(d.totalSales)}</strong></p>
        </div>
      );
    }
    return null;
  };

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Shell>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-text-muted">No hay datos de ticket promedio disponibles</p>
        </div>
      </Shell>
    );
  }

  const allTickets = chartData.map(day => day.averageTicket).filter(ticket => ticket > 0);
  const overallAverage = allTickets.length > 0 ? allTickets.reduce((sum, ticket) => sum + ticket, 0) / allTickets.length : 0;
  const highestTicket = Math.max(...allTickets);
  const lowestTicket = Math.min(...allTickets);

  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, day) => sum + day.averageTicket, 0) / firstHalf.length : 0;
  const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, day) => sum + day.averageTicket, 0) / secondHalf.length : 0;
  const trend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

  const trendColor = trend > 0 ? 'bg-green-500' : trend < 0 ? 'bg-red-500' : 'bg-gray-400';

  return (
    <Shell>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className={`w-1.5 h-1.5 rounded-full ${trendColor}`} />
          Tendencia <strong className="text-text-primary">{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</strong>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Promedio General <strong className="text-text-primary">{formatCurrency(overallAverage)}</strong>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Más Alto <strong className="text-text-primary">{formatCurrency(highestTicket)}</strong>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Más Bajo <strong className="text-text-primary">{formatCurrency(lowestTicket)}</strong>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Variación <strong className="text-text-primary">{formatCurrency(highestTicket - lowestTicket)}</strong>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#666"
            tick={{ fontSize: 11 }}
            interval={Math.floor(chartData.length / 8)}
          />
          <YAxis
            stroke="#666"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} contentStyle={{ fontSize: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <ReferenceLine
            y={overallAverage}
            stroke="#8B5CF6"
            strokeDasharray="5 5"
            label={{ value: 'Promedio', position: 'top', fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="averageTicket"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Shell>
  );
};

export default AverageTicketChart;
