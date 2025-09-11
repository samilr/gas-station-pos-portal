import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '../../../../../utils/dashboardUtils';

interface AverageTicketChartProps {
  data: any[];
  title: string;
}

const AverageTicketChart: React.FC<AverageTicketChartProps> = ({ data, title }) => {
  // Procesar datos por día
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
      const dateKey = date.toISOString().split('T')[0];
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

    // Calcular ticket promedio
    Object.values(dailyData).forEach(day => {
      day.averageTicket = day.transactions > 0 ? day.totalSales / day.transactions : 0;
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{data.date} ({data.dayOfWeek})</p>
          <p className="text-green-400">Ticket Promedio: {formatCurrency(data.averageTicket)}</p>
          <p className="text-blue-400">Transacciones: {data.transactions}</p>
          <p className="text-purple-400">Ventas Totales: {formatCurrency(data.totalSales)}</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No hay datos de ticket promedio disponibles</p>
      </div>
    );
  }

  // Calcular métricas
  const allTickets = chartData.map(day => day.averageTicket).filter(ticket => ticket > 0);
  const overallAverage = allTickets.length > 0 ? allTickets.reduce((sum, ticket) => sum + ticket, 0) / allTickets.length : 0;
  const highestTicket = Math.max(...allTickets);
  const lowestTicket = Math.min(...allTickets);
  
  // Calcular tendencia
  const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
  const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
  const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, day) => sum + day.averageTicket, 0) / firstHalf.length : 0;
  const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, day) => sum + day.averageTicket, 0) / secondHalf.length : 0;
  const trend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
          trend > 0 
            ? 'bg-green-100 text-green-800' 
            : trend < 0 
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          <span className="mr-1">
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
          </span>
          {Math.abs(trend).toFixed(1)}% tendencia
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={overallAverage} 
              stroke="#8B5CF6" 
              strokeDasharray="5 5" 
              label={{ value: "Promedio", position: "topRight" }}
            />
            <Line 
              type="monotone" 
              dataKey="averageTicket" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Métricas de ticket promedio */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Promedio General</p>
          <p className="text-lg font-bold text-blue-900">{formatCurrency(overallAverage)}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Ticket Más Alto</p>
          <p className="text-lg font-bold text-green-900">{formatCurrency(highestTicket)}</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">Ticket Más Bajo</p>
          <p className="text-lg font-bold text-orange-900">{formatCurrency(lowestTicket)}</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Variación</p>
          <p className="text-lg font-bold text-purple-900">
            {formatCurrency(highestTicket - lowestTicket)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AverageTicketChart;
