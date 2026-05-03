import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { CompactButton } from '../../ui';
import { SiteAutocomplete } from '../../ui/autocompletes';
import { FuelDashboardFilters } from '../../../services/fuelTransactionService';
import { toLocalIsoDate } from '../../../utils/dateUtils';

interface Props {
  filters: FuelDashboardFilters;
  onChange: (next: FuelDashboardFilters) => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

const presetRanges = [
  { id: 'today', label: 'Hoy' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
] as const;

const computePreset = (id: 'today' | '7d' | '30d'): { startDate: string; endDate: string } => {
  const today = new Date();
  const end = toLocalIsoDate(today);
  if (id === 'today') return { startDate: end, endDate: end };
  const days = id === '7d' ? 6 : 29;
  const s = new Date(today);
  s.setDate(s.getDate() - days);
  return { startDate: toLocalIsoDate(s), endDate: end };
};

const FuelDashboardFiltersBar: React.FC<Props> = ({ filters, onChange, onRefresh, refreshing }) => {
  const setPreset = (id: 'today' | '7d' | '30d') => {
    onChange({ ...filters, ...computePreset(id) });
  };

  const matchesPreset = (id: 'today' | '7d' | '30d'): boolean => {
    const p = computePreset(id);
    return filters.startDate === p.startDate && filters.endDate === p.endDate;
  };

  return (
    <div className="bg-white rounded-sm border border-table-border px-3 py-2 flex flex-wrap items-center gap-2">
      <Calendar className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />

      <div className="flex items-center gap-1">
        {presetRanges.map((p) => (
          <button
            key={p.id}
            onClick={() => setPreset(p.id)}
            className={`h-7 px-2 text-xs rounded-sm border transition-colors ${
              matchesPreset(p.id)
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                : 'bg-white border-gray-300 text-text-secondary hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <span className="text-2xs text-text-muted">·</span>

      <input
        type="date"
        value={filters.startDate ?? ''}
        onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
        className="h-7 px-2 text-xs border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <span className="text-2xs text-text-muted">→</span>
      <input
        type="date"
        value={filters.endDate ?? ''}
        onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
        className="h-7 px-2 text-xs border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <span className="text-2xs text-text-muted">·</span>

      <div className="min-w-[200px]">
        <SiteAutocomplete
          value={filters.siteId ?? null}
          onChange={(siteId) => onChange({ ...filters, siteId: siteId ?? null })}
          allowClear
          placeholder="Todas las sucursales"
        />
      </div>

      <label className="flex items-center gap-1 text-xs text-text-secondary cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.excludeOffline ?? true}
          onChange={(e) => onChange({ ...filters, excludeOffline: e.target.checked })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Excluir offline
      </label>

      <div className="ml-auto">
        <CompactButton variant="ghost" onClick={onRefresh} disabled={refreshing} title="Actualizar">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </CompactButton>
      </div>
    </div>
  );
};

export default FuelDashboardFiltersBar;
