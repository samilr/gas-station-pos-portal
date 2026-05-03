import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CreditCard, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../../../utils/dashboardUtils';
import { PaymentMethodRow } from '../../../../services/fuelDashboardExtraTypes';

interface Props {
  data: PaymentMethodRow[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
}

const sectionHeaderClass =
  'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

// Colores estables para métodos de pago — primero EF (efectivo), luego paleta cíclica.
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];
const colorFor = (paymentId: string, idx: number): string => {
  if (paymentId === 'EF') return '#10B981';
  return COLORS[idx % COLORS.length];
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
  const row = payload[0].payload as PaymentMethodRow;
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-md p-2 text-xs">
      <p className="font-semibold text-text-primary">{row.paymentName}</p>
      <p className="text-green-600">{formatCurrency(row.amount)}</p>
      <p className="text-text-muted">
        {row.txCount} trans · {row.sharePct.toFixed(1)}%
      </p>
    </div>
  );
};

const PaymentMethodsDonut: React.FC<Props> = ({ data, isLoading, isFetching, error, onRetry }) => {
  return (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={sectionHeaderClass}>
        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
          Métodos de Pago
        </span>
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
              <span>No se pudo cargar el mix de pagos.</span>
            </div>
            <button onClick={onRetry} className="hover:underline flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} /> Reintentar
            </button>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px] text-text-muted text-xs">
            <BarChart3 className="w-8 h-8 mb-2 text-gray-300" />
            Sin datos en el período seleccionado
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 items-center">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="paymentName"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.map((row, idx) => (
                      <Cell key={row.paymentId} fill={colorFor(row.paymentId, idx)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1 text-xs">
              {data.map((row, idx) => (
                <li key={row.paymentId} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-sm flex-shrink-0"
                      style={{ background: colorFor(row.paymentId, idx) }}
                    />
                    <span className="truncate text-text-primary">{row.paymentName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-text-secondary">
                    <span className="font-mono">{formatCurrency(row.amount)}</span>
                    <span className="text-text-muted text-2xs">{row.sharePct.toFixed(1)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodsDonut;
