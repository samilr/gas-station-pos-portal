import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatNumber } from '../../../../utils/dashboardUtils';


interface TransactionVolumeChartProps {
  data: any[];
  title: string;
}

const TransactionVolumeChart: React.FC<TransactionVolumeChartProps> = ({ data, title }) => {
  // Procesar datos por día
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
      // Asumiendo que tenemos un campo de customer ID
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
      .slice(-30); // Últimos 30 días
  };

  const chartData = processData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{data.date} ({data.dayOfWeek})</p>
          <p className="text-blue-400">Transacciones: {data.transactions}</p>
          <p className="text-green-400">Clientes únicos: {data.uniqueCustomers}</p>
          <p className="text-gray-400">Promedio por cliente: {(data.transactions / data.uniqueCustomers).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No hay datos de volumen disponibles</p>
      </div>
    );
  }

  // Calcular métricas
  const totalTransactions = chartData.reduce((sum, day) => sum + day.transactions, 0);
  const averageDaily = totalTransactions / chartData.length;
  const peakDay = chartData.reduce((max, day) => day.transactions > max.transactions ? day : max);
  const lowDay = chartData.reduce((min, day) => day.transactions < min.transactions ? day : min);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
              interval={Math.floor(chartData.length / 8)}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="transactions" 
              stroke="#3B82F6" 
              fill="url(#volumeGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Métricas de volumen */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total</p>
          <p className="text-lg font-bold text-blue-900">{formatNumber(totalTransactions)}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Promedio Diario</p>
          <p className="text-lg font-bold text-green-900">{averageDaily.toFixed(2)}</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">Día Pico</p>
          <p className="text-lg font-bold text-orange-900">{peakDay.date}</p>
          <p className="text-xs text-orange-500">{peakDay.transactions.toFixed(2)}</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Día Bajo</p>
          <p className="text-lg font-bold text-red-900">{lowDay.date}</p>
          <p className="text-xs text-red-500">{lowDay.transactions.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionVolumeChart;
