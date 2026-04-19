import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../../../utils/dashboardUtils';
import type { FuelHourlyRow } from '../../../../services/fuelTransactionService';

interface Props {
  data: FuelHourlyRow[];
  loading: boolean;
  error: string | null;
}

type Metric = 'amount' | 'volume' | 'txCount';

const METRICS: Record<Metric, { label: string; color: string; format: (v: number) => string; unit?: string }> = {
  amount: { label: 'Monto (RD$)', color: '#3b82f6', format: (v) => formatCurrency(v) },
  volume: { label: 'Volumen (G.)', color: '#10b981', format: (v) => `${v.toFixed(2)} G.` },
  txCount: { label: 'Transacciones', color: '#f59e0b', format: (v) => `${v}` },
};

const sectionHeaderClass = 'flex items-center justify-between gap-2 px-3 h-8 bg-table-header border-b border-table-border';

const tooltipContentStyle = {
  fontSize: 12,
  padding: 8,
  border: '1px solid #e5e7eb',
  borderRadius: 2,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

const fillHours = (rows: FuelHourlyRow[]): FuelHourlyRow[] => {
  const map = new Map<number, FuelHourlyRow>();
  rows.forEach((r) => map.set(r.hour, r));
  return Array.from({ length: 24 }, (_, h) =>
    map.get(h) ?? { hour: h, txCount: 0, volume: 0, amount: 0 },
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload as FuelHourlyRow;
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-md p-2 text-xs">
      <p className="font-semibold text-text-primary">{String(label).padStart(2, '0')}:00 hrs</p>
      <p className="text-blue-600">Monto: {formatCurrency(r.amount)}</p>
      <p className="text-green-600">Volumen: {r.volume.toFixed(2)} G.</p>
      <p className="text-amber-600">{r.txCount} transacciones</p>
    </div>
  );
};

const Shell: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <div className="bg-white rounded-sm border border-table-border">
    <div className={sectionHeaderClass}>
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-orange-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
          Distribución por Hora del Día
        </span>
      </div>
      {right}
    </div>
    {children}
  </div>
);

const FuelHourlyChart: React.FC<Props> = ({ data, loading, error }) => {
  const [metric, setMetric] = useState<Metric>('amount');
  const current = METRICS[metric];

  const selector = (
    <select
      value={metric}
      onChange={(e) => setMetric(e.target.value as Metric)}
      className="h-6 px-1.5 text-xs border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="amount">Monto</option>
      <option value="volume">Volumen</option>
      <option value="txCount">Transacciones</option>
    </select>
  );

  if (loading) {
    return (
      <Shell right={selector}>
        <div className="p-3 flex items-center justify-center h-[260px]">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell right={selector}>
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
      <Shell right={selector}>
        <div className="p-3 flex flex-col items-center justify-center h-[220px] text-xs text-text-muted">
          <BarChart3 className="w-5 h-5 mb-2" />
          <p>Sin actividad horaria</p>
        </div>
      </Shell>
    );
  }

  const filled = fillHours(data);

  return (
    <Shell right={selector}>
      <div className="p-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filled} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
              <Tooltip content={<CustomTooltip />} contentStyle={tooltipContentStyle} />
              <Bar dataKey={metric} name={current.label} fill={current.color} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
};

export default FuelHourlyChart;
