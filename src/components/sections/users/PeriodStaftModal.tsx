import React, { useState } from 'react';
import { X, Save, CalendarClock, RefreshCw, Lock, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { periodStaftService } from '../../../services/periodStaftService';
import { IPeriodStaft } from '../../../types/periodStaft';
import { CompactButton } from '../../ui';
import { SiteAutocomplete, StaftAutocomplete, StaftGroupAutocomplete, TerminalAutocomplete } from '../../ui/autocompletes';
import { toLocalIsoDate } from '../../../utils/dateUtils';

interface Props {
  row: IPeriodStaft | null;
  defaultSiteId?: string | null;
  defaultDate?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const toDateInput = (d: string | null | undefined): string => {
  if (!d) return '';
  return d.length >= 10 ? d.substring(0, 10) : d;
};

const toHourInput = (h: string | null | undefined): string => {
  if (!h) return '';
  // Acepta "HHmmss", "HH:mm:ss" y "HH:mm".
  const digits = String(h).replace(/\D/g, '').padStart(6, '0').substring(0, 6);
  return `${digits.substring(0, 2)}:${digits.substring(2, 4)}`;
};

const fromHourInput = (h: string): string => {
  if (!h) return '';
  const [hh, mm] = h.split(':');
  return `${(hh ?? '00').padStart(2, '0')}${(mm ?? '00').padStart(2, '0')}00`;
};

const defaultEntryForShift: Record<number, string> = { 1: '06:00', 2: '14:00', 3: '22:00' };
const defaultDepartureForShift: Record<number, string> = { 1: '14:00', 2: '22:00', 3: '06:00' };

const PeriodStaftModal: React.FC<Props> = ({ row, defaultSiteId, defaultDate, onClose, onSaved }) => {
  const isEdit = !!row;

  const [form, setForm] = useState({
    siteId: row?.siteId ?? defaultSiteId ?? '',
    date: toDateInput(row?.date) || defaultDate || toLocalIsoDate(),
    shift: row?.shift ?? 1,
    staftId: row?.staftId ?? null as number | null,
    isManager: row?.isManager ?? false,
    entryHour: toHourInput(row?.entryHour) || defaultEntryForShift[1],
    departureHour: toHourInput(row?.departureHour) || defaultDepartureForShift[1],
    terminalId: row?.terminalId ?? null as number | null,
    staftGroupId: row?.staftGroupId ?? null as number | null,
    sectorId: row?.sectorId ?? null as number | null,
    cashFund: row?.cashFund ?? 0,
    statementNumber: row?.statementNumber ?? null as number | null,
    closed: row?.closed ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleShiftChange = (s: number) => {
    setForm(f => ({
      ...f,
      shift: s,
      entryHour: isEdit ? f.entryHour : defaultEntryForShift[s] ?? f.entryHour,
      departureHour: isEdit ? f.departureHour : defaultDepartureForShift[s] ?? f.departureHour,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.siteId || !form.staftId) {
      toast.error('Sucursal y cajero son requeridos');
      return;
    }
    setSaving(true);

    const body = {
      entryHour: fromHourInput(form.entryHour),
      departureHour: fromHourInput(form.departureHour),
      terminalId: form.terminalId,
      staftGroupId: form.staftGroupId,
      sectorId: form.sectorId,
      cashFund: Number(form.cashFund) || 0,
      statementNumber: form.statementNumber,
      isManager: form.isManager,
    };

    const res = isEdit
      ? await periodStaftService.update(row!.siteId, row!.date, row!.shift, row!.staftId, {
          ...body,
          closed: form.closed,
          closedAt: form.closed ? (row?.closedAt ?? new Date().toISOString()) : null,
        })
      : await periodStaftService.create({
          siteId: form.siteId,
          date: form.date,
          shift: form.shift,
          staftId: form.staftId!,
          ...body,
        });

    setSaving(false);
    if (res.successful) {
      toast.success(isEdit ? 'Programación actualizada' : 'Programación creada');
      onSaved();
    } else {
      toast.error(res.error || 'Error al guardar');
    }
  };

  const inputCls = 'w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';

  const pkLabel = (text: string) => (
    <span className="inline-flex items-center gap-1">
      {text}
      {isEdit && <Lock className="w-2.5 h-2.5 text-gray-400" />}
    </span>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{isEdit ? 'Editar Programación' : 'Nueva Programación de Cajero'}</h3>
              <p className="text-2xs text-text-muted">{isEdit ? 'Modifica horarios, terminal, grupo, fondo o cierre' : 'Asignar cajero a un turno y fecha'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isEdit && (
            <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-sm text-xs text-blue-800">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                Los campos con <Lock className="inline w-2.5 h-2.5 mx-0.5" /> forman la clave única de la programación y no se pueden modificar.
                Para reasignar a otro cajero, turno o fecha elimina esta entrada y crea una nueva.
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">{pkLabel('Sucursal *')}</label>
              <SiteAutocomplete value={form.siteId || null} onChange={(v) => setForm(f => ({ ...f, siteId: v ?? '' }))} disabled={isEdit} required />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">{pkLabel('Fecha *')}</label>
              <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                disabled={isEdit} required className={inputCls} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">{pkLabel('Turno *')}</label>
              <select value={form.shift} onChange={(e) => handleShiftChange(Number(e.target.value))}
                disabled={isEdit} required className={`${inputCls} bg-white`}>
                <option value={1}>1 · 06-14</option>
                <option value={2}>2 · 14-22</option>
                <option value={3}>3 · 22-06</option>
              </select>
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">{pkLabel('Cajero *')}</label>
              <StaftAutocomplete
                value={form.staftId}
                onChange={(v) => setForm(f => ({ ...f, staftId: v }))}
                siteId={form.siteId || null}
                disabled={isEdit}
                required
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Hora Entrada</label>
              <input type="time" value={form.entryHour} onChange={(e) => setForm(f => ({ ...f, entryHour: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Hora Salida</label>
              <input type="time" value={form.departureHour} onChange={(e) => setForm(f => ({ ...f, departureHour: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Terminal</label>
              <TerminalAutocomplete value={form.terminalId} onChange={(v) => setForm(f => ({ ...f, terminalId: v }))} siteId={form.siteId || null} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Grupo de Cajeros</label>
              <StaftGroupAutocomplete value={form.staftGroupId} onChange={(v) => setForm(f => ({ ...f, staftGroupId: v }))} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Sector ID</label>
              <input type="number" value={form.sectorId ?? ''} onChange={(e) => setForm(f => ({ ...f, sectorId: e.target.value === '' ? null : Number(e.target.value) }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Fondo de Caja</label>
              <input type="number" step="0.01" value={form.cashFund} onChange={(e) => setForm(f => ({ ...f, cashFund: Number(e.target.value) }))} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Statement Number</label>
              <input type="number" value={form.statementNumber ?? ''} onChange={(e) => setForm(f => ({ ...f, statementNumber: e.target.value === '' ? null : Number(e.target.value) }))} className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <input type="checkbox" checked={form.isManager} onChange={(e) => setForm(f => ({ ...f, isManager: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Es Manager
            </label>
            {isEdit && (
              <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                <input type="checkbox" checked={form.closed} onChange={(e) => setForm(f => ({ ...f, closed: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Cerrado
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
          <CompactButton type="submit" variant="primary" disabled={saving}>
            {saving ? <><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</> : <><Save className="w-3 h-3" /> Guardar</>}
          </CompactButton>
        </div>
      </form>
    </div>
  );
};

export default PeriodStaftModal;
