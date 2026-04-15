import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../../../utils/dashboardUtils';
import type { FuelDailyTrendRow } from '../../../../services/fuelTransactionService';

interface Props {
  data: FuelDailyTrendRow[];
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

const formatDay = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as FuelDailyTrendRow;
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-md p-2 text-xs">
      <p className="font-semibold text-text-primary">{formatDay(label)}</p>
      <p className="text-orange-600">Monto: {formatCurrency(row.amount)}</p>
      <p className="text-green-600">Volumen: {row.volume.toFixed(2)} G.</p>
      <p className="text-blue-600">Trans.: {row.txCount}</p>
    </div>
  );
};

const Shell: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <div className="bg-white rounded-sm border border-table-border">
    <div className={sectionHeaderClass}>
      <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
      <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
        Tendencia Diaria de Combustible
      </span>
      {right && <div className="ml-auto">{right}</div>}
    </div>
    {children}
  </div>
);

const FuelDailyTrendChart: React.FC<Props> = ({ data, loading, error }) => {
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
          <p>No hay datos en el período seleccionado</p>
        </div>
      </Shell>
    );
  }

  const totalAmount = data.reduce((s, r) => s + r.amount, 0);

  return (
    <Shell
      right={
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Total
          <strong className="text-text-primary">{formatCurrency(totalAmount)}</strong>
        </span>
      }
    >
      <div className="p-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} contentStyle={tooltipContentStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="amount" name="Monto (RD$)" fill="#f97316" radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="txCount" name="Trans." stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
};

export default FuelDailyTrendChart;
