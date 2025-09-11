import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/dashboardUtils';

interface CfTypeData {
  cfType: string;
  cfTypeName: string;
  sales: number;
  count: number;
  percentage: number;
}

interface CfTypePieChartProps {
  data: CfTypeData[];
  loading: boolean;
  error: string | null;
}

const CfTypePieChart: React.FC<CfTypePieChartProps> = ({
  data,
  loading,
  error
}) => {
  // Colores para cada tipo de CF
  const COLORS = {
    '31': '#3B82F6', // Azul
    '32': '#10B981', // Verde
    '34': '#F59E0B', // Amarillo
    '44': '#EF4444', // Rojo
    '45': '#8B5CF6', // Púrpura
    'default': '#6B7280' // Gris
  };

  const getColor = (cfType: string) => {
    return COLORS[cfType as keyof typeof COLORS] || COLORS.default;
  };

  // Función para formatear el tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">CF {data.cfType} - {data.cfTypeName}</p>
          <p className="text-green-400">{formatCurrency(data.sales)}</p>
          <p className="text-gray-300">{data.count} transacciones</p>
          <p className="text-gray-400">{data.percentage.toFixed(1)}% del total</p>
        </div>
      );
    }
    return null;
  };

  // Función para formatear la leyenda
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
              Tipo {entry.payload.cfType} ({entry.payload.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ventas por Tipo de Comprobante Fiscal</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ventas por Tipo de Comprobante Fiscal</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Error al cargar datos</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ventas por Tipo de Comprobante Fiscal</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No hay datos de ventas por Tipo de Comprobante Fiscal</p>
        </div>
      </div>
    );
  }

  // Preparar datos para el gráfico
  const chartData = data.map(item => ({
    ...item,
    fill: getColor(item.cfType)
  }));

  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Ventas por Tipo de Comprobante Fiscal</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total de Ventas</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(totalSales)}</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => `${entry.cfType} (${entry.percentage.toFixed(1)}%)`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="sales"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default CfTypePieChart;
