import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, formatNumber } from '../../../../../utils/dashboardUtils';

interface TopProductsChartProps {
  data: any[];
  title: string;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, title }) => {
  // Procesar datos por producto
  const processData = () => {
    if (!data || data.length === 0) return [];

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

    let transaccionesConTransProd = 0;
    let transaccionesSinTransProd = 0;

    data.forEach((transaction, index) => {
      // Buscar productos en transProd o prods (para compatibilidad con datos mock)
      const productsArray = transaction.transProd || transaction.prods;
      
      if (productsArray && Array.isArray(productsArray) && productsArray.length > 0) {
        transaccionesConTransProd++;
        console.log(`🔍 Transacción ${index} tiene productos:`, productsArray);
        
        productsArray.forEach((product: any) => {
          const productId = product.productId || product.ProductId || 'Producto Sin ID';
          const productName = product.productName || product.ProductName || 'Producto Sin Nombre';
          const quantity = product.quantity || product.Quantity || 1;
          const price = product.price || product.Price || 0;
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
        transaccionesSinTransProd++;
        console.log(`⚠️ Transacción ${index} NO tiene productos:`, { transProd: transaction.transProd, prods: transaction.prods });
        
        // Fallback: si no hay productos, usar datos de la transacción general
        const productId = 'Transacción General';
        const productName = 'Producto General';
        const quantity = 1;
        const price = transaction.total || 0;

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

        productMap[productId].sales += price;
        productMap[productId].quantity += quantity;
        productMap[productId].transactions += 1;
      }
    });

    console.log(`📊 Resumen: ${transaccionesConTransProd} transacciones con transProd, ${transaccionesSinTransProd} sin transProd`);
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

  const getProductName = (productId: string, transaction: any) => {
    // Mapeo de productos comunes o inferir del nombre
    const productNames: { [key: string]: string } = {
      'GASOLINA_REGULAR': 'Gasolina Regular',
      'GASOLINA_PREMIUM': 'Gasolina Premium',
      'DIESEL': 'Diesel',
      'GAS_LP': 'Gas LP',
      'AGUA': 'Agua',
      'REFRESCO': 'Refresco',
      'CIGARRILLOS': 'Cigarrillos',
      'SNACKS': 'Snacks',
      'BEBIDAS_ALCOHOLICAS': 'Bebidas Alcohólicas',
      'PRODUCTO_GENERAL': 'Producto General'
    };

    // Si tenemos un nombre específico en la transacción, usarlo
    if (transaction.product_name) {
      return transaction.product_name;
    }

    // Si el productId está en nuestro mapeo, usarlo
    if (productNames[productId]) {
      return productNames[productId];
    }

    // Si no, usar el ID como nombre
    return productId;
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

  const CustomTooltip = ({ active, payload, label }: any) => {
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
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">No hay datos de productos disponibles</p>
      </div>
    );
  }

  const totalSales = chartData.reduce((sum, product) => sum + product.sales, 0);
  const totalQuantity = chartData.reduce((sum, product) => sum + product.quantity, 0);
  const topProduct = chartData[0];

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
              dataKey="productName" 
              stroke="#666"
              fontSize={12}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Métricas de productos */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Producto #1</p>
              <p className="text-lg font-bold text-green-900">{topProduct.productName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">{formatCurrency(topProduct.sales)}</p>
              <p className="text-xs text-green-500">{topProduct.quantity.toFixed(2)} unidades</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Ventas</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(totalSales)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">{totalQuantity.toFixed(2)}</p>
              <p className="text-xs text-blue-500">unidades totales</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Participación</p>
              <p className="text-lg font-bold text-purple-900">
                {Math.round((topProduct.sales / totalSales) * 100)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-600">{chartData.length}</p>
              <p className="text-xs text-purple-500">productos top</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos top */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Ranking de Productos</h4>
        <div className="space-y-2">
          {chartData.slice(0, 5).map((product, index) => (
            <div key={product.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-700">{product.productName}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600">{formatCurrency(product.sales)}</span>
                <span className="text-xs text-gray-500 ml-2">({product.quantity.toFixed(2)} unid.)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopProductsChart;
