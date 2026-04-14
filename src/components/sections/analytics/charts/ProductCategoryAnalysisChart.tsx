import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';
import { formatNumber } from '../../../../utils/dashboardUtils';


interface ProductCategoryAnalysisChartProps {
  data: any[];
  title: string;
}

const ProductCategoryAnalysisChart: React.FC<ProductCategoryAnalysisChartProps> = ({ data, title }) => {
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

    Object.values(categoryMap).forEach(category => {
      category.percentage = totalSales > 0 ? (category.sales / totalSales) * 100 : 0;
    });

    return Object.values(categoryMap).sort((a, b) => b.sales - a.sales);
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-sm p-2 shadow-md text-xs">
          <p className="font-semibold text-text-primary">{d.categoryName}</p>
          <p className="text-text-secondary">Ventas: <strong className="text-text-primary">{formatCurrency(d.sales)}</strong></p>
          <p className="text-text-secondary">Cantidad: <strong className="text-text-primary">{d.quantity.toFixed(2)}</strong></p>
          <p className="text-text-secondary">Productos: <strong className="text-text-primary">{d.products}</strong></p>
          <p className="text-text-secondary"><strong className="text-text-primary">{d.percentage.toFixed(1)}%</strong> del total</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1 text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.value} <strong className="text-text-primary">({entry.payload.percentage.toFixed(1)}%)</strong>
          </div>
        ))}
      </div>
    );
  };

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <PieIcon className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  if (chartData.length === 0) {
    return (
      <Shell>
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-text-muted">No hay datos de categorías de productos disponibles</p>
        </div>
      </Shell>
    );
  }

  const totalSales = chartData.reduce((sum, category) => sum + category.sales, 0);
  const totalQuantity = chartData.reduce((sum, category) => sum + category.quantity, 0);
  const totalProducts = chartData.reduce((sum, category) => sum + category.products, 0);
  const topCategory = chartData[0];

  return (
    <Shell>
      <ResponsiveContainer width="100%" height={280}>
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
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} contentStyle={{ fontSize: 12, padding: 8, border: '1px solid #e5e7eb', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend content={renderLegend} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-2 flex flex-wrap gap-3">
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Categoría Top <strong className="text-text-primary">{topCategory.categoryName}</strong>
          <span className="text-text-muted">({topCategory.percentage.toFixed(1)}%)</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Total Ventas <strong className="text-text-primary">{formatCurrency(totalSales)}</strong>
          <span className="text-text-muted">({totalQuantity.toFixed(2)} unid.)</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Productos Únicos <strong className="text-text-primary">{formatNumber(totalProducts)}</strong>
          <span className="text-text-muted">({chartData.length} categorías)</span>
        </span>
      </div>

      <div className="mt-3">
        <div className="text-2xs uppercase tracking-wide text-text-muted mb-1">Análisis por Categoría</div>
        <div className="space-y-1">
          {chartData.slice(0, 5).map((category, index) => (
            <div key={category.categoryId} className="flex items-center justify-between px-2 py-1 bg-table-header border border-table-border rounded-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-medium text-text-primary">{category.categoryName}</span>
              </div>
              <div className="text-xs text-text-secondary">
                <strong className="text-text-primary">{formatCurrency(category.sales)}</strong>
                <span className="text-text-muted ml-2">({category.quantity.toFixed(2)} unid.)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

export default ProductCategoryAnalysisChart;
