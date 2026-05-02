import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, X, Save, ChevronDown, ChevronRight, Percent, Calendar } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ITax, ITaxType, ITaxLine } from '../../../types/tax';
import { store } from '../../../store';
import {
  taxesApi,
  useCreateTaxMutation,
  useUpdateTaxMutation,
  useDeleteTaxMutation,
  useCreateTaxTypeMutation,
  useUpdateTaxTypeMutation,
  useDeleteTaxTypeMutation,
  useCreateTaxLineMutation,
  useUpdateTaxLineMutation,
  useDeleteTaxLineMutation,
} from '../../../store/api/taxesApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
import { toLocalIsoDate } from '../../../utils/dateUtils';

// --- Tax Modal ---
const TaxModal: React.FC<{ tax: ITax | null; taxTypes: ITaxType[]; onClose: () => void; onSaved: () => void }> = ({ tax, taxTypes, onClose, onSaved }) => {
  const [form, setForm] = useState({ taxId: tax?.taxId || '', name: tax?.name || '', taxTypeId: tax?.taxTypeId ?? 1, active: tax?.active ?? true });
  const [saving, setSaving] = useState(false);
  const [createTax] = useCreateTaxMutation();
  const [updateTax] = useUpdateTaxMutation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (tax) {
        await updateTax({ taxId: form.taxId, body: { name: form.name, taxTypeId: form.taxTypeId, active: form.active } }).unwrap();
      } else {
        await createTax(form).unwrap();
      }
      toast.success(tax ? 'Impuesto actualizado' : 'Impuesto creado');
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al guardar') ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-sm font-semibold text-gray-900">{tax ? 'Editar Impuesto' : 'Nuevo Impuesto'}</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-3 space-y-2">
          <div><label className="text-xs font-medium text-gray-700">Tax ID</label>
            <input value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} disabled={!!tax} required className="w-full mt-1 h-7 px-2 text-sm border border-gray-300 rounded-sm disabled:bg-gray-50" /></div>
          <div><label className="text-xs font-medium text-gray-700">Nombre</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full mt-1 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
          <div><label className="text-xs font-medium text-gray-700">Tipo de Impuesto</label>
            <select value={form.taxTypeId} onChange={e => setForm(f => ({ ...f, taxTypeId: Number(e.target.value) }))} className="w-full mt-1 h-7 px-2 text-sm border border-gray-300 rounded-sm">
              {taxTypes.map(t => <option key={t.taxTypeId} value={t.taxTypeId}>{t.name}</option>)}
            </select></div>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />Activo
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
            <CompactButton type="submit" variant="primary" disabled={saving}>
              <Save className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Guardar'}
            </CompactButton>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Tax Type Modal ---
