import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../../../../utils/dashboardUtils';

interface SalesTrendChartProps {
  data: any[];
  period: string;
  title: string;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data, period, title }) => {
  // Procesar datos para el gráfico de tendencia
  const processData = () => {
    if (!data || data.length === 0) return [];

    // Agrupar por fecha según el período
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
        groupedData[key] = {
          sales: 0,
          transactions: 0,
          date: key
        };
      }

      groupedData[key].sales += transaction.total || 0;
      groupedData[key].transactions += 1;
    });

    return Object.values(groupedData).sort((a, b) => {
      // Ordenar por fecha/orden lógico
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
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-green-400">Ventas: {formatCurrency(payload[0].value)}</p>
          <p className="text-blue-400">Transacciones: {payload[1]?.value || 0}</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No hay datos disponibles para el período seleccionado</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
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
      </div>
    </div>
  );
};

export default SalesTrendChart;
