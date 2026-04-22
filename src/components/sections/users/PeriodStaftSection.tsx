import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Filter, X, Copy, Lock, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { periodStaftService } from '../../../services/periodStaftService';
import { IPeriodStaft, SHIFT_LABELS } from '../../../types/periodStaft';
import { CompactButton, Toolbar } from '../../ui';
import { SiteAutocomplete } from '../../ui/autocompletes';
import PeriodStaftModal from './PeriodStaftModal';
import DuplicateDayDialog from './DuplicateDayDialog';

const todayIso = () => new Date().toISOString().substring(0, 10);

const formatHour = (h: string | null | undefined): string => {
  if (!h) return '';
  const s = String(h).padStart(6, '0');
  return `${s.substring(0, 2)}:${s.substring(2, 4)}`;
};

const formatDate = (d: string | null | undefined): string => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('es-DO', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return d.substring(0, 10);
  }
};

const formatCurrency = (n: number | null | undefined): string =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(n ?? 0);

const PeriodStaftSection: React.FC = () => {
  const [rows, setRows] = useState<IPeriodStaft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  const [siteId, setSiteId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(todayIso());
  const [shift, setShift] = useState<number | ''>('');

  const [modal, setModal] = useState<{ show: boolean; row: IPeriodStaft | null }>({ show: false, row: null });
  const [dupDialog, setDupDialog] = useState(false);

  const load = useCallback(async () => {
    // El endpoint exige siteId: no disparamos la llamada hasta tener una sucursal seleccionada.
    if (!siteId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await periodStaftService.list({
      siteId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      shift: shift === '' ? undefined : Number(shift),
    });
    if (res.successful) {
      setRows(res.data);
    } else {
      toast.error(res.error || 'Error al cargar programaciones');
      setRows([]);
    }
    setLoading(false);
  }, [siteId, startDate, endDate, shift]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (r: IPeriodStaft) => {
    if (!confirm(`¿Eliminar programación del cajero ${r.staftId} (${SHIFT_LABELS[r.shift] ?? `Turno ${r.shift}`}, ${formatDate(r.date)})?`)) return;
    const res = await periodStaftService.remove(r.siteId, r.date, r.shift, r.staftId);
    if (res.successful) { toast.success('Programación eliminada'); load(); }
    else toast.error(res.error || 'Error al eliminar');
  };

  const clearFilters = () => {
    setSiteId(null);
    setStartDate(todayIso());
    setEndDate(todayIso());
    setShift('');
  };

  const stats = useMemo(() => {
    const managers = rows.filter(r => r.isManager).length;
    const closed = rows.filter(r => r.closed).length;
    return { total: rows.length, managers, cashiers: rows.length - managers, closed };
  }, [rows]);

  const canCreate = !!siteId;
  const canDuplicate = !!siteId;

  return (
    <div className="space-y-1">
      <Toolbar
        chips={[
          { label: 'Total', value: stats.total, color: 'gray' },
          { label: 'Cajeros', value: stats.cashiers, color: 'green' },
          { label: 'Managers', value: stats.managers, color: 'amber' },
          { label: 'Cerrados', value: stats.closed, color: stats.closed > 0 ? 'blue' : 'gray' },
        ]}
      >
        <CompactButton variant={showFilters ? 'primary' : 'icon'} onClick={() => setShowFilters(!showFilters)} title="Filtros">
          <Filter className="w-3.5 h-3.5" />
        </CompactButton>
        <CompactButton
          variant="primary"
          onClick={() => canCreate && setModal({ show: true, row: null })}
          disabled={!canCreate}
          title={canCreate ? 'Nueva programación' : 'Selecciona una sucursal primero'}
        >
          <Plus className="w-3.5 h-3.5" />Nuevo
        </CompactButton>
        <CompactButton
          variant="ghost"
          onClick={() => canDuplicate && setDupDialog(true)}
          disabled={!canDuplicate}
          title={canDuplicate ? 'Duplicar un día completo' : 'Selecciona una sucursal primero'}
        >
          <Copy className="w-3.5 h-3.5" />Duplicar día
        </CompactButton>
        <CompactButton variant="icon" onClick={load} title="Actualizar">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </Toolbar>

      {showFilters && (
        <div className="bg-white rounded-sm border border-gray-200 p-2 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Filtros</h3>
            </div>
            <CompactButton variant="icon" onClick={() => setShowFilters(false)}><X className="w-3.5 h-3.5" /></CompactButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Sucursal</label>
              <SiteAutocomplete value={siteId} onChange={(v) => setSiteId(v)} />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Desde</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Hasta</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">Turno</label>
              <select value={shift} onChange={(e) => setShift(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 bg-white">
                <option value="">Todos</option>
                <option value={1}>1 · 06-14</option>
                <option value={2}>2 · 14-22</option>
                <option value={3}>3 · 22-06</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-gray-100">
            <CompactButton variant="ghost" onClick={clearFilters}>Limpiar</CompactButton>
            <CompactButton variant="primary" onClick={load}>Aplicar</CompactButton>
          </div>
        </div>
      )}

      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-32 items-center"><div className="animate-spin h-8 w-8 border-b-2 border-teal-600 rounded-full" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  {['Fecha', 'Turno', 'Cajero', 'Manager', 'Entrada', 'Salida', 'Terminal', 'Grupo', 'Fondo', 'Cerrado', 'Acciones'].map(h => (
                    <th key={h} className="px-2 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.siteId}|${r.date}|${r.shift}|${r.staftId}`} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover transition-colors">
                    <td className="px-2 text-sm whitespace-nowrap text-gray-900 font-medium">{formatDate(r.date)}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 text-xs font-semibold">T{r.shift}</span>
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap font-mono text-gray-700">{r.staftId}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      {r.isManager
                        ? <span className="flex items-center gap-0.5 text-amber-600 text-xs font-medium"><Star className="w-3 h-3" />Si</span>
                        : <span className="text-xs text-gray-400">No</span>}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap font-mono text-gray-600">{formatHour(r.entryHour)}</td>
                    <td className="px-2 text-sm whitespace-nowrap font-mono text-gray-600">{formatHour(r.departureHour)}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-700">{r.terminalId ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-700">{r.staftGroupId ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-right font-mono text-gray-700 tabular-nums">{formatCurrency(r.cashFund)}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      {r.closed
                        ? <span className="flex items-center gap-0.5 text-blue-600 text-xs font-medium"><Lock className="w-3 h-3" />Si</span>
                        : <span className="text-xs text-gray-400">No</span>}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ show: true, row: r })} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(r)} className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={11} className="px-2 py-6 text-center text-sm text-gray-400">
                    {siteId ? 'Sin programaciones para los filtros seleccionados' : 'Selecciona una sucursal para ver sus programaciones'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.show && (
        <PeriodStaftModal
          row={modal.row}
          defaultSiteId={siteId}
          defaultDate={startDate}
          onClose={() => setModal({ show: false, row: null })}
          onSaved={() => { setModal({ show: false, row: null }); load(); }}
        />
      )}

      {dupDialog && siteId && (
        <DuplicateDayDialog
          siteId={siteId}
          defaultSourceDate={startDate}
          onClose={() => setDupDialog(false)}
          onDone={() => { setDupDialog(false); load(); }}
        />
      )}
    </div>
  );
};

export default PeriodStaftSection;