const TaxTypeModal: React.FC<{ taxType: ITaxType | null; onClose: () => void; onSaved: () => void }> = ({ taxType, onClose, onSaved }) => {
  const [form, setForm] = useState({ taxTypeId: taxType?.taxTypeId ?? 0, name: taxType?.name || '', active: taxType?.active ?? true });
  const [saving, setSaving] = useState(false);
  const [createTaxType] = useCreateTaxTypeMutation();
  const [updateTaxType] = useUpdateTaxTypeMutation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (taxType) {
        await updateTaxType({ taxTypeId: form.taxTypeId, body: { name: form.name, active: form.active } }).unwrap();
      } else {
        await createTaxType(form).unwrap();
      }
      toast.success(taxType ? 'Tipo actualizado' : 'Tipo creado');
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al guardar') ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-sm font-semibold text-gray-900">{taxType ? 'Editar Tipo' : 'Nuevo Tipo'}</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-3 space-y-2">
          {!taxType && <div><label className="text-xs font-medium text-gray-700">Tax Type ID</label>
            <input type="number" value={form.taxTypeId} onChange={e => setForm(f => ({ ...f, taxTypeId: Number(e.target.value) }))} className="w-full mt-1 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>}
          <div><label className="text-xs font-medium text-gray-700">Nombre</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full mt-1 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />Activo
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
            <CompactButton type="submit" variant="primary" disabled={saving}>
              <Save className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Guardar'}
            </CompactButton>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Tax Line Modal ---
const TaxLineModal: React.FC<{
  taxId: string;
  line: ITaxLine | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ taxId, line, onClose, onSaved }) => {
  const [form, setForm] = useState({
    taxId,
    line: line?.line ?? 1,
    rate: line?.rate ?? 0,
    startTime: line?.startTime ? line.startTime.split('T')[0] : toLocalIsoDate(),
    endTime: line?.endTime ? line.endTime.split('T')[0] : '',
    status: line?.status ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [createTaxLine] = useCreateTaxLineMutation();
  const [updateTaxLine] = useUpdateTaxLineMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = {
      startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
      endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
      rate: form.rate,
      status: form.status,
    };
    try {
      if (line) {
        await updateTaxLine({ taxId, line: line.line, body: payload }).unwrap();
      } else {
        await createTaxLine({ taxId, line: form.line, rate: form.rate, startTime: form.startTime, endTime: form.endTime || null, status: form.status }).unwrap();
      }
      toast.success(line ? 'Linea actualizada' : 'Linea creada');
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al guardar') ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-3 border-b">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{line ? 'Editar Linea de Tasa' : 'Nueva Linea de Tasa'}</h2>
            <p className="text-xs text-gray-400">Impuesto {taxId}</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-3 space-y-2">
          {!line && (
            <div><label className="text-xs font-medium text-gray-700">Numero de Linea</label>
              <input type="number" min={1} value={form.line} onChange={e => setForm(f => ({ ...f, line: Number(e.target.value) }))} required className="w-full mt-1 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
          )}
          <div><label className="text-xs font-medium text-gray-700">Tasa (%)</label>
            <div className="relative mt-1">
              <input type="number" step="0.01" min={0} max={100} value={form.rate}
                onChange={e => setForm(f => ({ ...f, rate: Number(e.target.value) }))} required
                className="w-full h-7 pl-2 pr-8 text-sm border border-gray-300 rounded-sm" />
              <span className="absolute right-2 top-1.5 text-gray-400 text-xs font-bold">%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-medium text-gray-700">Fecha Inicio</label>
              <input type="date" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required className="w-full mt-1 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
            <div><label className="text-xs font-medium text-gray-700">Fecha Fin <span className="text-gray-400 font-normal">(opc.)</span></label>
              <input type="date" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="w-full mt-1 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" checked={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.checked }))} className="rounded" />Activa
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
            <CompactButton type="submit" variant="primary" disabled={saving}>
              <Save className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Guardar'}
            </CompactButton>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Tax Lines Sub-table ---
const TaxLinesRow: React.FC<{ taxId: string; onAddLine: () => void }> = ({ taxId, onAddLine }) => {
  const [lines, setLines] = useState<ITaxLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [lineModal, setLineModal] = useState<{ show: boolean; line: ITaxLine | null }>({ show: false, line: null });
  const [deleteTaxLine] = useDeleteTaxLineMutation();

  const loadLines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await store
        .dispatch(taxesApi.endpoints.listTaxLines.initiate(taxId, { forceRefetch: true }))
        .unwrap();
      setLines(data ?? []);
    } catch {
      setLines([]);
    } finally {
      setLoading(false);
    }
  }, [taxId]);

  useEffect(() => { loadLines(); }, [loadLines]);

  const handleDelete = async (line: number) => {
    if (!confirm(`¿Eliminar linea ${line} del impuesto ${taxId}?`)) return;
    try {
      await deleteTaxLine({ taxId, line }).unwrap();
      toast.success('Linea eliminada');
      loadLines();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error') ?? 'Error');
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return <span className="text-gray-400 italic">Sin fin</span>;
    return new Date(d).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <tr>
        <td colSpan={6} className="bg-amber-50 px-0 py-0">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1">
                <Percent className="w-3 h-3" />Lineas de Tasa — {taxId}
              </p>
              <CompactButton variant="primary" onClick={() => { setLineModal({ show: true, line: null }); }}
                className="!h-6 !text-xs">
                <Plus className="w-3 h-3" />Nuevo
              </CompactButton>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
                <div className="animate-spin h-3 w-3 border-b-2 border-amber-600 rounded-full" />Cargando...
              </div>
            ) : lines.length === 0 ? (
              <p className="text-xs text-gray-400 py-1 italic">Sin lineas. <button onClick={onAddLine} className="text-amber-600 hover:underline">Agregar</button></p>
            ) : (
              <div className="overflow-x-auto rounded-sm border border-amber-100">
                <table className="min-w-full text-xs">
                  <thead className="bg-amber-100/60">
                    <tr className="h-7">
                      {['Linea', 'Tasa', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className="px-2 text-left text-xs font-semibold text-amber-800">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {lines.map(l => (
                      <tr key={l.line} className="h-7 hover:bg-amber-50/70 transition-colors">
                        <td className="px-2 font-mono text-gray-700">{l.line}</td>
                        <td className="px-2">
                          <span className="inline-flex items-center gap-0.5 text-amber-800 font-semibold">
                            <Percent className="w-3 h-3" />{(l.rate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-2 text-gray-600 flex items-center gap-0.5">
                          <Calendar className="w-3 h-3 text-gray-400" />{formatDate(l.startTime)}
                        </td>
                        <td className="px-2 text-gray-600">{formatDate(l.endTime)}</td>
                        <td className="px-2">
                          <StatusDot color={l.status ? 'green' : 'gray'} label={l.status ? 'Activa' : 'Inactiva'} />
                        </td>
                        <td className="px-2">
                          <div className="flex gap-0.5">
                            <button onClick={() => setLineModal({ show: true, line: l })} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDelete(l.line)} className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </td>
      </tr>

      {lineModal.show && (
        <TaxLineModal
          taxId={taxId}
          line={lineModal.line}
          onClose={() => setLineModal({ show: false, line: null })}
          onSaved={() => { setLineModal({ show: false, line: null }); loadLines(); }}
        />
      )}
    </>
  );
};

// --- Main Section ---
type Tab = 'taxes' | 'types';

const TaxesSection: React.FC = () => {
  const [tab, setTab] = useState<Tab>('taxes');
  const [taxes, setTaxes] = useState<ITax[]>([]);
  const [taxTypes, setTaxTypes] = useState<ITaxType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTaxId, setExpandedTaxId] = useState<string | null>(null);
  const [taxModal, setTaxModal] = useState<{ show: boolean; tax: ITax | null }>({ show: false, tax: null });
  const [typeModal, setTypeModal] = useState<{ show: boolean; type: ITaxType | null }>({ show: false, type: null });

  const [deleteTax] = useDeleteTaxMutation();
  const [deleteTaxType] = useDeleteTaxTypeMutation();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, tyr] = await Promise.all([
        store.dispatch(taxesApi.endpoints.listTaxes.initiate(undefined, { forceRefetch: true })).unwrap(),
        store.dispatch(taxesApi.endpoints.listTaxTypes.initiate(undefined, { forceRefetch: true })).unwrap(),
      ]);
      setTaxes(tr ?? []);
      setTaxTypes(tyr ?? []);
    } catch {
      setTaxes([]);
      setTaxTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteT = async (id: string) => {
    if (!confirm(`¿Eliminar impuesto ${id}?`)) return;
    try {
      await deleteTax(id).unwrap();
      toast.success('Eliminado');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error') ?? 'Error');
    }
  };
  const deleteTT = async (id: number) => {
    if (!confirm(`¿Eliminar tipo ${id}?`)) return;
    try {
      await deleteTaxType(id).unwrap();
      toast.success('Eliminado');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error') ?? 'Error');
    }
  };

  const toggleExpand = (taxId: string) => setExpandedTaxId(prev => prev === taxId ? null : taxId);

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        chips={[
          { label: "Impuestos", value: taxes.length, color: "orange" },
          { label: "Tipos", value: taxTypes.length, color: "blue" },
        ]}
      >
        <div className="flex gap-1 mr-2">
          {(['taxes', 'types'] as Tab[]).map(t => (
            <CompactButton key={t} variant={tab === t ? 'primary' : 'ghost'}
              onClick={() => setTab(t)}
              className={tab === t ? '!bg-amber-600 hover:!bg-amber-700' : ''}>
              {t === 'taxes' ? `Impuestos (${taxes.length})` : `Tipos (${taxTypes.length})`}
            </CompactButton>
          ))}
        </div>
        {tab === 'taxes'
          ? <CompactButton variant="primary" onClick={() => setTaxModal({ show: true, tax: null })}>
              <Plus className="w-3.5 h-3.5" />Nuevo
            </CompactButton>
          : <CompactButton variant="primary" onClick={() => setTypeModal({ show: true, type: null })}>
              <Plus className="w-3.5 h-3.5" />Nuevo
            </CompactButton>}
        <CompactButton variant="icon" onClick={load}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </Toolbar>

      {/* Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-8 w-8 border-b-2 border-amber-600 rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {tab === 'taxes' ? (
              <table className="min-w-full">
                <thead>
                  <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                    <th className="w-8 px-1" />
                    {['Tax ID', 'Nombre', 'Tipo', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="px-2 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taxes.map(t => (
                    <React.Fragment key={t.taxId}>
                      <tr className={`h-8 max-h-8 border-b border-table-border hover:bg-row-hover transition-colors ${expandedTaxId === t.taxId ? 'bg-amber-50/40' : ''}`}>
                        <td className="pl-2 pr-0">
                          <button onClick={() => toggleExpand(t.taxId)}
                            className={`p-0.5 rounded-sm transition-colors ${expandedTaxId === t.taxId ? 'bg-amber-100 text-amber-700' : 'hover:bg-gray-100 text-gray-400'}`}>
                            {expandedTaxId === t.taxId ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                        <td className="px-2 text-sm whitespace-nowrap font-mono font-semibold text-gray-900">{t.taxId}</td>
                        <td className="px-2 text-sm whitespace-nowrap text-gray-900">{t.name}</td>
                        <td className="px-2 text-sm whitespace-nowrap text-gray-500">{taxTypes.find(tt => tt.taxTypeId === t.taxTypeId)?.name || `Tipo ${t.taxTypeId}`}</td>
                        <td className="px-2 text-sm whitespace-nowrap">
                          <StatusDot color={t.active ? 'green' : 'gray'} label={t.active ? 'Activo' : 'Inactivo'} />
                        </td>
                        <td className="px-2 text-sm whitespace-nowrap">
                          <div className="flex gap-1">
                            <button onClick={() => setTaxModal({ show: true, tax: t })} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteT(t.taxId)} className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>

                      <AnimatePresence>
                        {expandedTaxId === t.taxId && (
                          <TaxLinesRow taxId={t.taxId} onAddLine={() => setExpandedTaxId(t.taxId)} />
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                  {taxes.length === 0 && (
                    <tr><td colSpan={6} className="px-2 py-6 text-center text-sm text-gray-400">Sin impuestos</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                    {['ID', 'Nombre', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="px-2 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taxTypes.map(t => (
                    <tr key={t.taxTypeId} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
                      <td className="px-2 text-sm whitespace-nowrap text-gray-900">{t.taxTypeId}</td>
                      <td className="px-2 text-sm whitespace-nowrap text-gray-900">{t.name}</td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        <StatusDot color={t.active ? 'green' : 'gray'} label={t.active ? 'Activo' : 'Inactivo'} />
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap"><div className="flex gap-1">
                        <button onClick={() => setTypeModal({ show: true, type: t })} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteTT(t.taxTypeId)} className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div></td>
                    </tr>
                  ))}
                  {taxTypes.length === 0 && (
                    <tr><td colSpan={4} className="px-2 py-6 text-center text-sm text-gray-400">Sin tipos de impuesto</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {taxModal.show && (
        <TaxModal tax={taxModal.tax} taxTypes={taxTypes}
          onClose={() => setTaxModal({ show: false, tax: null })}
          onSaved={() => { setTaxModal({ show: false, tax: null }); load(); }} />
      )}
      {typeModal.show && (
        <TaxTypeModal taxType={typeModal.type}
          onClose={() => setTypeModal({ show: false, type: null })}
          onSaved={() => { setTypeModal({ show: false, type: null }); load(); }} />
      )}
    </div>
  );
};

export default TaxesSection;
