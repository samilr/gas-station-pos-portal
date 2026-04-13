import React, { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { cfConfigService } from '../../../services/cfConfigService';
import { ICfConfig } from '../../../types/cfConfig';

const CfConfigSection: React.FC = () => {
  const [config, setConfig] = useState<ICfConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<ICfConfig>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const res = await cfConfigService.getCfConfig();
    if (res.successful && res.data) {
      setConfig(res.data);
      setForm(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await cfConfigService.updateCfConfig(form);
    setSaving(false);
    if (res.successful) toast.success('Configuración fiscal actualizada');
    else toast.error(res.error || 'Error al guardar');
  };

  const fields: { key: keyof ICfConfig; label: string; type?: string; secret?: boolean }[] = [
    { key: 'serieUrl', label: 'URL Serie' },
    { key: 'serieUsername', label: 'Usuario Serie' },
    { key: 'seriePassword', label: 'Contraseña Serie', secret: true },
    { key: 'url', label: 'URL DGII' },
    { key: 'urlInterface', label: 'URL Interface' },
    { key: 'username', label: 'Usuario DGII' },
    { key: 'password', label: 'Contraseña DGII', secret: true },
    { key: 'qrFolder', label: 'Carpeta QR' },
    { key: 'cfTypeConsumeLimit', label: 'Límite NCF Consumo', type: 'number' },
    { key: 'combTransLimit', label: 'Límite Trans. Combustible', type: 'number' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Configuración Fiscal (CF)</h1>
              <p className="text-sm text-gray-500">Configuración del sistema de comprobantes fiscales DGII</p>
            </div>
          </div>
          <button onClick={load} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </motion.div>

      {config && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Status badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {config.active ? '✓ Activo' : '✗ Inactivo'}
            </span>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.testMode ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {config.testMode ? '🧪 Modo Prueba' : '🔴 Producción'}
            </span>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.validationOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {config.validationOnline ? '🌐 Validación Online' : '📴 Validación Offline'}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type={f.secret ? 'password' : (f.type || 'text')}
                    value={(form[f.key] as string | number) ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            {/* Booleans */}
            <div className="flex flex-wrap gap-6 pt-2">
              {([
                { key: 'testMode', label: 'Modo Prueba' },
                { key: 'active', label: 'Activo' },
                { key: 'validationOnline', label: 'Validación Online' },
              ] as { key: keyof ICfConfig; label: string }[]).map(f => (
                <label key={f.key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input type="checkbox" checked={!!form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600" />
                  {f.label}
                </label>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors">
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {!config && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">No se encontró configuración fiscal. Se puede crear una nueva.</p>
        </div>
      )}
    </div>
  );
};

export default CfConfigSection;
