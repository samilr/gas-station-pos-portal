import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../../../utils/transactionUtils';


interface TopProductsChartProps {
  data: any[];
  title: string;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, title }) => {
  // Procesar datos por producto
  const processData = () => {
    if (!data || data.length === 0) {
      console.log('⚠️ TopProductsChart - No hay datos disponibles');
      return [];
    }

    console.log('🔍 TopProductsChart - Datos recibidos:', data.length, 'transacciones');
    console.log('🔍 Primera transacción:', data[0]);

    const productMap: { [key: string]: { 
      productId: string; 
      productName: string; 
      sales: number; 
      quantity: number; 
      transactions: number;
      averagePrice: number;
    } } = {};

    let transaccionesConProductos = 0;
    let transaccionesSinProductos = 0;

    data.forEach((transaction, index) => {
      // Buscar productos en prods (datos mock usan 'prods')
      const productsArray = transaction.prods;
      
      if (productsArray && Array.isArray(productsArray) && productsArray.length > 0) {
        transaccionesConProductos++;
        console.log(`🔍 Transacción ${index} (${transaction.transNumber}) tiene ${productsArray.length} productos:`, productsArray);
        
        productsArray.forEach((product: any) => {
          const productId = product.productId || 'Producto Sin ID';
          const productName = product.productName || 'Producto Sin Nombre';
          const quantity = product.quantity || 1;
          const price = product.price || 0;
          const totalProductSales = quantity * price;

          console.log(`  📦 Producto: ${productName} (${productId}) - Cantidad: ${quantity}, Precio: ${price}, Total: ${totalProductSales}`);

          if (!productMap[productId]) {
            productMap[productId] = {
              productId,
              productName,
              sales: 0,
              quantity: 0,
              transactions: 0,
              averagePrice: 0
            };
          }

          productMap[productId].sales += totalProductSales;
          productMap[productId].quantity += quantity;
          productMap[productId].transactions += 1;
        });
      } else {
        transaccionesSinProductos++;
        console.log(`⚠️ Transacción ${index} (${transaction.transNumber}) NO tiene productos en 'prods':`, transaction.prods);
      }
    });

    console.log(`📊 Resumen: ${transaccionesConProductos} transacciones con productos, ${transaccionesSinProductos} sin productos`);
    console.log('📊 Productos procesados:', Object.keys(productMap));

    // Calcular precio promedio
    Object.values(productMap).forEach(product => {
      product.averagePrice = product.quantity > 0 ? product.sales / product.quantity : 0;
    });

    const result = Object.values(productMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10); // Top 10 productos

    console.log('📊 Resultado final:', result);
    return result;
  };


  const chartData = processData();

  // Colores para las barras (gradiente de rendimiento)
  const getBarColor = (index: number) => {
    const colors = [
      '#10B981', // Verde para #1
      '#3B82F6', // Azul para #2
      '#8B5CF6', // Púrpura para #3
      '#F59E0B', // Amarillo para #4
      '#EF4444', // Rojo para #5
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
          <p className="text-blue-400">Cantidad: {data.quantity.toFixed(2)}</p>
          <p className="text-purple-400">Transacciones: {data.transactions}</p>
          <p className="text-yellow-400">Precio Promedio: {formatCurrency(data.averagePrice)}</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="text-center">
            <p className="text-yellow-800 font-medium mb-2">⚠️ No hay datos de productos disponibles</p>
            <p className="text-yellow-600 text-sm">
              Transacciones recibidas: {data?.length || 0}
            </p>
            <p className="text-yellow-600 text-sm">
              Revisa la consola para más detalles
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {/* Gráfico de Barras Vertical */}
      <div className="h-[500px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 30, right: 40, left: 30, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="productName"
              stroke="#666"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
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
      

    </div>
  );
};

export default TopProductsChart;
