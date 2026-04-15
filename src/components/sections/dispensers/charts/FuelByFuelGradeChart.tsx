import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieIcon, AlertTriangle, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../../../utils/dashboardUtils';
import { mapFuelProductName } from '../../../../utils/fuelProductMapping';
import type { FuelByFuelGradeRow } from '../../../../services/fuelTransactionService';

interface Props {
  data: FuelByFuelGradeRow[];
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

const PALETTE = ['#f97316', '#16a34a', '#3b82f6', '#a855f7', '#ef4444', '#0ea5e9'];

const Shell: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <div className="bg-white rounded-sm border border-table-border">
    <div className={sectionHeaderClass}>
      <PieIcon className="w-3.5 h-3.5 text-orange-600" />
      <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
        Ventas por Grado de Combustible
      </span>
      {right && <div className="ml-auto">{right}</div>}
    </div>
    {children}
  </div>
);

const FuelByFuelGradeChart: React.FC<Props> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Shell>
        <div className="p-3 flex items-center justify-center h-[280px]">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
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

  if (!data || data.length === 0) {
    return (
      <Shell>
        <div className="p-3 flex flex-col items-center justify-center h-[240px] text-xs text-text-muted">
          <BarChart3 className="w-5 h-5 mb-2" />
          <p>Sin datos por grado en el período</p>
        </div>
      </Shell>
    );
  }

  const total = data.reduce((s, r) => s + r.amount, 0);
  const chartData = data.map((d, i) => ({
    ...d,
    label: mapFuelProductName(d.fuelGradeName),
    fill: PALETTE[i % PALETTE.length],
    percentage: total > 0 ? (d.amount / total) * 100 : 0,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-sm shadow-md p-2 text-xs">
        <p className="font-semibold text-text-primary">{d.label}</p>
        <p className="text-orange-600">{formatCurrency(d.amount)}</p>
        <p className="text-green-600">{d.volume.toFixed(2)} G.</p>
        <p className="text-text-secondary">{d.txCount} transacciones</p>
        <p className="text-text-muted">{d.percentage.toFixed(1)}% del total</p>
      </div>
    );
  };

  const renderLegend = ({ payload }: any) => (
    <div className="flex flex-wrap justify-center gap-3 mt-2">
      {payload.map((entry: any, i: number) => (
        <span key={i} className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.payload.label} ({entry.payload.percentage.toFixed(1)}%)
        </span>
      ))}
    </div>
  );

  return (
    <Shell
      right={
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Total
          <strong className="text-text-primary">{formatCurrency(total)}</strong>
        </span>
      }
    >
      <div className="p-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%" cy="50%"
                labelLine={false}
                label={(e: any) => `${e.percentage.toFixed(0)}%`}
                outerRadius={90}
                dataKey="amount"
              >
                {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
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

export default FuelByFuelGradeChart;
