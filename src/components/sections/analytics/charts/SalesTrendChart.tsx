import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineChart as LineIcon } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';

interface SalesTrendChartProps {
  data: any[];
  period: string;
  title: string;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data, period, title }) => {
  const processData = () => {
    if (!data || data.length === 0) return [];

    const groupedData: { [key: string]: { sales: number; transactions: number; date: string } } = {};

    data.forEach(transaction => {
      const date = new Date(transaction.transDate);
      let key: string;

      switch (period) {
        case 'today':
          key = `${date.getHours()}:00`;
          break;
        case 'week':
          key = date.toLocaleDateString('es-ES', { weekday: 'short' });
          break;
        case 'month':
          key = `${date.getDate()}/${date.getMonth() + 1}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `Q${quarter}`;
          break;
        case 'year':
          key = date.toLocaleDateString('es-ES', { month: 'short' });
          break;
        default:
          key = `${date.getDate()}/${date.getMonth() + 1}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = { sales: 0, transactions: 0, date: key };
      }

      groupedData[key].sales += transaction.total || 0;
      groupedData[key].transactions += 1;
    });

    return Object.values(groupedData).sort((a, b) => {
      if (period === 'today') {
        return parseInt(a.date.split(':')[0]) - parseInt(b.date.split(':')[0]);
      }
      return 0;
    });
  };

  const chartData = processData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-sm p-2 shadow-md text-xs">
          <p className="font-semibold text-text-primary">{label}</p>
          <p className="text-text-secondary">Ventas: <strong className="text-text-primary">{formatCurrency(payload[0].value)}</strong></p>
          <p className="text-text-secondary">Transacciones: <strong className="text-text-primary">{payload[1]?.value || 0}</strong></p>
        </div>
      );
    }
    return null;
  };

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <LineIcon className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Shell>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-text-muted">No hay datos disponibles para el período seleccionado</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11 }} />
          <YAxis
            stroke="#666"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} contentStyle={{ fontSize: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
            name="Ventas"
          />
          <Line
            type="monotone"
            dataKey="transactions"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
            name="Transacciones"
          />
        </LineChart>
      </ResponsiveContainer>
    </Shell>
  );
};

export default SalesTrendChart;
