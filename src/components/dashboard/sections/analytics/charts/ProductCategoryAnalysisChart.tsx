import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, formatNumber } from '../../../../../utils/dashboardUtils';

interface ProductCategoryAnalysisChartProps {
  data: any[];
  title: string;
}

const ProductCategoryAnalysisChart: React.FC<ProductCategoryAnalysisChartProps> = ({ data, title }) => {
  // Procesar datos por categoría de productos
  const processData = () => {
    if (!data || data.length === 0) return [];

    const categoryMap: { [key: string]: { 
      categoryId: string; 
      categoryName: string; 
      sales: number; 
      quantity: number; 
      transactions: number;
      products: number;
      percentage: number;
    } } = {};

    data.forEach(transaction => {
      // Buscar productos en transProd o prods (para compatibilidad con datos mock)
      const productsArray = transaction.transProd || transaction.prods;
      
      if (productsArray && Array.isArray(productsArray) && productsArray.length > 0) {
        productsArray.forEach((product: any) => {
          const categoryId = product.categoryId || product.CategoryId || 'OTROS';
          const categoryName = getCategoryName(categoryId);
          const quantity = product.quantity || product.Quantity || 1;
          const price = product.price || product.Price || 0;
          const productSales = quantity * price;

          if (!categoryMap[categoryId]) {
            categoryMap[categoryId] = {
              categoryId,
              categoryName,
              sales: 0,
              quantity: 0,
              transactions: 0,
              products: 0,
              percentage: 0
            };
          }

          categoryMap[categoryId].sales += productSales;
          categoryMap[categoryId].quantity += quantity;
          categoryMap[categoryId].transactions += 1;
          categoryMap[categoryId].products += 1;
        });
      }
    });

    const totalSales = Object.values(categoryMap).reduce((sum, cat) => sum + cat.sales, 0);

    // Calcular porcentajes
    Object.values(categoryMap).forEach(category => {
      category.percentage = totalSales > 0 ? (category.sales / totalSales) * 100 : 0;
    });

    return Object.values(categoryMap)
      .sort((a, b) => b.sales - a.sales);
  };

  const getCategoryName = (categoryId: string) => {
    const categoryNames: { [key: string]: string } = {
      'COMB': 'Combustible',
      'TIENDA': 'Tienda',
      'SERVICIOS': 'Servicios',
      'ALIMENTOS': 'Alimentos',
      'BEBIDAS': 'Bebidas',
      'FARMACIA': 'Farmacia',
      'AUTOMOTRIZ': 'Automotriz',
      'HOGAR': 'Hogar',
      'ELECTRONICOS': 'Electrónicos',
      'ROPA': 'Ropa',
      'OTROS': 'Otros'
    };
    return categoryNames[categoryId] || categoryId;
  };

  const chartData = processData();

  // Colores para el gráfico de pastel
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{data.categoryName}</p>
          <p className="text-green-400">Ventas: {formatCurrency(data.sales)}</p>
          <p className="text-blue-400">Cantidad: {data.quantity.toFixed(2)}</p>
          <p className="text-purple-400">Productos: {data.products}</p>
          <p className="text-yellow-400">{data.percentage.toFixed(1)}% del total</p>
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
        <p className="text-gray-500">No hay datos de categorías de productos disponibles</p>
      </div>
    );
  }

  const totalSales = chartData.reduce((sum, category) => sum + category.sales, 0);
  const totalQuantity = chartData.reduce((sum, category) => sum + category.quantity, 0);
  const totalProducts = chartData.reduce((sum, category) => sum + category.products, 0);
  const topCategory = chartData[0];

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
              label={(entry: any) => `${entry.categoryName} (${entry.percentage.toFixed(1)}%)`}
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
      
      {/* Métricas de categorías */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Categoría Top</p>
              <p className="text-lg font-bold text-blue-900">{topCategory.categoryName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">{formatCurrency(topCategory.sales)}</p>
              <p className="text-xs text-blue-500">{topCategory.percentage.toFixed(1)}%</p>
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
              <p className="text-sm text-green-600">{totalQuantity.toFixed(2)}</p>
              <p className="text-xs text-green-500">unidades</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Productos Únicos</p>
              <p className="text-lg font-bold text-purple-900">{formatNumber(totalProducts)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-600">{chartData.length}</p>
              <p className="text-xs text-purple-500">categorías</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista detallada de categorías */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Análisis por Categoría</h4>
        <div className="space-y-2">
          {chartData.slice(0, 5).map((category, index) => (
            <div key={category.categoryId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700">{category.categoryName}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600">{formatCurrency(category.sales)}</span>
                <span className="text-xs text-gray-500 ml-2">({category.quantity.toFixed(2)} unid.)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCategoryAnalysisChart;
