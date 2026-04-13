import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Settings, Package, Tags, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { zatacaService } from '../../../services/zatacaService';
import {
  IZatacaConfig, IZatacaProduct, IZatacaType,
  ICreateZatacaProductDto, IUpdateZatacaProductDto,
  IUpdateZatacaConfigDto,
} from '../../../types/zataca';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

type Tab = 'config' | 'products' | 'types';

// --- Config Form ---
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
    if (res.successful) { toast.success('Configuracion guardada'); onRefresh(); }
    else toast.error(res.error || 'Error al guardar');
  };

  const fields: { key: keyof IZatacaConfig; label: string; type?: string }[] = [
    { key: 'urlRecharge', label: 'URL Recarga' },
    { key: 'urlDataPackage', label: 'URL Paquetes' },
    { key: 'urlService', label: 'URL Servicio' },
    { key: 'username', label: 'Usuario' },
    { key: 'password', label: 'Contrasena' },
    { key: 'dailyLimit', label: 'Limite Diario', type: 'number' },
    { key: 'monthLimit', label: 'Limite Mensual', type: 'number' },
    { key: 'transMinLimit', label: 'Limite Min. Trans.', type: 'number' },
    { key: 'transMaxLimit', label: 'Limite Max. Trans.', type: 'number' },
    { key: 'siteLimit', label: 'Limite por Sucursal', type: 'number' },
  ];

  return (
    <form onSubmit={handleSave} className="p-3 space-y-2">
      {config && (
        <div className="flex gap-2 mb-1">
          <StatusDot color={config.debug ? 'yellow' : 'green'} label={config.debug ? 'Modo Debug' : 'Produccion'} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-xs font-medium text-gray-700">{f.label}</label>
            <input type={f.type || 'text'} value={(form[f.key] as any) ?? ''}
              onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
              className="w-full mt-0.5 h-7 px-2 text-sm border border-gray-300 rounded-sm" />
          </div>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={!!form.debug} onChange={e => setForm(p => ({ ...p, debug: e.target.checked }))} className="rounded" />
        Modo Debug
      </label>
      <div className="flex justify-end">
        <CompactButton type="submit" variant="primary" disabled={saving}
          className="!bg-violet-600 hover:!bg-violet-700">
          <Save className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Guardar'}
        </CompactButton>
      </div>
    </form>
  );
};

// --- Product Modal ---
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
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-sm font-semibold text-gray-900">{product ? 'Editar Producto' : 'Nuevo Producto Zataca'}</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-3 space-y-2">
          <div><label className="text-xs font-medium text-gray-700">Tipo</label>
            <select value={form.zTypeId} onChange={e => setForm(f => ({ ...f, zTypeId: e.target.value }))} className="w-full mt-0.5 h-7 px-2 text-sm border border-gray-300 rounded-sm">
              {types.map(t => <option key={t.zTypeId} value={t.zTypeId}>{t.description}</option>)}
            </select></div>
          <div><label className="text-xs font-medium text-gray-700">Descripcion</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required className="w-full mt-0.5 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
          <div><label className="text-xs font-medium text-gray-700">Precio</label>
            <input type="number" step="0.01" value={form.price ?? ''} onChange={e => setForm(f => ({ ...f, price: e.target.value ? Number(e.target.value) : null }))} className="w-full mt-0.5 h-7 px-2 text-sm border border-gray-300 rounded-sm" placeholder="Opcional" /></div>
          <div><label className="text-xs font-medium text-gray-700">URL Imagen</label>
            <input value={form.image || ''} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full mt-0.5 h-7 px-2 text-sm border border-gray-300 rounded-sm" placeholder="Opcional" /></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="checkbox" checked={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.checked }))} className="rounded" />Activo</label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="checkbox" checked={form.national} onChange={e => setForm(f => ({ ...f, national: e.target.checked }))} className="rounded" />Nacional</label>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
            <CompactButton type="submit" variant="primary" disabled={saving} className="!bg-violet-600 hover:!bg-violet-700">
              <Save className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Guardar'}
            </CompactButton>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Type Modal ---
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
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-sm font-semibold text-gray-900">{type ? 'Editar Tipo' : 'Nuevo Tipo Zataca'}</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-3 space-y-2">
          <div><label className="text-xs font-medium text-gray-700">Descripcion</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} required className="w-full mt-0.5 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
          <div className="flex justify-end gap-2">
            <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
            <CompactButton type="submit" variant="primary" disabled={saving} className="!bg-violet-600 hover:!bg-violet-700">
              <Save className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Guardar'}
            </CompactButton>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Section ---
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
    { id: 'config', label: 'Config', icon: Settings },
    { id: 'products', label: `Productos (${products.length})`, icon: Package },
    { id: 'types', label: `Tipos (${types.length})`, icon: Tags },
  ];

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar>
        <div className="flex gap-1 mr-2">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <CompactButton key={t.id} variant={tab === t.id ? 'primary' : 'ghost'}
                onClick={() => setTab(t.id)}
                className={tab === t.id ? '!bg-violet-600 hover:!bg-violet-700' : ''}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </CompactButton>
            );
          })}
        </div>
        {tab === 'products' && (
          <CompactButton variant="primary" onClick={() => setProductModal({ show: true, product: null })}
            className="!bg-violet-600 hover:!bg-violet-700">
            <Plus className="w-3.5 h-3.5" />Nuevo Producto
          </CompactButton>
        )}
        {tab === 'types' && (
          <CompactButton variant="primary" onClick={() => setTypeModal({ show: true, type: null })}
            className="!bg-violet-600 hover:!bg-violet-700">
            <Plus className="w-3.5 h-3.5" />Nuevo Tipo
          </CompactButton>
        )}
        <CompactButton variant="icon" onClick={load}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </Toolbar>

      {/* Content */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-32 items-center"><div className="animate-spin h-8 w-8 border-b-2 border-violet-600 rounded-full" /></div>
        ) : tab === 'config' ? (
          <ConfigTab config={config} onRefresh={load} />
        ) : tab === 'products' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  {['ID', 'Tipo', 'Descripcion', 'Precio', 'Nacional', 'Estado', 'Acciones'].map(h =>
                    <th key={h} className="px-2 text-left text-xs font-medium text-gray-500">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.zProductId} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
                    <td className="px-2 text-sm whitespace-nowrap text-gray-500">{p.zProductId}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-600">{types.find(t => String(t.zTypeId) === String(p.zTypeId))?.description || p.zTypeId}</td>
                    <td className="px-2 text-sm whitespace-nowrap font-medium text-gray-900 text-ellipsis overflow-hidden max-w-[200px]">{p.description}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-600">{p.price != null ? `$${p.price}` : '--'}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <StatusDot color={p.national ? 'blue' : 'gray'} label={p.national ? 'Si' : 'No'} />
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <StatusDot color={p.status ? 'green' : 'red'} label={p.status ? 'Activo' : 'Inactivo'} />
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap"><div className="flex gap-1">
                      <button onClick={() => setProductModal({ show: true, product: p })} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteProduct(p.zProductId)} className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div></td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={7} className="px-2 py-6 text-center text-sm text-gray-400">Sin productos</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  {['ID', 'Descripcion', 'Acciones'].map(h => <th key={h} className="px-2 text-left text-xs font-medium text-gray-500">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.zTypeId} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
                    <td className="px-2 text-sm whitespace-nowrap text-gray-500">{t.zTypeId}</td>
                    <td className="px-2 text-sm whitespace-nowrap font-medium text-gray-900">{t.description}</td>
                    <td className="px-2 text-sm whitespace-nowrap"><div className="flex gap-1">
                      <button onClick={() => setTypeModal({ show: true, type: t })} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteType(t.zTypeId)} className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div></td>
                  </tr>
                ))}
                {types.length === 0 && <tr><td colSpan={3} className="px-2 py-6 text-center text-sm text-gray-400">Sin tipos</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {productModal.show && <ProductModal product={productModal.product} types={types} onClose={() => setProductModal({ show: false, product: null })} onSaved={() => { setProductModal({ show: false, product: null }); load(); }} />}
      {typeModal.show && <TypeModal type={typeModal.type} onClose={() => setTypeModal({ show: false, type: null })} onSaved={() => { setTypeModal({ show: false, type: null }); load(); }} />}
    </div>
  );
};

export default ZatacaSection;
