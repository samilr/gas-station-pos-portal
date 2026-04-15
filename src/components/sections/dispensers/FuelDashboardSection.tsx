import React, { useEffect, useState } from 'react';
import { RefreshCw, BarChart3, Fuel, DollarSign, Receipt, Layers, Building2 } from 'lucide-react';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton } from '../../ui';
import { formatCurrency, formatNumber } from '../../../utils/dashboardUtils';
import useFuelDashboard, { FuelRangePeriod } from '../../../hooks/useFuelDashboard';
import FuelDailyTrendChart from './charts/FuelDailyTrendChart';
import FuelByPumpChart from './charts/FuelByPumpChart';
import FuelByFuelGradeChart from './charts/FuelByFuelGradeChart';
import FuelHourlyChart from './charts/FuelHourlyChart';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';

const PERIOD_LABEL: Record<FuelRangePeriod, string> = {
  today: 'Hoy',
  '7d': '7 días',
  '30d': '30 días',
  custom: 'Personalizado',
};

const sectionHeaderClass = 'flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border';

const FuelDashboardSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const dash = useFuelDashboard({ initialPeriod: '7d', topLimit: 10 });
  const [customStart, setCustomStart] = useState(dash.filters.startDate || '');
  const [customEnd, setCustomEnd] = useState(dash.filters.endDate || '');

  useEffect(() => {
    setSubtitle('Resumen operacional de combustible');
    return () => setSubtitle('');
  }, [setSubtitle]);

  const handlePeriod = (p: FuelRangePeriod) => {
    if (p === 'custom') {
      if (customStart && customEnd) dash.setRange('custom', customStart, customEnd);
      return;
    }
    dash.setRange(p);
  };

  const kpis = [
    { title: 'Transacciones', value: formatNumber(dash.summary?.txCount ?? 0), icon: Receipt, color: 'text-blue-600' },
    { title: 'Volumen Total', value: `${formatNumber(dash.summary?.totalVolume ?? 0)} G.`, icon: Fuel, color: 'text-green-600' },
    { title: 'Monto Total', value: formatCurrency(dash.summary?.totalAmount ?? 0), icon: DollarSign, color: 'text-orange-600' },
    { title: 'Ticket Prom.', value: formatCurrency(dash.summary?.avgTicket ?? 0), icon: BarChart3, color: 'text-purple-600' },
    { title: 'Bombas Activas', value: formatNumber(dash.summary?.uniquePumps ?? 0), icon: Layers, color: 'text-cyan-600' },
    { title: 'Sucursales', value: formatNumber(dash.summary?.uniqueSites ?? 0), icon: Building2, color: 'text-pink-600' },
  ];

  return (
    <div className="space-y-2">
      {/* Toolbar de filtros */}
      <div className="bg-white rounded-sm border border-table-border">
        <div className={sectionHeaderClass}>
          <BarChart3 className="w-3.5 h-3.5 text-orange-600" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
            Filtros
          </span>
          <div className="ml-auto">
            <CompactButton variant="ghost" onClick={dash.refresh}>
              <RefreshCw className={`w-3 h-3 ${dash.loading ? 'animate-spin' : ''}`} /> Actualizar
            </CompactButton>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-2">
          <div className="flex items-center gap-1">
            {(['today', '7d', '30d'] as FuelRangePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriod(p)}
                className={`px-2 h-6 text-2xs rounded-sm border transition-colors ${
                  dash.period === p
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-text-muted hover:bg-gray-50'
                }`}
              >
                {PERIOD_LABEL[p]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-2xs text-text-muted">
            <span>Desde</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-6 px-1 border border-gray-200 rounded-sm text-2xs"
            />
            <span>Hasta</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-6 px-1 border border-gray-200 rounded-sm text-2xs"
            />
            <button
              onClick={() => handlePeriod('custom')}
              disabled={!customStart || !customEnd}
              className="px-2 h-6 text-2xs rounded-sm border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              Aplicar
            </button>
          </div>
          <label className="flex items-center gap-1 text-2xs text-text-muted ml-auto">
            <input
              type="checkbox"
              checked={dash.filters.excludeOffline ?? true}
              onChange={(e) => dash.setFilters({ excludeOffline: e.target.checked })}
              className="w-3 h-3"
            />
            Excluir offline
          </label>
        </div>
      </div>

      {/* Error global */}
      {dash.error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">
          {dash.error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.title}
              className="bg-white rounded-sm p-2 border border-table-border hover:bg-row-hover transition-colors">
              <div className="flex items-center gap-1 mb-0.5">
                <Icon className={`w-3 h-3 ${k.color}`} />
                <p className="text-2xs text-text-muted uppercase tracking-wide">{k.title}</p>
              </div>
              <p className={`text-md font-bold ${k.color}`}>{k.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tendencia diaria full-width */}
      <FuelDailyTrendChart data={dash.dailyTrend} loading={dash.loading} error={dash.error} />

      {/* Por bomba + por grado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <FuelByPumpChart data={dash.byPump} loading={dash.loading} error={dash.error} />
        <FuelByFuelGradeChart data={dash.byFuelGrade} loading={dash.loading} error={dash.error} />
      </div>

      {/* Hourly + Top transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <FuelHourlyChart data={dash.hourly} loading={dash.loading} error={dash.error} />

        <div className="bg-white rounded-sm border border-table-border">
          <div className={sectionHeaderClass}>
            <Receipt className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
              Top Transacciones
            </span>
            <span className="ml-auto text-2xs text-text-muted">{dash.top.length}</span>
          </div>
          <div className="overflow-auto max-h-[260px]">
            <table className="w-full text-xs">
              <thead className="bg-table-header sticky top-0">
                <tr className="text-text-muted">
                  <th className="text-left px-2 py-1 font-medium">#</th>
                  <th className="text-left px-2 py-1 font-medium">Bomba</th>
                  <th className="text-left px-2 py-1 font-medium">Producto</th>
                  <th className="text-right px-2 py-1 font-medium">Vol.</th>
                  <th className="text-right px-2 py-1 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {dash.top.length === 0 && !dash.loading && (
                  <tr><td colSpan={5} className="px-2 py-4 text-center text-text-muted">Sin datos</td></tr>
                )}
                {dash.top.map((t) => (
                  <tr key={t.transactionId} className="border-t border-table-border hover:bg-row-hover">
                    <td className="px-2 py-1 text-text-secondary">{t.transactionId}</td>
                    <td className="px-2 py-1">#{t.pump}</td>
                    <td className="px-2 py-1 truncate">{mapFuelProductName(t.fuelGradeName)}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{t.volume.toFixed(2)}</td>
                    <td className="px-2 py-1 text-right tabular-nums font-medium text-orange-700">{formatCurrency(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelDashboardSection;
