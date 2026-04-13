import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Save, RefreshCw, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { appConfigService } from '../../../services/appConfigService';
import { IAppConfig } from '../../../types/appConfig';

const AppConfigSection: React.FC = () => {
  const [config, setConfig] = useState<IAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<IAppConfig>>({});
  const [isEditing, setIsEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await appConfigService.getAppConfig();
    if (res.successful && res.data) { setConfig(res.data); setForm(res.data); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    // El GET no devuelve el campo `id`, pero la config es un singleton con id=1
    const configId = config?.id ?? 1;
    const res = config
      ? await appConfigService.updateAppConfig(configId, { appVersion: form.appVersion, description: form.description, urlApk: form.urlApk, required: form.required })
      : await appConfigService.createAppConfig({ appVersion: form.appVersion || '', description: form.description || '', urlApk: form.urlApk || '', required: form.required || false });
    setSaving(false);
    if (res.successful) { toast.success('Configuración guardada'); setIsEditing(false); load(); }
    else toast.error(res.error || 'Error al guardar');
  };

  const handleDelete = async () => {
    if (!config) return;
    if (!confirm('¿Eliminar esta configuración?')) return;
    const configId = config.id ?? 1;
    const r = await appConfigService.deleteAppConfig(configId);
    if (r.successful) { toast.success('Eliminado'); setConfig(null); setForm({}); }
    else toast.error(r.error || 'Error');
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">App Config (Móvil)</h1>
              <p className="text-sm text-gray-500">Versión y descarga de la app POS móvil</p>
            </div>
          </div>
          <div className="flex gap-2">
            {config && !isEditing && (
              <>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"><Edit2 className="w-4 h-4" />Editar</button>
                <button onClick={handleDelete} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </>
            )}
            {!config && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"><Plus className="w-4 h-4" />Nueva Config</button>
            )}
            <button onClick={load} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
          </div>
        </div>
      </motion.div>

      {config && !isEditing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Versión</p>
              <p className="text-2xl font-bold text-blue-900">{config.appVersion}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Descripción</p>
              <p className="text-sm text-gray-800">{config.description}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">URL APK</p>
            <p className="text-sm text-gray-700 break-all">{config.urlApk}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${config.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
              {config.required ? '⚠ Actualización Requerida' : '✓ Actualización Opcional'}
            </span>
          </div>
        </motion.div>
      )}

      {isEditing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-700">Versión</label>
                <input value={form.appVersion || ''} onChange={e => setForm(f => ({ ...f, appVersion: e.target.value }))} required placeholder="1.0.0" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="text-sm font-medium text-gray-700">Descripción</label>
                <input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
            </div>
            <div><label className="text-sm font-medium text-gray-700">URL APK</label>
              <input value={form.urlApk || ''} onChange={e => setForm(f => ({ ...f, urlApk: e.target.value }))} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" /></div>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={!!form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} className="rounded" />
              Actualización Requerida
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60">
                <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default AppConfigSection;
