import React, { useMemo, useState } from 'react';
import { Clock, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../../../utils/dashboardUtils';
import { HeatmapCell } from '../../../../services/fuelDashboardExtraTypes';

interface Props {
  data: HeatmapCell[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
}

type Metric = 'txCount' | 'amount';

const sectionHeaderClass =
  'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HOURS = Array.from({ length: 24 }, (_, h) => h);

// Matriz 7×24 inicializada en 0.
const buildMatrix = (cells: HeatmapCell[] = []): { tx: number[][]; amt: number[][] } => {
  const tx: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const amt: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const c of cells) {
    if (c.dayOfWeek < 0 || c.dayOfWeek > 6) continue;
    if (c.hour < 0 || c.hour > 23) continue;
    tx[c.dayOfWeek][c.hour] = c.txCount;
    amt[c.dayOfWeek][c.hour] = c.amount;
  }
  return { tx, amt };
};

const colorFor = (value: number, max: number): string => {
  if (max === 0 || value === 0) return '#F3F4F6'; // gray-100
  const t = Math.min(1, value / max);
  // Interpola de azul claro (#DBEAFE) a azul oscuro (#1D4ED8).
  const r = Math.round(219 - (219 - 29) * t);
  const g = Math.round(234 - (234 - 78) * t);
  const b = Math.round(254 - (254 - 216) * t);
  return `rgb(${r}, ${g}, ${b})`;
};

const HeatmapChart: React.FC<Props> = ({ data, isLoading, isFetching, error, onRetry }) => {
  const [metric, setMetric] = useState<Metric>('txCount');

  const { matrix, max } = useMemo(() => {
    const { tx, amt } = buildMatrix(data ?? []);
    const m = metric === 'txCount' ? tx : amt;
    const flatMax = m.reduce((acc, row) => Math.max(acc, ...row), 0);
    return { matrix: m, max: flatMax };
  }, [data, metric]);

  const isEmpty = !isLoading && !error && (!data || data.length === 0);

  return (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={`${sectionHeaderClass} justify-between`}>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
            Heatmap día × hora
          </span>
        </div>
        <div className="flex items-center gap-1 text-2xs">
          <button
            onClick={() => setMetric('txCount')}
            className={`h-6 px-2 rounded-sm border ${metric === 'txCount' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-text-secondary'}`}
          >
            Tx
          </button>
          <button
            onClick={() => setMetric('amount')}
            className={`h-6 px-2 rounded-sm border ${metric === 'amount' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-text-secondary'}`}
          >
            Monto
          </button>
        </div>
      </div>

      <div className="p-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-between p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>No se pudo cargar el heatmap.</span>
            </div>
            <button onClick={onRetry} className="hover:underline flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} /> Reintentar
            </button>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-text-muted text-xs">
            <BarChart3 className="w-8 h-8 mb-2 text-gray-300" />
            Sin actividad en el período
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Header de horas */}
              <div className="flex items-center pl-8 mb-1">
                {HOURS.map((h) => (
                  <div key={h} className="flex-1 min-w-[14px] text-center text-2xs text-text-muted">
                    {h % 3 === 0 ? h : ''}
                  </div>
                ))}
              </div>
              {/* Filas */}
              {matrix.map((row, dow) => (
                <div key={dow} className="flex items-center mb-0.5">
                  <div className="w-8 text-2xs text-text-muted text-right pr-1.5">{DAYS[dow]}</div>
                  {row.map((value, h) => (
                    <div
                      key={h}
                      className="flex-1 min-w-[14px] h-5 mx-px rounded-sm cursor-default"
                      style={{ background: colorFor(value, max) }}
                      title={`${DAYS[dow]} ${String(h).padStart(2, '0')}:00 — ${
                        metric === 'txCount'
                          ? `${formatNumber(value)} tx`
                          : formatCurrency(value)
                      }`}
                    />
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 mt-2 text-2xs text-text-muted">
                <span>Menos</span>
                <div className="w-3 h-3 rounded-sm" style={{ background: colorFor(0, 1) }} />
                <div className="w-3 h-3 rounded-sm" style={{ background: colorFor(0.25, 1) }} />
                <div className="w-3 h-3 rounded-sm" style={{ background: colorFor(0.5, 1) }} />
                <div className="w-3 h-3 rounded-sm" style={{ background: colorFor(0.75, 1) }} />
                <div className="w-3 h-3 rounded-sm" style={{ background: colorFor(1, 1) }} />
                <span>Más</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapChart;
