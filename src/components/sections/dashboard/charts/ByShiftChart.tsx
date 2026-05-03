import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../../../utils/dashboardUtils';
import { ByShiftRow } from '../../../../services/fuelDashboardExtraTypes';

interface Props {
  data: ByShiftRow[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
}

const sectionHeaderClass =
  'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

const formatShiftHour = (h: string | null): string => {
  if (!h || h.length < 4) return '—';
  return `${h.slice(0, 2)}:${h.slice(2, 4)}`;
};

const tooltipStyle: React.CSSProperties = {
  fontSize: 12,
  padding: 8,
  border: '1px solid #e5e7eb',
  borderRadius: 2,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as ByShiftRow & { label: string };
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-md p-2 text-xs space-y-0.5">
      <p className="font-semibold text-text-primary">{row.label}</p>
      <p className="text-green-600">Monto: {formatCurrency(row.amount)}</p>
      <p className="text-blue-600">Trans: {formatNumber(row.txCount)}</p>
      <p className="text-orange-600">Vol: {row.volume.toFixed(2)} G.</p>
      <p className="text-purple-600">Ticket prom.: {formatCurrency(row.avgTicket)}</p>
      {row.topStaftName && (
        <p className="text-text-muted">Top: {row.topStaftName} ({formatCurrency(row.topStaftAmount)})</p>
      )}
    </div>
  );
};

const ByShiftChart: React.FC<Props> = ({ data, isLoading, isFetching, error, onRetry }) => {
  const enriched = (data ?? []).map((r) => ({
    ...r,
    label: `T${r.shiftNumber} · ${formatShiftHour(r.entryHour)}–${formatShiftHour(r.departureHour)}`,
  }));

  return (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={sectionHeaderClass}>
        <Users className="w-3.5 h-3.5 text-orange-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
          Performance por Turno
        </span>
      </div>

      <div className="p-3 min-h-[260px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[240px]">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-between p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>No se pudo cargar el desglose por turno.</span>
            </div>
            <button onClick={onRetry} className="hover:underline flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} /> Reintentar
            </button>
          </div>
        ) : enriched.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px] text-text-muted text-xs">
            <BarChart3 className="w-8 h-8 mb-2 text-gray-300" />
            Sin turnos definidos
          </div>
        ) : (
          <>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enriched} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip content={<CustomTooltip />} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="amount" fill="#10B981" name="Monto" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {enriched.map((r) => (
                <div key={r.shiftNumber} className="text-2xs bg-gray-50 rounded-sm px-2 py-1">
                  <div className="text-text-muted">Top T{r.shiftNumber}</div>
                  <div className="font-medium text-text-primary truncate">
                    {r.topStaftName ?? '—'}
                  </div>
                  <div className="text-text-secondary">{formatCurrency(r.topStaftAmount)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ByShiftChart;
