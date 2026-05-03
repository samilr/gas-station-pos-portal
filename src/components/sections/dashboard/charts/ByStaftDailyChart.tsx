import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../../../utils/dashboardUtils';
import { ByStaftByDayRow } from '../../../../services/fuelDashboardExtraTypes';

interface Props {
  data: ByStaftByDayRow[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
}

type Metric = 'amount' | 'volume' | 'txCount';

const sectionHeaderClass =
  'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

// Paleta estable; el índice se asigna por orden de aparición.
const PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444',
  '#06B6D4', '#EC4899', '#84CC16',
];

const colorForIndex = (idx: number): string => PALETTE[idx % PALETTE.length];

const formatDay = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
};

const TOP_LIMIT = 8;

const tooltipStyle: React.CSSProperties = {
  fontSize: 11,
  padding: 8,
  border: '1px solid #e5e7eb',
  borderRadius: 2,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

const ByStaftDailyChart: React.FC<Props> = ({ data, isLoading, isFetching, error, onRetry }) => {
  const [metric, setMetric] = useState<Metric>('amount');

  const { pivot, staftKeys, staftLabels } = useMemo(() => {
    if (!data || data.length === 0) {
      return { pivot: [] as Record<string, any>[], staftKeys: [] as string[], staftLabels: {} as Record<string, string> };
    }

    // Identificar top N cashiers por monto total y agrupar el resto.
    const totals = new Map<string, { name: string; total: number }>();
    for (const row of data) {
      const key = row.staftId === null ? '__unattributed__' : `id_${row.staftId}`;
      const name = row.staftId === null ? 'Sin atribuir' : (row.staftName ?? `#${row.staftId}`);
      const t = totals.get(key) ?? { name, total: 0 };
      t.total += row.amount;
      totals.set(key, t);
    }

    const sortedKeys = [...totals.entries()].sort((a, b) => b[1].total - a[1].total);
    const topKeys = new Set(sortedKeys.slice(0, TOP_LIMIT).map(([k]) => k));
    const hasOthers = sortedKeys.length > TOP_LIMIT;

    // Pivotar.
    const byDate = new Map<string, Record<string, any>>();
    const labels: Record<string, string> = {};

    for (const row of data) {
      const dateKey = row.date.slice(0, 10);
      const rawKey = row.staftId === null ? '__unattributed__' : `id_${row.staftId}`;
      const key = topKeys.has(rawKey) ? rawKey : '__others__';
      const label =
        row.staftId === null
          ? 'Sin atribuir'
          : (row.staftName ?? `#${row.staftId}`);
      labels[key] = key === '__others__' ? 'Otros' : label;

      const value = row[metric];
      const bucket = byDate.get(dateKey) ?? { date: dateKey };
      bucket[key] = (bucket[key] ?? 0) + value;
      byDate.set(dateKey, bucket);
    }

    const pivotArr = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    const orderedKeys = [...sortedKeys.slice(0, TOP_LIMIT).map(([k]) => k)];
    if (hasOthers) orderedKeys.push('__others__');

    // Asegurar 0 en celdas faltantes para que las líneas conecten bien.
    for (const row of pivotArr) {
      for (const k of orderedKeys) {
        if (row[k] === undefined) row[k] = 0;
      }
    }

    return { pivot: pivotArr, staftKeys: orderedKeys, staftLabels: labels };
  }, [data, metric]);

  const formatTickValue = (v: number) => {
    if (metric === 'txCount') return formatNumber(v);
    if (metric === 'volume') return v.toFixed(0);
    return formatNumber(v);
  };

  const formatTooltipValue = (v: number) => {
    if (metric === 'txCount') return `${formatNumber(v)} tx`;
    if (metric === 'volume') return `${v.toFixed(2)} G.`;
    return formatCurrency(v);
  };

  return (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={`${sectionHeaderClass} justify-between`}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
            Vendedores por día
          </span>
        </div>
        <div className="flex items-center gap-1 text-2xs">
          {(['amount', 'volume', 'txCount'] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`h-6 px-2 rounded-sm border ${
                metric === m
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-text-secondary'
              }`}
            >
              {m === 'amount' ? 'Monto' : m === 'volume' ? 'Volumen' : 'Tx'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-between p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>No se pudo cargar la serie por vendedor.</span>
            </div>
            <button onClick={onRetry} className="hover:underline flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} /> Reintentar
            </button>
          </div>
        ) : pivot.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[280px] text-text-muted text-xs">
            <BarChart3 className="w-8 h-8 mb-2 text-gray-300" />
            Sin actividad de vendedores
          </div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pivot} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={formatTickValue} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={formatDay}
                  formatter={(value: number, name: string) => [formatTooltipValue(value), staftLabels[name] ?? name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value: string) => staftLabels[value] ?? value}
                />
                {staftKeys.map((k, idx) => (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    stroke={k === '__others__' ? '#9CA3AF' : colorForIndex(idx)}
                    strokeWidth={1.8}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ByStaftDailyChart;
