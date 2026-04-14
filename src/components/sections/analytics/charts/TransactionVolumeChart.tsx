import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity } from 'lucide-react';
import { formatNumber } from '../../../../utils/dashboardUtils';


interface TransactionVolumeChartProps {
  data: any[];
  title: string;
}

const TransactionVolumeChart: React.FC<TransactionVolumeChartProps> = ({ data, title }) => {
  const processData = () => {
    if (!data || data.length === 0) return [];

    const dailyData: { [key: string]: {
      date: string;
      transactions: number;
      uniqueCustomers: number;
      dayOfWeek: string;
    } } = {};

    data.forEach(transaction => {
      const date = new Date(transaction.transDate);
      const dateKey = date.toISOString().split('T')[0];
      const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'short' });

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: `${date.getDate()}/${date.getMonth() + 1}`,
          transactions: 0,
          uniqueCustomers: 0,
          dayOfWeek
        };
      }

      dailyData[dateKey].transactions += 1;
      if (transaction.customerId) {
        dailyData[dateKey].uniqueCustomers += 1;
      }
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
          <p className="text-text-secondary">Transacciones: <strong className="text-text-primary">{d.transactions}</strong></p>
          <p className="text-text-secondary">Clientes únicos: <strong className="text-text-primary">{d.uniqueCustomers}</strong></p>
          {d.uniqueCustomers > 0 && (
            <p className="text-text-secondary">Promedio por cliente: <strong className="text-text-primary">{(d.transactions / d.uniqueCustomers).toFixed(2)}</strong></p>
          )}
        </div>
      );
    }
    return null;
  };

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <Activity className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Shell>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-text-muted">No hay datos de volumen disponibles</p>
        </div>
      </Shell>
    );
  }

  const totalTransactions = chartData.reduce((sum, day) => sum + day.transactions, 0);
  const averageDaily = totalTransactions / chartData.length;
  const peakDay = chartData.reduce((max, day) => day.transactions > max.transactions ? day : max);
  const lowDay = chartData.reduce((min, day) => day.transactions < min.transactions ? day : min);

  return (
    <Shell>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Total <strong className="text-text-primary">{formatNumber(totalTransactions)}</strong>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Promedio Diario <strong className="text-text-primary">{averageDaily.toFixed(2)}</strong>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Día Pico <strong className="text-text-primary">{peakDay.date}</strong>
          <span className="text-text-muted">({peakDay.transactions})</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Día Bajo <strong className="text-text-primary">{lowDay.date}</strong>
          <span className="text-text-muted">({lowDay.transactions})</span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
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
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip content={<CustomTooltip />} contentStyle={{ fontSize: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Area
            type="monotone"
            dataKey="transactions"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Shell>
  );
};

export default TransactionVolumeChart;
