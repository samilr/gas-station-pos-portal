import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../../../../utils/dashboardUtils';

interface HourlySalesChartProps {
  data: any[];
  title: string;
}

const HourlySalesChart: React.FC<HourlySalesChartProps> = ({ data, title }) => {
  // Procesar datos por hora
  const processData = () => {
    if (!data || data.length === 0) return [];

    // Inicializar todas las horas del día
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      sales: 0,
      transactions: 0,
      hourNumber: hour
    }));

    // Procesar transacciones
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
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-green-400">Ventas: {formatCurrency(data.sales)}</p>
          <p className="text-blue-400">Transacciones: {data.transactions}</p>
          {data.transactions > 0 && (
            <p className="text-gray-400">Promedio: {formatCurrency(data.sales / data.transactions)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Encontrar picos de actividad
  const peakHours = chartData
    .filter(item => item.sales > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="hour" 
              stroke="#666"
              fontSize={12}
              interval={2}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#3B82F6" 
              fill="url(#colorGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Análisis de picos */}
      {peakHours.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Horas Pico de Ventas</h4>
          <div className="space-y-1">
            {peakHours.map((peak, index) => (
              <div key={peak.hour} className="flex items-center justify-between text-sm">
                <span className="text-blue-700">
                  #{index + 1} {peak.hour}
                </span>
                <span className="text-blue-600 font-medium">
                  {formatCurrency(peak.sales)} ({peak.transactions} trans.)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HourlySalesChart;
