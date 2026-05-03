import React, { useMemo } from 'react';
import { Users, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../../../utils/dashboardUtils';
import { ByStaftRow } from '../../../../services/fuelDashboardExtraTypes';

interface Props {
  data: ByStaftRow[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
}

const sectionHeaderClass =
  'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

const TopStaftTable: React.FC<Props> = ({ data, isLoading, isFetching, error, onRetry }) => {
  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.amount - a.amount);
  }, [data]);

  const maxAmount = sorted[0]?.amount ?? 0;

  return (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={`${sectionHeaderClass} justify-between`}>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
            Top Vendedores
          </span>
        </div>
        <span className="text-2xs text-text-muted">{sorted.length} cajeros</span>
      </div>

      <div className="p-3 min-h-[260px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[240px]">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-between p-2 border border-red-200 bg-red-50 rounded-sm text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>No se pudo cargar el ranking.</span>
            </div>
            <button onClick={onRetry} className="hover:underline flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} /> Reintentar
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px] text-text-muted text-xs">
            <BarChart3 className="w-8 h-8 mb-2 text-gray-300" />
            Sin vendedores en el período
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-2xs uppercase tracking-wide text-text-muted border-b border-table-border">
                <th className="text-left py-1 px-1">#</th>
                <th className="text-left py-1 px-1">Vendedor</th>
                <th className="text-right py-1 px-1">Tx</th>
                <th className="text-right py-1 px-1">Vol.</th>
                <th className="text-right py-1 px-1">Monto</th>
                <th className="text-right py-1 px-1">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 10).map((r, idx) => {
                const isUnattributed = r.staftId === null;
                const pct = maxAmount > 0 ? (r.amount / maxAmount) * 100 : 0;
                return (
                  <tr
                    key={r.staftId ?? `unattributed-${idx}`}
                    className="border-b border-table-border hover:bg-row-hover"
                  >
                    <td className="py-1 px-1 text-text-muted">{idx + 1}</td>
                    <td className="py-1 px-1">
                      <div className="flex items-center gap-1.5">
                        {isUnattributed ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs bg-amber-100 text-amber-700">
                            Sin atribuir
                          </span>
                        ) : (
                          <span className="text-text-primary font-medium">
                            {r.staftName ?? `Cajero #${r.staftId}`}
                          </span>
                        )}
                        {!isUnattributed && (
                          <span className="text-2xs text-text-muted font-mono">#{r.staftId}</span>
                        )}
                      </div>
                      <div className="h-1 mt-0.5 bg-gray-100 rounded-sm overflow-hidden">
                        <div
                          className={`h-full ${isUnattributed ? 'bg-amber-400' : 'bg-blue-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-1 px-1 text-right font-mono">{formatNumber(r.txCount)}</td>
                    <td className="py-1 px-1 text-right font-mono">{r.volume.toFixed(1)}</td>
                    <td className="py-1 px-1 text-right font-mono font-medium">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-1 px-1 text-right font-mono text-text-secondary">
                      {formatCurrency(r.avgTicket)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TopStaftTable;
