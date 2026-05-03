import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../../../utils/dashboardUtils';
import { PeriodComparisonResult } from '../../../../services/fuelDashboardExtraTypes';

interface Props {
  data: PeriodComparisonResult | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
}

interface KpiSpec {
  label: string;
  value: string;
  changePct: number | null;
  color: string;
}

const renderDelta = (changePct: number | null) => {
  if (changePct === null) {
    return (
      <span className="inline-flex items-center gap-1 text-2xs text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-sm">
        <Sparkles className="w-3 h-3" /> Nuevo período
      </span>
    );
  }
  if (changePct === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-2xs text-text-muted">
        <Minus className="w-3 h-3" /> 0%
      </span>
    );
  }
  const positive = changePct > 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  const cls = positive ? 'text-green-600' : 'text-red-600';
  const sign = positive ? '+' : '';
  return (
    <span className={`inline-flex items-center gap-1 text-2xs font-medium ${cls}`}>
      <Icon className="w-3 h-3" />
      {sign}
      {changePct.toFixed(1)}%
    </span>
  );
};

const Card: React.FC<{ spec: KpiSpec }> = ({ spec }) => (
  <div className="bg-white rounded-sm p-3 border border-table-border">
    <p className="text-2xs text-text-muted uppercase tracking-wide">{spec.label}</p>
    <p className={`text-md font-bold ${spec.color}`}>{spec.value}</p>
    <div className="mt-1">{renderDelta(spec.changePct)}</div>
  </div>
);

const Skeleton: React.FC = () => (
  <div className="grid grid-cols-4 gap-2">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-sm p-3 border border-table-border animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
        <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-12" />
      </div>
    ))}
  </div>
);

const PeriodComparisonKpis: React.FC<Props> = ({ data, isLoading, isFetching, error, onRetry }) => {
  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-sm p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4" />
          <span>Error cargando KPIs comparativos.</span>
        </div>
        <button onClick={onRetry} className="text-xs text-red-700 hover:underline flex items-center gap-1">
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} /> Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const specs: KpiSpec[] = [
    {
      label: 'Transacciones',
      value: formatNumber(data.current.txCount),
      changePct: data.change.txCountChangePct,
      color: 'text-blue-600',
    },
    {
      label: 'Volumen',
      value: `${data.current.totalVolume.toFixed(2)} G.`,
      changePct: data.change.volumeChangePct,
      color: 'text-orange-600',
    },
    {
      label: 'Monto',
      value: formatCurrency(data.current.totalAmount),
      changePct: data.change.amountChangePct,
      color: 'text-green-600',
    },
    {
      label: 'Ticket Prom.',
      value: formatCurrency(data.current.avgTicket),
      changePct: data.change.avgTicketChangePct,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {specs.map((s) => (
        <Card key={s.label} spec={s} />
      ))}
    </div>
  );
};

export default PeriodComparisonKpis;
