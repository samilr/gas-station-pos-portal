import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Plus, Edit2, Trash2, RefreshCw, X, Save, ChevronDown, ChevronRight, Percent, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { taxService } from '../../../services/taxService';
import { ITax, ITaxType, ITaxLine } from '../../../types/tax';

// ─── Tax Modal ────────────────────────────────────────────────
const TaxModal: React.FC<{ tax: ITax | null; taxTypes: ITaxType[]; onClose: () => void; onSaved: () => void }> = ({ tax, taxTypes, onClose, onSaved }) => {
  const [form, setForm] = useState({ taxId: tax?.taxId || '', name: tax?.name || '', taxTypeId: tax?.taxTypeId ?? 1, active: tax?.active ?? true });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = tax
      ? await taxService.updateTax(form.taxId, { name: form.name, taxTypeId: form.taxTypeId, active: form.active })
      : await taxService.createTax(form);
    setSaving(false);
    if (res.successful) { toast.success(tax ? 'Impuesto actualizado' : 'Impuesto creado'); onSaved(); }
    else toast.error(res.error || 'Error al guardar');
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-900">{tax ? 'Editar Impuesto' : 'Nuevo Impuesto'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="text-sm font-medium text-gray-700">Tax ID</label>
            <input value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} disabled={!!tax} required className="w-full mt-1 px-3 py-2 border rounded-lg text-sm disabled:bg-gray-50" /></div>
          <div><label className="text-sm font-medium text-gray-700">Nombre</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="text-sm font-medium text-gray-700">Tipo de Impuesto</label>
            <select value={form.taxTypeId} onChange={e => setForm(f => ({ ...f, taxTypeId: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
              {taxTypes.map(t => <option key={t.taxTypeId} value={t.taxTypeId}>{t.name}</option>)}
            </select></div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />Activo
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60">
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Tax Type Modal ────────────────────────────────────────────
const TaxTypeModal: React.FC<{ taxType: ITaxType | null; onClose: () => void; onSaved: () => void }> = ({ taxType, onClose, onSaved }) => {
  const [form, setForm] = useState({ taxTypeId: taxType?.taxTypeId ?? 0, name: taxType?.name || '', active: taxType?.active ?? true });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = taxType
      ? await taxService.updateTaxType(form.taxTypeId, { name: form.name, active: form.active })
      : await taxService.createTaxType(form);
    setSaving(false);
    if (res.successful) { toast.success(taxType ? 'Tipo actualizado' : 'Tipo creado'); onSaved(); }
    else toast.error(res.error || 'Error al guardar');
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-900">{taxType ? 'Editar Tipo' : 'Nuevo Tipo'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {!taxType && <div><label className="text-sm font-medium text-gray-700">Tax Type ID</label>
            <input type="number" value={form.taxTypeId} onChange={e => setForm(f => ({ ...f, taxTypeId: Number(e.target.value) }))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>}
          <div><label className="text-sm font-medium text-gray-700">Nombre</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />Activo
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60">
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Tax Line Modal ────────────────────────────────────────────
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
    startTime: line?.startTime ? line.startTime.split('T')[0] : new Date().toISOString().split('T')[0],
    endTime: line?.endTime ? line.endTime.split('T')[0] : '',
    status: line?.status ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = {
      startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
      endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
      rate: form.rate,
      status: form.status,
    };
    const res = line
      ? await taxService.updateTaxLine(taxId, line.line, payload)
      : await taxService.createTaxLine({ taxId, line: form.line, rate: form.rate, startTime: form.startTime, endTime: form.endTime || null, status: form.status });
    setSaving(false);
    if (res.successful) { toast.success(line ? 'Línea actualizada' : 'Línea creada'); onSaved(); }
    else toast.error(res.error || 'Error al guardar');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-semibold text-gray-900">{line ? 'Editar Línea de Tasa' : 'Nueva Línea de Tasa'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Impuesto {taxId}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {!line && (
            <div><label className="text-sm font-medium text-gray-700">Número de Línea</label>
              <input type="number" min={1} value={form.line} onChange={e => setForm(f => ({ ...f, line: Number(e.target.value) }))} required className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          )}
          <div><label className="text-sm font-medium text-gray-700">Tasa (%)</label>
            <div className="relative mt-1">
              <input type="number" step="0.01" min={0} max={100} value={form.rate}
                onChange={e => setForm(f => ({ ...f, rate: Number(e.target.value) }))} required
                className="w-full pl-4 pr-10 py-2 border rounded-lg text-sm" />
              <span className="absolute right-3 top-2.5 text-gray-400 text-sm font-bold">%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium text-gray-700">Fecha Inicio</label>
              <input type="date" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="text-sm font-medium text-gray-700">Fecha Fin <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input type="date" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.checked }))} className="rounded" />Activa
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-60">
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Tax Lines Sub-table ───────────────────────────────────────
const TaxLinesRow: React.FC<{ taxId: string; onAddLine: () => void }> = ({ taxId, onAddLine }) => {
  const [lines, setLines] = useState<ITaxLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [lineModal, setLineModal] = useState<{ show: boolean; line: ITaxLine | null }>({ show: false, line: null });

  const loadLines = useCallback(async () => {
    setLoading(true);
    const res = await taxService.getTaxLines(taxId);
    setLines(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, [taxId]);

  useEffect(() => { loadLines(); }, [loadLines]);

  const handleDelete = async (line: number) => {
    if (!confirm(`¿Eliminar línea ${line} del impuesto ${taxId}?`)) return;
    const r = await taxService.deleteTaxLine(taxId, line);
    if (r.successful) { toast.success('Línea eliminada'); loadLines(); }
    else toast.error(r.error || 'Error');
  };

  const formatDate = (d?: string | null) => {
    if (!d) return <span className="text-gray-400 italic">Sin fin</span>;
    return new Date(d).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <tr>
        <td colSpan={6} className="bg-amber-50 px-0 py-0">
          <div className="px-8 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" />Líneas de Tasa — Impuesto {taxId}
              </p>
              <button onClick={() => { setLineModal({ show: true, line: null }); }}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs">
                <Plus className="w-3 h-3" />Nueva Línea
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <div className="animate-spin h-3.5 w-3.5 border-b-2 border-amber-600 rounded-full" />Cargando...
              </div>
            ) : lines.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 italic">Sin líneas de tasa. <button onClick={onAddLine} className="text-amber-600 hover:underline">Agregar</button></p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-amber-100">
                <table className="min-w-full text-xs">
                  <thead className="bg-amber-100/60">
                    <tr>
                      {['Línea', 'Tasa', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className="px-4 py-2 text-left font-semibold text-amber-800">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {lines.map(l => (
                      <tr key={l.line} className="hover:bg-amber-50/70 transition-colors">
                        <td className="px-4 py-2 font-mono text-gray-700">{l.line}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                            <Percent className="w-3 h-3" />{(l.rate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-2 flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3 text-gray-400" />{formatDate(l.startTime)}
                        </td>
                        <td className="px-4 py-2 text-gray-600">{formatDate(l.endTime)}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${l.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {l.status ? '● Activa' : '○ Inactiva'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <button onClick={() => setLineModal({ show: true, line: l })} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(l.line)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
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

// ─── Main Section ─────────────────────────────────────────────
type Tab = 'taxes' | 'types';

const TaxesSection: React.FC = () => {
  const [tab, setTab] = useState<Tab>('taxes');
  const [taxes, setTaxes] = useState<ITax[]>([]);
  const [taxTypes, setTaxTypes] = useState<ITaxType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTaxId, setExpandedTaxId] = useState<string | null>(null);
  const [taxModal, setTaxModal] = useState<{ show: boolean; tax: ITax | null }>({ show: false, tax: null });
  const [typeModal, setTypeModal] = useState<{ show: boolean; type: ITaxType | null }>({ show: false, type: null });

  const load = useCallback(async () => {
    setLoading(true);
    const [tr, tyr] = await Promise.all([taxService.getTaxes(), taxService.getTaxTypes()]);
    setTaxes(Array.isArray(tr.data) ? tr.data : []);
    setTaxTypes(Array.isArray(tyr.data) ? tyr.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteT = async (id: string) => {
    if (!confirm(`¿Eliminar impuesto ${id}?`)) return;
    const r = await taxService.deleteTax(id);
    if (r.successful) { toast.success('Eliminado'); load(); } else toast.error(r.error || 'Error');
  };
  const deleteTT = async (id: number) => {
    if (!confirm(`¿Eliminar tipo ${id}?`)) return;
    const r = await taxService.deleteTaxType(id);
    if (r.successful) { toast.success('Eliminado'); load(); } else toast.error(r.error || 'Error');
  };

  const toggleExpand = (taxId: string) => setExpandedTaxId(prev => prev === taxId ? null : taxId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Impuestos</h1>
              <p className="text-sm text-gray-500">Gestión de impuestos, tipos y tasas vigentes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tab === 'taxes'
              ? <button onClick={() => setTaxModal({ show: true, tax: null })} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm"><Plus className="w-4 h-4" />Nuevo Impuesto</button>
              : <button onClick={() => setTypeModal({ show: true, type: null })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"><Plus className="w-4 h-4" />Nuevo Tipo</button>}
            <button onClick={load} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          {(['taxes', 'types'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t === 'taxes' ? `Impuestos (${taxes.length})` : `Tipos (${taxTypes.length})`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-b-2 border-amber-600 rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {tab === 'taxes' ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-10 px-2 py-3" />
                    {['Tax ID', 'Nombre', 'Tipo', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {taxes.map(t => (
                    <React.Fragment key={t.taxId}>
                      <tr className={`hover:bg-gray-50 transition-colors ${expandedTaxId === t.taxId ? 'bg-amber-50/40' : ''}`}>
                        {/* Expand toggle */}
                        <td className="pl-4 pr-0 py-4">
                          <button onClick={() => toggleExpand(t.taxId)}
                            className={`p-1 rounded transition-colors ${expandedTaxId === t.taxId ? 'bg-amber-100 text-amber-700' : 'hover:bg-gray-100 text-gray-400'}`}
                            title={expandedTaxId === t.taxId ? 'Ocultar líneas' : 'Ver líneas de tasa'}>
                            {expandedTaxId === t.taxId
                              ? <ChevronDown className="w-4 h-4" />
                              : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">{t.taxId}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{t.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{taxTypes.find(tt => tt.taxTypeId === t.taxTypeId)?.name || `Tipo ${t.taxTypeId}`}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {t.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => setTaxModal({ show: true, tax: t })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteT(t.taxId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable tax lines row */}
                      <AnimatePresence>
                        {expandedTaxId === t.taxId && (
                          <TaxLinesRow
                            taxId={t.taxId}
                            onAddLine={() => setExpandedTaxId(t.taxId)}
                          />
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                  {taxes.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">Sin impuestos</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr>
                  {['ID', 'Nombre', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {taxTypes.map(t => (
                    <tr key={t.taxTypeId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{t.taxTypeId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{t.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {t.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4"><div className="flex gap-2">
                        <button onClick={() => setTypeModal({ show: true, type: t })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteTT(t.taxTypeId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div></td>
                    </tr>
                  ))}
                  {taxTypes.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">Sin tipos de impuesto</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </motion.div>

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
