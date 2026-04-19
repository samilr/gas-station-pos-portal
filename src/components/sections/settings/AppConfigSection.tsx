import React, { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, Plus, Edit2, Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { appConfigService } from '../../../services/appConfigService';
import { IAppConfig } from '../../../types/appConfig';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

const AppConfigSection: React.FC = () => {
  const [config, setConfig] = useState<IAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<IAppConfig>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const maskKey = (k?: string) => {
    if (!k) return '';
    if (k.length <= 12) return '•'.repeat(k.length);
    return k.slice(0, 6) + '•'.repeat(Math.max(0, k.length - 12)) + k.slice(-6);
  };

  const copyKey = async () => {
    if (!config?.apiKey) return;
    try {
      await navigator.clipboard.writeText(config.apiKey);
      toast.success('API Key copiada al portapapeles');
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await appConfigService.getAppConfig();
    if (res.successful && res.data) { setConfig(res.data); setForm(res.data); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const configId = config?.id ?? 1;
    const res = config
      ? await appConfigService.updateAppConfig(configId, { appVersion: form.appVersion, description: form.description, urlApk: form.urlApk, required: form.required, apiKey: form.apiKey, recentTransactionWindowMinutes: form.recentTransactionWindowMinutes })
      : await appConfigService.createAppConfig({ appVersion: form.appVersion || '', description: form.description || '', urlApk: form.urlApk || '', required: form.required || false, apiKey: form.apiKey || '', recentTransactionWindowMinutes: form.recentTransactionWindowMinutes ?? 5 });
    setSaving(false);
    if (res.successful) { toast.success('Configuracion guardada'); setIsEditing(false); load(); }
    else toast.error(res.error || 'Error al guardar');
  };

  const handleDelete = async () => {
    if (!config) return;
    if (!confirm('¿Eliminar esta configuracion?')) return;
    const configId = config.id ?? 1;
    const r = await appConfigService.deleteAppConfig(configId);
    if (r.successful) { toast.success('Eliminado'); setConfig(null); setForm({}); }
    else toast.error(r.error || 'Error');
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" /></div>;

  return (
    <div className="space-y-1">
      <Toolbar
        chips={config ? [
          { label: "Version", value: config.appVersion, color: "blue" },
          { label: config.required ? 'Requerida' : 'Opcional', value: '', color: config.required ? 'red' : 'green' },
        ] : []}
      >
        {config && !isEditing && (
          <>
            <CompactButton variant="primary" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-3.5 h-3.5" />Editar
            </CompactButton>
            <CompactButton variant="danger" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </CompactButton>
          </>
        )}
        {!config && !isEditing && (
          <CompactButton variant="primary" onClick={() => setIsEditing(true)}>
            <Plus className="w-3.5 h-3.5" />Nueva Config
          </CompactButton>
        )}
        <CompactButton variant="icon" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" />
        </CompactButton>
      </Toolbar>

      {config && !isEditing && (
        <div className="bg-white rounded-sm border border-gray-200 p-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-blue-50 rounded-sm p-2">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-0.5">Version</p>
              <p className="text-lg font-bold text-blue-900">{config.appVersion}</p>
            </div>
            <div className="bg-gray-50 rounded-sm p-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Descripcion</p>
              <p className="text-sm text-gray-800">{config.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-sm p-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">URL APK</p>
              <p className="text-xs text-gray-700 break-all">{config.urlApk}</p>
            </div>
            <div className="bg-gray-50 rounded-sm p-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Minutos en Espera / Recientes</p>
              <p className="text-xs text-gray-700">{config.recentTransactionWindowMinutes ?? 5} min</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-sm p-2">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">API Key</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(s => !s)}
                  className="p-0.5 text-gray-500 hover:text-gray-800"
                  title={showKey ? 'Ocultar' : 'Mostrar'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={copyKey}
                  className="p-0.5 text-gray-500 hover:text-gray-800"
                  title="Copiar"
                  disabled={!config.apiKey}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-700 font-mono break-all">
              {config.apiKey
                ? (showKey ? config.apiKey : maskKey(config.apiKey))
                : <span className="italic text-gray-400">Sin configurar</span>}
            </p>
          </div>
          <div>
            <StatusDot
              color={config.required ? 'red' : 'green'}
              label={config.required ? 'Actualizacion Requerida' : 'Actualizacion Opcional'}
            />
          </div>
        </div>
      )}

      {isEditing && (
        <div className="bg-white rounded-sm border border-gray-200 p-3">
          <form onSubmit={handleSave} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><label className="text-xs font-medium text-gray-700">Version</label>
                <input value={form.appVersion || ''} onChange={e => setForm(f => ({ ...f, appVersion: e.target.value }))} required placeholder="1.0.0" className="w-full mt-0.5 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
              <div><label className="text-xs font-medium text-gray-700">Descripcion</label>
                <input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full mt-0.5 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><label className="text-xs font-medium text-gray-700">URL APK</label>
                <input value={form.urlApk || ''} onChange={e => setForm(f => ({ ...f, urlApk: e.target.value }))} className="w-full mt-0.5 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
              <div><label className="text-xs font-medium text-gray-700">Ventana de recientes (Minutos)</label>
                <input type="number" min="1" value={form.recentTransactionWindowMinutes ?? 5} onChange={e => setForm(f => ({ ...f, recentTransactionWindowMinutes: parseInt(e.target.value) || 5 }))} className="w-full mt-0.5 h-7 px-2 text-sm border border-gray-300 rounded-sm" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">API Key (SAS token)</label>
                <button
                  type="button"
                  onClick={() => setShowKey(s => !s)}
                  className="p-0.5 text-gray-500 hover:text-gray-800"
                  title={showKey ? 'Ocultar' : 'Mostrar'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <textarea
                value={form.apiKey || ''}
                onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                rows={3}
                className={`w-full mt-0.5 px-2 py-1 text-xs border border-gray-300 rounded-sm font-mono ${showKey ? '' : 'blur-sm hover:blur-none focus:blur-none'}`}
                placeholder="sp=r&st=...&sig=..."
              />
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
              <input type="checkbox" checked={!!form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} className="rounded" />
              Actualizacion Requerida
            </label>
            <div className="flex justify-end gap-2">
              <CompactButton type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</CompactButton>
              <CompactButton type="submit" variant="primary" disabled={saving}>
                <Save className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Guardar'}
              </CompactButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AppConfigSection;
