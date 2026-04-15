import React from 'react';
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

const sectionHeaderClass = 'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

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
      <p className="text-orange-600">Monto: {formatCurrency(r.amount)}</p>
      <p className="text-green-600">Volumen: {r.volume.toFixed(2)} G.</p>
      <p className="text-text-muted">{r.txCount} transacciones</p>
    </div>
  );
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-sm border border-table-border">
    <div className={sectionHeaderClass}>
      <Clock className="w-3.5 h-3.5 text-orange-600" />
      <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
        Distribución por Hora del Día
      </span>
    </div>
    {children}
  </div>
);

const FuelHourlyChart: React.FC<Props> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Shell>
        <div className="p-3 flex items-center justify-center h-[260px]">
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
        <div className="p-3 flex flex-col items-center justify-center h-[220px] text-xs text-text-muted">
          <BarChart3 className="w-5 h-5 mb-2" />
          <p>Sin actividad horaria</p>
        </div>
      </Shell>
    );
  }

  const filled = fillHours(data);

  return (
    <Shell>
      <div className="p-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filled} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
              <Tooltip content={<CustomTooltip />} contentStyle={tooltipContentStyle} />
              <Bar dataKey="amount" name="Monto (RD$)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
};

export default FuelHourlyChart;
