import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../../../../utils/dashboardUtils';

interface PaymentMethodChartProps {
  data: any[];
  title: string;
}

const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data, title }) => {
  // Procesar datos por método de pago
  const processData = () => {
    if (!data || data.length === 0) return [];

    const paymentMap: { [key: string]: { 
      method: string; 
      name: string; 
      sales: number; 
      transactions: number; 
      percentage: number;
    } } = {};

    data.forEach(transaction => {
      // Asumiendo que tenemos un campo de método de pago
      // Si no existe, podemos inferirlo de otros campos o usar un valor por defecto
      const paymentMethod = transaction.paymentMethod || transaction.payment_type || 'Efectivo';
      const methodName = getPaymentMethodName(paymentMethod);

      if (!paymentMap[paymentMethod]) {
        paymentMap[paymentMethod] = {
          method: paymentMethod,
          name: methodName,
          sales: 0,
          transactions: 0,
          percentage: 0
        };
      }

      paymentMap[paymentMethod].sales += transaction.total || 0;
      paymentMap[paymentMethod].transactions += 1;
    });

    const totalSales = Object.values(paymentMap).reduce((sum, method) => sum + method.sales, 0);

    // Calcular porcentajes
    Object.values(paymentMap).forEach(method => {
      method.percentage = totalSales > 0 ? (method.sales / totalSales) * 100 : 0;
    });

    return Object.values(paymentMap)
      .sort((a, b) => b.sales - a.sales);
  };

  const getPaymentMethodName = (method: string) => {
    const methodNames: { [key: string]: string } = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'credit_card': 'Tarjeta de Crédito',
      'debit_card': 'Tarjeta de Débito',
      'transfer': 'Transferencia',
      'digital': 'Pago Digital',
      'mobile': 'Pago Móvil',
      'check': 'Cheque',
      'other': 'Otros'
    };
    return methodNames[method.toLowerCase()] || method;
  };

  const chartData = processData();

  // Colores para el gráfico de pastel
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-green-400">Ventas: {formatCurrency(data.sales)}</p>
          <p className="text-blue-400">Transacciones: {data.transactions}</p>
          <p className="text-purple-400">{data.percentage.toFixed(1)}% del total</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">
              {entry.value} ({entry.payload.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No hay datos de métodos de pago disponibles</p>
      </div>
    );
  }

  const totalSales = chartData.reduce((sum, method) => sum + method.sales, 0);
  const totalTransactions = chartData.reduce((sum, method) => sum + method.transactions, 0);
  const topMethod = chartData[0];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => `${entry.name} (${entry.percentage.toFixed(1)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="sales"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Métricas de métodos de pago */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Método Preferido</p>
              <p className="text-lg font-bold text-blue-900">{topMethod.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">{formatCurrency(topMethod.sales)}</p>
              <p className="text-xs text-blue-500">{topMethod.percentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Ventas</p>
              <p className="text-lg font-bold text-green-900">{formatCurrency(totalSales)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">{totalTransactions}</p>
              <p className="text-xs text-green-500">transacciones</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Métodos Activos</p>
              <p className="text-lg font-bold text-purple-900">{chartData.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-600">
                {formatCurrency(totalSales / totalTransactions)}
              </p>
              <p className="text-xs text-purple-500">promedio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodChart;
