import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  UserCog,
  Lock,
  Unlock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fuelPumpShiftService } from '../../../services/fuelPumpShiftService';
import { staftService } from '../../../services/staftService';
import { IFuelPumpShift } from '../../../types/fuelPumpShift';
import { IStaft } from '../../../types/staft';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
import { SiteAutocomplete } from '../../ui/autocompletes';
import { useSelectedSiteId } from '../../../hooks/useSelectedSite';
import { formatTimeOnly } from '../../../utils/dateUtils';
import FuelPumpShiftModal, { FuelPumpShiftModalMode } from './FuelPumpShiftModal';

const todayIso = () => new Date().toISOString().slice(0, 10);

const FuelPumpShiftsSection: React.FC = () => {
  const globalSiteId = useSelectedSiteId();

  const [siteId, setSiteId] = useState<string | null>(globalSiteId ?? null);
  const [date, setDate] = useState<string>(todayIso());
  const [pumpFilter, setPumpFilter] = useState<number | ''>('');

  const [shifts, setShifts] = useState<IFuelPumpShift[]>([]);
  const [staftMap, setStaftMap] = useState<Map<number, IStaft>>(new Map());
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  const [modalState, setModalState] = useState<{
    mode: FuelPumpShiftModalMode;
    context: IFuelPumpShift | null;
  } | null>(null);

  useEffect(() => {
    if (!siteId) return;
    let cancelled = false;
    staftService.getStaftByPista(siteId).then((res) => {
      if (cancelled) return;
      const items = res.successful ? res.data ?? [] : [];
      const m = new Map<number, IStaft>();
      items.forEach((s) => m.set(s.staftId, s));
      setStaftMap(m);
    });
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  const load = useCallback(async () => {
    if (!siteId || !date) {
      setShifts([]);
      return;
    }
    setLoading(true);
    const res = await fuelPumpShiftService.list({
      siteId,
      date,
      pumpId: pumpFilter === '' ? undefined : Number(pumpFilter),
    });
    setLoading(false);
    if (res.successful) {
      const arr = Array.isArray(res.data) ? res.data : [];
      const sorted = [...arr].sort(
        (a, b) => a.pumpId - b.pumpId || a.shift - b.shift || a.line - b.line
      );
      setShifts(sorted);
    } else {
      setShifts([]);
      toast.error(res.error || 'No se pudieron cargar las asignaciones');
    }
  }, [siteId, date, pumpFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const renderStaft = (id: number) => {
    const s = staftMap.get(id);
    return s ? `${s.staftId} - ${s.name}` : String(id);
  };

  const openCreate = () => {
    setModalState({
      mode: 'create',
      context: null,
    });
  };

  const openModal = (mode: FuelPumpShiftModalMode, row: IFuelPumpShift) => {
    setModalState({ mode, context: row });
  };

  const handleReopen = async (row: IFuelPumpShift) => {
    if (!confirm(`¿Reabrir la línea ${row.line} de bomba ${row.pumpId} turno ${row.shift}?`)) return;
    setBusyAction(true);
    const res = await fuelPumpShiftService.reopen(
      row.siteId,
      row.date.slice(0, 10),
      row.pumpId,
      row.shift,
      row.line
    );
    setBusyAction(false);
    if (res.successful) {
      toast.success('Línea reabierta');
      load();
    } else {
      toast.error(res.error || 'No se pudo reabrir');
    }
  };

  const handleDelete = async (row: IFuelPumpShift) => {
    if (
      !confirm(
        `¿Eliminar la línea ${row.line} de bomba ${row.pumpId} turno ${row.shift}? Esta acción no se puede deshacer.`
      )
    )
      return;
    setBusyAction(true);
    const res = await fuelPumpShiftService.remove(
      row.siteId,
      row.date.slice(0, 10),
      row.pumpId,
      row.shift,
      row.line
    );
    setBusyAction(false);
    if (res.successful) {
      toast.success('Línea eliminada');
      load();
    } else {
      toast.error(res.error || 'No se pudo eliminar');
    }
  };

  const chips = useMemo(() => {
    const c: { label: string; value: string | number; color?: string }[] = [];
    if (siteId) c.push({ label: 'Sucursal', value: siteId, color: 'blue' });
    if (date) c.push({ label: 'Fecha', value: date, color: 'gray' });
    c.push({ label: 'Líneas', value: shifts.length, color: 'green' });
    const open = shifts.filter((s) => s.isOpen).length;
    c.push({ label: 'Abiertas', value: open, color: open > 0 ? 'green' : 'gray' });
    return c;
  }, [siteId, date, shifts]);

  return (
    <div className="space-y-1">
      {/* Filters bar */}
      <div className="bg-white rounded-sm border border-gray-200 p-2 flex flex-wrap items-end gap-2">
        <div className="min-w-[200px]">
          <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
            Sucursal
          </label>
          <SiteAutocomplete value={siteId} onChange={(v) => setSiteId(v)} required />
        </div>
        <div>
          <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
            Bomba (filtro)
          </label>
          <input
            type="number"
            min={1}
            placeholder="Todas"
            value={pumpFilter}
            onChange={(e) => setPumpFilter(e.target.value === '' ? '' : Number(e.target.value))}
            className="h-7 w-24 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1" />
        <CompactButton variant="primary" onClick={openCreate} disabled={!siteId}>
          <Plus className="w-3.5 h-3.5" />
          Asignar staff
        </CompactButton>
        <CompactButton variant="icon" onClick={load} disabled={loading || !siteId}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </div>

      <Toolbar chips={chips} />

      {/* Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-32 items-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
          </div>
        ) : !siteId ? (
          <div className="flex flex-col items-center justify-center py-10 text-sm text-gray-400 gap-1">
            <span>Selecciona una sucursal para ver las asignaciones.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  {[
                    'Bomba',
                    'Turno',
                    'Línea',
                    'Cajero',
                    'Estado',
                    'Apertura',
                    'Cierre',
                    'Cerrado por',
                    'Acciones',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shifts.map((row, idx) => {
                  const prev = shifts[idx - 1];
                  const newGroup =
                    !prev || prev.pumpId !== row.pumpId || prev.shift !== row.shift;
                  return (
                    <tr
                      key={`${row.pumpId}-${row.shift}-${row.line}`}
                      className={`h-8 max-h-8 border-b border-table-border hover:bg-row-hover transition-colors ${
                        newGroup ? 'border-t-2 border-t-gray-200' : ''
                      }`}
                    >
                      <td className="px-2 text-sm whitespace-nowrap font-medium text-gray-900">
                        {row.pumpId}
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap text-gray-700">
                        {row.shift}
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap text-gray-700 font-mono">
                        {row.line}
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        {renderStaft(row.staftId)}
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        <StatusDot
                          color={row.isOpen ? 'green' : 'gray'}
                          label={row.isOpen ? 'Abierta' : 'Cerrada'}
                        />
                      </td>
                      <td className="px-2 text-xs whitespace-nowrap text-gray-600 font-mono">
                        {row.openedAt ? formatTimeOnly(row.openedAt) : '—'}
                      </td>
                      <td className="px-2 text-xs whitespace-nowrap text-gray-600 font-mono">
                        {row.closedAt ? formatTimeOnly(row.closedAt) : '—'}
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        {row.closedByStaftId ? renderStaft(row.closedByStaftId) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        <div className="flex gap-1">
                          {row.isOpen ? (
                            <>
                              <button
                                onClick={() => openModal('substitute', row)}
                                disabled={busyAction}
                                className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm disabled:opacity-50"
                                title="Sustituir cajero"
                              >
                                <UserCog className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openModal('close', row)}
                                disabled={busyAction}
                                className="p-0.5 text-amber-600 hover:bg-amber-50 rounded-sm disabled:opacity-50"
                                title="Cerrar línea"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleReopen(row)}
                              disabled={busyAction}
                              className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded-sm disabled:opacity-50"
                              title="Reabrir línea"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openModal('edit', row)}
                            disabled={busyAction}
                            className="p-0.5 text-gray-600 hover:bg-gray-100 rounded-sm disabled:opacity-50"
                            title="Editar cajero"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(row)}
                            disabled={busyAction}
                            className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm disabled:opacity-50"
                            title="Eliminar línea"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {shifts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-2 py-6 text-center text-sm text-gray-400">
                      Sin asignaciones para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalState && (
        <FuelPumpShiftModal
          isOpen={true}
          mode={modalState.mode}
          context={modalState.context}
          defaults={{ siteId, date, pumpId: pumpFilter === '' ? undefined : Number(pumpFilter) }}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            load();
          }}
        />
      )}
    </div>
  );
};

export default FuelPumpShiftsSection;
