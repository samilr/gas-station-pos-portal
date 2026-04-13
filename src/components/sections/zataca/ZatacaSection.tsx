import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Plus, Edit2, Trash2, RefreshCw, Settings, Package, Tags, X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { zatacaService } from '../../../services/zatacaService';
import {
  IZatacaConfig, IZatacaProduct, IZatacaType,
  ICreateZatacaProductDto, IUpdateZatacaProductDto,
  IUpdateZatacaConfigDto,
} from '../../../types/zataca';

type Tab = 'config' | 'products' | 'types';

// ─── Config Form ────────────────────────────────────────────
const ConfigTab: React.FC<{ config: IZatacaConfig | null; onRefresh: () => void }> = ({ config, onRefresh }) => {
  const [form, setForm] = useState<Partial<IZatacaConfig>>(config || {});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (config) setForm(config); }, [config]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = config
      ? await zatacaService.updateConfig(config.companyId, form as IUpdateZatacaConfigDto)
      : await zatacaService.createConfig(form);
    setSaving(false);
    if (res.successful) { toast.success('Configuración guardada'); onRefresh(); }
    else toast.error(res.error || 'Error al guardar');
  };

  const fields: { key: keyof IZatacaConfig; label: string; type?: string }[] = [
    { key: 'urlRecharge', label: 'URL Recarga' },
    { key: 'urlDataPackage', label: 'URL Paquetes' },
    { key: 'urlService', label: 'URL Servicio' },
    { key: 'username', label: 'Usuario' },
    { key: 'password', label: 'Contraseña' },
    { key: 'dailyLimit', label: 'Límite Diario', type: 'number' },
    { key: 'monthLimit', label: 'Límite Mensual', type: 'number' },
    { key: 'transMinLimit', label: 'Límite Mín. Trans.', type: 'number' },
    { key: 'transMaxLimit', label: 'Límite Máx. Trans.', type: 'number' },
    { key: 'siteLimit', label: 'Límite por Sucursal', type: 'number' },
  ];

  return (
    <form onSubmit={handleSave} className="p-6 space-y-4">
      {config && (
        <div className="flex gap-2 mb-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.debug ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {config.debug ? '🧪 Modo Debug' : '✓ Producción'}
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-sm font-medium text-gray-700">{f.label}</label>
            <input type={f.type || 'text'} value={(form[f.key] as any) ?? ''}
              onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
          </div>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={!!form.debug} onChange={e => setForm(p => ({ ...p, debug: e.target.checked }))} className="rounded" />
        Modo Debug
      </label>
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm disabled:opacity-60">
          <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  );
};

// ─── Product Modal ────────────────────────────────────────────
const ProductModal: React.FC<{ product: IZatacaProduct | null; types: IZatacaType[]; onClose: () => void; onSaved: () => void }> = ({ product, types, onClose, onSaved }) => {
  const [form, setForm] = useState<ICreateZatacaProductDto>({
    zTypeId: product?.zTypeId || (types[0]?.zTypeId?.toString() || '1'),
    description: product?.description || '',
    price: product?.price ?? null,
    status: product?.status ?? true,
    national: product?.national ?? false,
    image: product?.image || '',
  });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = product
      ? await zatacaService.updateProduct(product.zProductId, form as IUpdateZatacaProductDto)
      : await zatacaService.createProduct(form);
    setSaving(false);
    if (res.successful) { toast.success(product ? 'Actualizado' : 'Creado'); onSaved(); }
    else toast.error(res.error || 'Error');
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-900">{product ? 'Editar Producto' : 'Nuevo Producto Zataca'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="text-sm font-medium text-gray-700">Tipo</label>
            <select value={form.zTypeId} onChange={e => setForm(f => ({ ...f, zTypeId: e.target.value }))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
              {types.map(t => <option key={t.zTypeId} value={t.zTypeId}>{t.description}</option>)}
            </select></div>
          <div><label className="text-sm font-medium text-gray-700">Descripción</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="text-sm font-medium text-gray-700">Precio</label>
            <input type="number" step="0.01" value={form.price ?? ''} onChange={e => setForm(f => ({ ...f, price: e.target.value ? Number(e.target.value) : null }))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="Opcional" /></div>
          <div><label className="text-sm font-medium text-gray-700">URL Imagen</label>
            <input value={form.image || ''} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="Opcional" /></div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.checked }))} className="rounded" />Activo</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.national} onChange={e => setForm(f => ({ ...f, national: e.target.checked }))} className="rounded" />Nacional</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-lg disabled:opacity-60">
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Type Modal ───────────────────────────────────────────────
const TypeModal: React.FC<{ type: IZatacaType | null; onClose: () => void; onSaved: () => void }> = ({ type, onClose, onSaved }) => {
  const [desc, setDesc] = useState(type?.description || '');
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = type
      ? await zatacaService.updateType(type.zTypeId, { description: desc })
      : await zatacaService.createType({ description: desc });
    setSaving(false);
    if (res.successful) { toast.success(type ? 'Actualizado' : 'Creado'); onSaved(); }
    else toast.error(res.error || 'Error');
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-900">{type ? 'Editar Tipo' : 'Nuevo Tipo Zataca'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="text-sm font-medium text-gray-700">Descripción</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} required className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-lg disabled:opacity-60">
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Section ─────────────────────────────────────────────
const ZatacaSection: React.FC = () => {
  const [tab, setTab] = useState<Tab>('config');
  const [config, setConfig] = useState<IZatacaConfig | null>(null);
  const [products, setProducts] = useState<IZatacaProduct[]>([]);
  const [types, setTypes] = useState<IZatacaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [productModal, setProductModal] = useState<{ show: boolean; product: IZatacaProduct | null }>({ show: false, product: null });
  const [typeModal, setTypeModal] = useState<{ show: boolean; type: IZatacaType | null }>({ show: false, type: null });

  const load = useCallback(async () => {
    setLoading(true);
    const [cr, pr, tr] = await Promise.allSettled([
      zatacaService.getConfig(),
      zatacaService.getProducts(),
      zatacaService.getTypes(),
    ]);
    if (cr.status === 'fulfilled' && cr.value.successful) setConfig(cr.value.data);
    if (pr.status === 'fulfilled' && pr.value.successful) setProducts(Array.isArray(pr.value.data) ? pr.value.data : []);
    if (tr.status === 'fulfilled' && tr.value.successful) setTypes(Array.isArray(tr.value.data) ? tr.value.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteProduct = async (id: number) => {
    if (!confirm('¿Eliminar producto?')) return;
    const r = await zatacaService.deleteProduct(id);
    if (r.successful) { toast.success('Eliminado'); load(); } else toast.error(r.error || 'Error');
  };
  const deleteType = async (id: number) => {
    if (!confirm('¿Eliminar tipo?')) return;
    const r = await zatacaService.deleteType(id);
    if (r.successful) { toast.success('Eliminado'); load(); } else toast.error(r.error || 'Error');
  };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'config', label: 'Configuración', icon: Settings },
    { id: 'products', label: `Productos (${products.length})`, icon: Package },
    { id: 'types', label: `Tipos (${types.length})`, icon: Tags },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Zataca</h1>
              <p className="text-sm text-gray-500">Recargas y servicios externos</p>
            </div>
          </div>
          <div className="flex gap-2">
            {tab === 'products' && (
              <button onClick={() => setProductModal({ show: true, product: null })}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm">
                <Plus className="w-4 h-4" />Nuevo Producto
              </button>
            )}
            {tab === 'types' && (
              <button onClick={() => setTypeModal({ show: true, type: null })}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm">
                <Plus className="w-4 h-4" />Nuevo Tipo
              </button>
            )}
            <button onClick={load} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Icon className="w-4 h-4" />{t.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-40 items-center"><div className="animate-spin h-8 w-8 border-b-2 border-violet-600 rounded-full" /></div>
        ) : tab === 'config' ? (
          <ConfigTab config={config} onRefresh={load} />
        ) : tab === 'products' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                {['ID', 'Tipo', 'Descripción', 'Precio', 'Nacional', 'Estado', 'Acciones'].map(h =>
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((p, i) => (
                  <motion.tr key={p.zProductId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm text-gray-500">{p.zProductId}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{types.find(t => String(t.zTypeId) === String(p.zTypeId))?.description || p.zTypeId}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{p.description}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.price != null ? `$${p.price}` : '—'}</td>
                    <td className="px-5 py-4"><span className={`px-2 py-0.5 text-xs rounded-full ${p.national ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{p.national ? 'Sí' : 'No'}</span></td>
                    <td className="px-5 py-4"><span className={`px-2 py-0.5 text-xs rounded-full ${p.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{p.status ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="px-5 py-4"><div className="flex gap-2">
                      <button onClick={() => setProductModal({ show: true, product: p })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(p.zProductId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </motion.tr>
                ))}
                {products.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">Sin productos</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                {['ID', 'Descripción', 'Acciones'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-200">
                {types.map((t, i) => (
                  <motion.tr key={t.zTypeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{t.zTypeId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.description}</td>
                    <td className="px-6 py-4"><div className="flex gap-2">
                      <button onClick={() => setTypeModal({ show: true, type: t })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteType(t.zTypeId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </motion.tr>
                ))}
                {types.length === 0 && <tr><td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-400">Sin tipos</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {productModal.show && <ProductModal product={productModal.product} types={types} onClose={() => setProductModal({ show: false, product: null })} onSaved={() => { setProductModal({ show: false, product: null }); load(); }} />}
      {typeModal.show && <TypeModal type={typeModal.type} onClose={() => setTypeModal({ show: false, type: null })} onSaved={() => { setTypeModal({ show: false, type: null }); load(); }} />}
    </div>
  );
};

export default ZatacaSection;
