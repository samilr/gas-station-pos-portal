import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';

interface HourlySalesChartProps {
  data: any[];
  title: string;
}

const HourlySalesChart: React.FC<HourlySalesChartProps> = ({ data, title }) => {
  const processData = () => {
    if (!data || data.length === 0) return [];

    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      sales: 0,
      transactions: 0,
      hourNumber: hour
    }));

    data.forEach(transaction => {
      const date = new Date(transaction.transDate);
      const hour = date.getHours();

      hourlyData[hour].sales += transaction.total || 0;
      hourlyData[hour].transactions += 1;
    });

    return hourlyData;
  };

  const chartData = processData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-sm p-2 shadow-md text-xs">
          <p className="font-semibold text-text-primary">{label}</p>
          <p className="text-text-secondary">Ventas: <strong className="text-text-primary">{formatCurrency(d.sales)}</strong></p>
          <p className="text-text-secondary">Transacciones: <strong className="text-text-primary">{d.transactions}</strong></p>
          {d.transactions > 0 && (
            <p className="text-text-secondary">Promedio: <strong className="text-text-primary">{formatCurrency(d.sales / d.transactions)}</strong></p>
          )}
        </div>
      );
    }
    return null;
  };

  const peakHours = chartData
    .filter(item => item.sales > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-3">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="hour" stroke="#666" tick={{ fontSize: 11 }} interval={2} />
            <YAxis
              stroke="#666"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} contentStyle={{ fontSize: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>

        {peakHours.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="text-2xs uppercase tracking-wide text-text-muted">Horas Pico de Ventas</div>
            <div className="flex flex-wrap gap-3">
              {peakHours.map((peak, index) => (
                <span key={peak.hour} className="flex items-center gap-1 text-xs text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  #{index + 1} {peak.hour} <strong className="text-text-primary">{formatCurrency(peak.sales)}</strong>
                  <span className="text-text-muted">({peak.transactions} trans.)</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HourlySalesChart;
