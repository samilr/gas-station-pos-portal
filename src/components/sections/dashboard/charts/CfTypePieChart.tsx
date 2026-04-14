import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieIcon, AlertTriangle, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../../../utils/transactionUtils';

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

const sectionHeaderClass = 'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

const tooltipContentStyle = {
  fontSize: 12,
  padding: 8,
  border: '1px solid #e5e7eb',
  borderRadius: 2,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

const CfTypePieChart: React.FC<CfTypePieChartProps> = ({ data, loading, error }) => {
  const COLORS = {
    '31': '#3B82F6',
    '32': '#10B981',
    '34': '#F59E0B',
    '44': '#EF4444',
    '45': '#8B5CF6',
    default: '#6B7280',
  };

  const getColor = (cfType: string) => COLORS[cfType as keyof typeof COLORS] || COLORS.default;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-sm shadow-md p-2 text-xs">
          <p className="font-semibold text-text-primary">
            CF {d.cfType} - {d.cfTypeName}
          </p>
          <p className="text-green-600">{formatCurrency(d.sales)}</p>
          <p className="text-text-secondary">{d.count} transacciones</p>
          <p className="text-text-muted">{d.percentage.toFixed(1)}% del total</p>
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
          <span key={index} className="flex items-center gap-1 text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
            Tipo {entry.payload.cfType} ({entry.payload.percentage.toFixed(1)}%)
          </span>
        ))}
      </div>
    );
  };

  const Shell: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={sectionHeaderClass}>
        <PieIcon className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
          Ventas por Tipo de Comprobante Fiscal
        </span>
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
            <span>Error al cargar datos: {error}</span>
          </div>
        </div>
      </Shell>
    );
  }

  if (data.length === 0) {
    return (
      <Shell>
        <div className="p-3 flex flex-col items-center justify-center h-[240px] text-xs text-text-muted">
          <BarChart3 className="w-5 h-5 mb-2" />
          <p>No hay datos de ventas por Tipo de Comprobante Fiscal</p>
        </div>
      </Shell>
    );
  }

  const chartData = data.map((item) => ({ ...item, fill: getColor(item.cfType) }));
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

  return (
    <Shell
      right={
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Total
          <strong className="text-text-primary">{formatCurrency(totalSales)}</strong>
        </span>
      }
    >
      <div className="p-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.cfType} (${entry.percentage.toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="sales"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} contentStyle={tooltipContentStyle} />
              <Legend content={renderLegend} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
};

export default CfTypePieChart;
