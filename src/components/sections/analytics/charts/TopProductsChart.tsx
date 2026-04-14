import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';


interface TopProductsChartProps {
  data: any[];
  title: string;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, title }) => {
  const processData = () => {
    if (!data || data.length === 0) return [];

    const productMap: { [key: string]: {
      productId: string;
      productName: string;
      sales: number;
      quantity: number;
      transactions: number;
      averagePrice: number;
    } } = {};

    data.forEach((transaction) => {
      const productsArray = transaction.prods;

      if (productsArray && Array.isArray(productsArray) && productsArray.length > 0) {
        productsArray.forEach((product: any) => {
          const productId = product.productId || 'Producto Sin ID';
          const productName = product.productName || 'Producto Sin Nombre';
          const quantity = product.quantity || 1;
          const price = product.price || 0;
          const totalProductSales = quantity * price;

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
      }
    });

    Object.values(productMap).forEach(product => {
      product.averagePrice = product.quantity > 0 ? product.sales / product.quantity : 0;
    });

    return Object.values(productMap).sort((a, b) => b.sales - a.sales).slice(0, 10);
  };

  const chartData = processData();

  const getBarColor = (index: number) => {
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'];
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-sm p-2 shadow-md text-xs">
          <p className="font-semibold text-text-primary">{d.productName}</p>
          <p className="text-text-secondary">Ventas: <strong className="text-text-primary">{formatCurrency(d.sales)}</strong></p>
          <p className="text-text-secondary">Cantidad: <strong className="text-text-primary">{d.quantity.toFixed(2)}</strong></p>
          <p className="text-text-secondary">Transacciones: <strong className="text-text-primary">{d.transactions}</strong></p>
          <p className="text-text-secondary">Precio Promedio: <strong className="text-text-primary">{formatCurrency(d.averagePrice)}</strong></p>
        </div>
      );
    }
    return null;
  };

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <Package className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Shell>
        <div className="bg-red-50 border border-red-200 rounded-sm px-3 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-sm text-red-700">No hay datos de productos disponibles (transacciones recibidas: {data?.length || 0})</span>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 70 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="productName"
            stroke="#666"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis
            stroke="#666"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} contentStyle={{ fontSize: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="sales" maxBarSize={60}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Shell>
  );
};

export default TopProductsChart;
