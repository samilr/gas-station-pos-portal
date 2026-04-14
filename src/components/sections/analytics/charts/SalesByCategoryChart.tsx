import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';

interface SalesByCategoryChartProps {
  data: any[];
  title: string;
}

const SalesByCategoryChart: React.FC<SalesByCategoryChartProps> = ({ data, title }) => {
  const processData = () => {
    if (!data || data.length === 0) return [];

    const categoryMap: { [key: string]: { sales: number; transactions: number; name: string } } = {};

    data.forEach(transaction => {
      const productsArray = transaction.transProd || transaction.prods;

      if (productsArray && Array.isArray(productsArray) && productsArray.length > 0) {
        productsArray.forEach((product: any) => {
          const categoryId = product.categoryId || product.CategoryId || transaction.categoryId || 'Otros';
          const categoryName = getCategoryName(categoryId);
          const quantity = product.quantity || product.Quantity || 1;
          const price = product.price || product.Price || 0;
          const productSales = quantity * price;

          if (!categoryMap[categoryId]) {
            categoryMap[categoryId] = { sales: 0, transactions: 0, name: categoryName };
          }

          categoryMap[categoryId].sales += productSales;
          categoryMap[categoryId].transactions += 1;
        });
      } else {
        const categoryId = transaction.categoryId || 'Otros';
        const categoryName = getCategoryName(categoryId);

        if (!categoryMap[categoryId]) {
          categoryMap[categoryId] = { sales: 0, transactions: 0, name: categoryName };
        }

        categoryMap[categoryId].sales += transaction.total || 0;
        categoryMap[categoryId].transactions += 1;
      }
    });

    return Object.entries(categoryMap)
      .map(([id, d]) => ({ id, name: d.name, sales: d.sales, transactions: d.transactions }))
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-sm p-2 shadow-md text-xs">
          <p className="font-semibold text-text-primary">{d.name}</p>
          <p className="text-text-secondary">Ventas: <strong className="text-text-primary">{formatCurrency(d.sales)}</strong></p>
          <p className="text-text-secondary">Transacciones: <strong className="text-text-primary">{d.transactions}</strong></p>
          <p className="text-text-secondary">Promedio: <strong className="text-text-primary">{formatCurrency(d.sales / d.transactions)}</strong></p>
        </div>
      );
    }
    return null;
  };

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Shell>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-text-muted">No hay datos de categorías disponibles</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            stroke="#666"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#666"
            tick={{ fontSize: 11 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} contentStyle={{ fontSize: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="sales">
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 grid grid-cols-2 gap-1">
        {chartData.slice(0, 4).map((item, index) => (
          <div key={item.id} className="flex items-center justify-between px-2 py-1 bg-table-header border border-table-border rounded-sm">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-xs font-medium text-text-primary">{item.name}</span>
            </div>
            <span className="text-xs text-text-secondary">{formatCurrency(item.sales)}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
};

export default SalesByCategoryChart;
