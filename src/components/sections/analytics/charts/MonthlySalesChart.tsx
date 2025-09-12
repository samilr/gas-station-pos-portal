import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../../../utils/transactionUtils';

interface MonthlySalesChartProps {
  data: any[];
  title: string;
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ data, title }) => {
  // Procesar datos mensuales
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

    // Calcular ticket promedio
    Object.values(monthlyData).forEach(month => {
      month.averageTicket = month.transactions > 0 ? month.sales / month.transactions : 0;
    });

    return Object.values(monthlyData).sort((a, b) => a.monthNumber - b.monthNumber);
  };

  const chartData = processData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{data.month}</p>
          <p className="text-green-400">Ventas: {formatCurrency(data.sales)}</p>
          <p className="text-blue-400">Transacciones: {data.transactions}</p>
          <p className="text-purple-400">Ticket Promedio: {formatCurrency(data.averageTicket)}</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No hay datos mensuales disponibles</p>
      </div>
    );
  }

  // Calcular crecimiento mensual
  const calculateGrowth = () => {
    if (chartData.length < 2) return 0;
    const current = chartData[chartData.length - 1].sales;
    const previous = chartData[chartData.length - 2].sales;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const growth = calculateGrowth();
  const isPositiveGrowth = growth > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {chartData.length >= 2 && (
          <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
            isPositiveGrowth 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <span className="mr-1">
              {isPositiveGrowth ? '↗' : '↘'}
            </span>
            {Math.abs(growth).toFixed(1)}% vs mes anterior
          </div>
        )}
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              yAxisId="sales"
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              yAxisId="ticket"
              orientation="right"
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="sales"
              dataKey="sales" 
              fill="#3B82F6" 
              name="Ventas"
              radius={[2, 2, 0, 0]}
            />
            <Line 
              yAxisId="ticket"
              type="monotone" 
              dataKey="averageTicket" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              name="Ticket Promedio"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Resumen mensual */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Mejor Mes</p>
          <p className="text-lg font-bold text-blue-900">
            {chartData.length > 0 ? chartData.reduce((max, month) => 
              month.sales > max.sales ? month : max
            ).month : 'N/A'}
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Promedio Mensual</p>
          <p className="text-lg font-bold text-green-900">
            {formatCurrency(
              chartData.length > 0 
                ? chartData.reduce((sum, month) => sum + month.sales, 0) / chartData.length 
                : 0
            )}
          </p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Ticket Promedio</p>
          <p className="text-lg font-bold text-purple-900">
            {formatCurrency(
              chartData.length > 0 
                ? chartData.reduce((sum, month) => sum + month.averageTicket, 0) / chartData.length 
                : 0
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesChart;
