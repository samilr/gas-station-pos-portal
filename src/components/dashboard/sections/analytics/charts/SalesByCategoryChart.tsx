import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../../../../utils/dashboardUtils';

interface SalesByCategoryChartProps {
  data: any[];
  title: string;
}

const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({ data, title }) => {
  // Procesar datos por categoría
  const processData = () => {
    if (!data || data.length === 0) return [];

    const categoryMap: { [key: string]: { sales: number; transactions: number; name: string } } = {};

    data.forEach(transaction => {
      // Buscar productos en transProd o prods (para compatibilidad con datos mock)
      const productsArray = transaction.transProd || transaction.prods;
      
      if (productsArray && Array.isArray(productsArray) && productsArray.length > 0) {
        productsArray.forEach((product: any) => {
          const categoryId = product.categoryId || product.CategoryId || transaction.categoryId || 'Otros';
          const categoryName = getCategoryName(categoryId);
          const quantity = product.quantity || product.Quantity || 1;
          const price = product.price || product.Price || 0;
          const productSales = quantity * price;

          if (!categoryMap[categoryId]) {
            categoryMap[categoryId] = {
              sales: 0,
              transactions: 0,
              name: categoryName
            };
          }

          categoryMap[categoryId].sales += productSales;
          categoryMap[categoryId].transactions += 1;
        });
      } else {
        // Fallback: usar categoría de la transacción general
        const categoryId = transaction.categoryId || 'Otros';
        const categoryName = getCategoryName(categoryId);

        if (!categoryMap[categoryId]) {
          categoryMap[categoryId] = {
            sales: 0,
            transactions: 0,
            name: categoryName
          };
        }

        categoryMap[categoryId].sales += transaction.total || 0;
        categoryMap[categoryId].transactions += 1;
      }
    });

    return Object.entries(categoryMap)
      .map(([id, data]) => ({
        id,
        name: data.name,
        sales: data.sales,
        transactions: data.transactions
      }))
      .sort((a, b) => b.sales - a.sales);
  };

  const getCategoryName = (categoryId: string) => {
    const categoryNames: { [key: string]: string } = {
      'COMB': 'Combustible',
      'TIENDA': 'Tienda',
      'SERVICIOS': 'Servicios',
      'ALIMENTOS': 'Alimentos',
      'BEBIDAS': 'Bebidas',
      'OTROS': 'Otros'
    };
    return categoryNames[categoryId] || categoryId;
  };

  const chartData = processData();

  // Colores para las barras
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-green-400">Ventas: {formatCurrency(data.sales)}</p>
          <p className="text-blue-400">Transacciones: {data.transactions}</p>
          <p className="text-gray-400">Promedio: {formatCurrency(data.sales / data.transactions)}</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No hay datos de categorías disponibles</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              stroke="#666"
              fontSize={12}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Resumen de categorías */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.slice(0, 4).map((item, index) => (
          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            <span className="text-sm text-gray-600">{formatCurrency(item.sales)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesByCategoryChart;
