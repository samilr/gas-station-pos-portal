import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Fuel, AlertTriangle, BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../../../utils/dashboardUtils';
import type { FuelByPumpRow } from '../../../../services/fuelTransactionService';

interface Props {
  data: FuelByPumpRow[];
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as FuelByPumpRow;
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-md p-2 text-xs">
      <p className="font-semibold text-text-primary">Bomba #{label}</p>
      <p className="text-orange-600">Monto: {formatCurrency(row.amount)}</p>
      <p className="text-green-600">Volumen: {row.volume.toFixed(2)} G.</p>
      <p className="text-text-muted">{row.txCount} transacciones</p>
    </div>
  );
};

type Metric = 'amount' | 'volume';

const FuelByPumpChart: React.FC<Props> = ({ data, loading, error }) => {
  const [metric, setMetric] = useState<Metric>('amount');

  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-sm border border-table-border">
      <div className={sectionHeaderClass}>
        <Fuel className="w-3.5 h-3.5 text-orange-600" />
        <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
          Ventas por Bomba
        </span>
        <div className="ml-auto flex items-center gap-1">
          {(['amount', 'volume'] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2 h-5 text-2xs rounded-sm border transition-colors ${
                metric === m
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-text-muted hover:bg-gray-50'
              }`}
            >
              {m === 'amount' ? 'Monto' : 'Volumen'}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  );

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
          <p>Sin datos por bomba en el período</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="pump" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
              <Tooltip content={<CustomTooltip />} contentStyle={tooltipContentStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey={metric}
                name={metric === 'amount' ? 'Monto (RD$)' : 'Volumen (G.)'}
                fill={metric === 'amount' ? '#f97316' : '#16a34a'}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
};

export default FuelByPumpChart;
