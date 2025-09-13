import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../../../utils/dashboardUtils';
import { Package } from 'lucide-react';

interface TopProductsChartProps {
  data: any[];
  loading: boolean;
  error: string | null;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, loading, error }) => {
  // Procesar datos por producto
  const processData = () => {
    if (!data || data.length === 0) {
      return [];
    }

    const productMap: { [key: string]: { 
      productId: string; 
      productName: string; 
      sales: number; 
      quantity: number; 
      timesSold: number; // Cuántas veces se vendió este producto
      realPrice: number; // Precio real del producto
    } } = {};

    data.forEach(transaction => {
      if (transaction.prods && transaction.prods.length > 0) {
        transaction.prods.forEach((prod: any) => {
          const productId = prod.productId || 'unknown';
          const productName = prod.productName || 'Producto Desconocido';
          const quantity = parseFloat(prod.quantity) || 0;
          const price = parseFloat(prod.price) || 0;
          const total = quantity * price;

          if (productMap[productId]) {
            productMap[productId].sales += total;
            productMap[productId].quantity += quantity;
            productMap[productId].timesSold += 1; // Incrementar cada vez que aparece
          } else {
            productMap[productId] = {
              productId,
              productName,
              sales: total,
              quantity,
              timesSold: 1, // Primera vez que aparece
              realPrice: price // Precio real del producto
            };
          }
        });
      }
    });

    // Convertir a array (ya tenemos el precio real)
    const products = Object.values(productMap);

    // Ordenar por monto total de ventas (mayor volumen en $ primero)
    return products
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  };

  const chartData = processData();

  // Colores para las barras
  const getBarColor = (index: number) => {
    const colors = [
      '#3B82F6', // Azul
      '#10B981', // Verde
      '#F59E0B', // Amarillo
      '#EF4444', // Rojo
      '#8B5CF6', // Púrpura
      '#06B6D4', // Cian
      '#84CC16', // Lima
      '#F97316', // Naranja
      '#EC4899', // Rosa
      '#6B7280'  // Gris
    ];
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-semibold">{data.productName}</p>
          <p className="text-green-400">Ventas: {formatCurrency(data.sales)}</p>
          <p className="text-blue-400">Cantidad Total: {data.quantity.toFixed(2)}</p>
          <p className="text-purple-400">Veces Vendido: {data.timesSold}</p>
          <p className="text-yellow-400">Precio: {formatCurrency(data.realPrice)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Productos</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Productos</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Error al cargar datos de productos</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Productos</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay datos de productos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Productos con Mayor Volumen</h3>
        <span className="text-sm text-gray-500">Por monto total de ventas</span>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="productName" 
              tick={{ fontSize: 12 }}
              angle={-20}
              textAnchor="end"
              height={10}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="sales" 
              radius={[4, 4, 0, 0]}
              maxBarSize={100}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Resumen de productos - Solo nombres con colores 
      <div className="mt-4 grid grid-cols-1 gap-2">
        {chartData.slice(0, 3).map((product, index) => (
          <div key={product.productId} className="flex items-center p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getBarColor(index) }}></div>
              <span className="text-sm font-medium text-gray-900 truncate">
                {product.productName}
              </span>
            </div>
          </div>
        ))}
      </div>
      */}
    </div>
    
  );
};

export default TopProductsChart;