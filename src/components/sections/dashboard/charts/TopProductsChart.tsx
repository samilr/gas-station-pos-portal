import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../../../utils/dashboardUtils';
import { Package, AlertTriangle } from 'lucide-react';
import { ITopProduct } from '../../../../types/transaction';

interface TopProductsChartProps {
  data: any[];
  topProducts?: ITopProduct[];
  loading: boolean;
  error: string | null;
}

const sectionHeaderClass = 'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

const tooltipContentStyle = {
  fontSize: 12,
  padding: 8,
  border: '1px solid #e5e7eb',
  borderRadius: 2,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, topProducts, loading, error }) => {
  const processData = () => {
    if (topProducts && topProducts.length > 0) {
      return topProducts
        .map((product, index) => ({
          productId: `product-${index}`,
          productName: product.productName,
          sales: product.total,
          quantity: product.quantity,
          timesSold: 1,
          realPrice: product.quantity > 0 ? product.total / product.quantity : 0,
        }))
        .slice(0, 5);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const firstItem = data[0];
    if (firstItem && !firstItem.prods && firstItem.productName) {
      return data
        .map((product: any, index: number) => ({
          productId: `product-${index}`,
          productName: product.productName,
          sales: product.total || product.sales,
          quantity: product.quantity || 0,
          timesSold: 1,
          realPrice:
            (product.quantity || 0) > 0 ? (product.total || product.sales) / (product.quantity || 1) : 0,
        }))
        .slice(0, 5);
    }

    const productMap: {
      [key: string]: {
        productId: string;
        productName: string;
        sales: number;
        quantity: number;
        timesSold: number;
        realPrice: number;
      };
    } = {};

    data.forEach((transaction) => {
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
            productMap[productId].timesSold += 1;
          } else {
            productMap[productId] = {
              productId,
              productName,
              sales: total,
              quantity,
              timesSold: 1,
              realPrice: price,
            };
          }
        });
      }
    });

    const products = Object.values(productMap);
    return products.sort((a, b) => b.sales - a.sales).slice(0, 5);
  };

  const chartData = processData();

  const getBarColor = (index: number) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'];
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-sm shadow-md p-2 text-xs">
          <p className="font-semibold text-text-primary">{d.productName}</p>
          <p className="text-green-600">Ventas: {formatCurrency(d.sales)}</p>
          <p className="text-blue-600">Cantidad: {d.quantity.toFixed(2)}</p>
          <p className="text-purple-600">Veces Vendido: {d.timesSold}</p>
          <p className="text-amber-600">Precio: {formatCurrency(d.realPrice)}</p>
        </div>
      );
    }
    return null;
  };

  const Shell: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={sectionHeaderClass}>
        <Package className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Top Productos</span>
        {right && <div className="ml-auto">{right}</div>}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="p-3 flex items-center justify-center h-[280px]">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="p-3">
          <div className="flex items-center gap-2 p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Error al cargar datos de productos: {error}</span>
          </div>
        </div>
      </Shell>
    );
  }

  if (chartData.length === 0) {
    return (
      <Shell>
        <div className="p-3 flex flex-col items-center justify-center h-[240px] text-xs text-text-muted">
          <Package className="w-5 h-5 mb-2" />
          <p>No hay datos de productos disponibles</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell right={<span className="text-xs text-text-muted">Por monto total de ventas</span>}>
      <div className="p-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="productName"
                tick={{ fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={10}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} contentStyle={tooltipContentStyle} />
              <Bar dataKey="sales" radius={[2, 2, 0, 0]} maxBarSize={80}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
};

export default TopProductsChart;
