import React, { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cfConfigService } from '../../../services/cfConfigService';
import { ICfConfig } from '../../../types/cfConfig';
import { CompactButton } from '../../ui';
import Toolbar from '../../ui/Toolbar';

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
    if (res.successful) toast.success('Configuracion fiscal actualizada');
    else toast.error(res.error || 'Error al guardar');
  };

  const fields: { key: keyof ICfConfig; label: string; type?: string; secret?: boolean }[] = [
    { key: 'serieUrl', label: 'URL Serie' },
    { key: 'serieUsername', label: 'Usuario Serie' },
    { key: 'seriePassword', label: 'Contrasena Serie', secret: true },
    { key: 'url', label: 'URL DGII' },
    { key: 'urlInterface', label: 'URL Interface' },
    { key: 'username', label: 'Usuario DGII' },
    { key: 'password', label: 'Contrasena DGII', secret: true },
    { key: 'qrFolder', label: 'Carpeta QR' },
    { key: 'cfTypeConsumeLimit', label: 'Limite NCF Consumo', type: 'number' },
    { key: 'combTransLimit', label: 'Limite Trans. Combustible', type: 'number' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" /></div>;

  return (
    <div className="space-y-1">
      <Toolbar
        chips={config ? [
          { label: config.active ? 'Activo' : 'Inactivo', value: '', color: config.active ? 'green' : 'red' },
          { label: config.testMode ? 'Prueba' : 'Produccion', value: '', color: config.testMode ? 'yellow' : 'blue' },
          { label: config.validationOnline ? 'Online' : 'Offline', value: '', color: config.validationOnline ? 'green' : 'gray' },
        ] : []}
      >
        <CompactButton variant="icon" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" />
        </CompactButton>
      </Toolbar>

      {config && (
        <div className="bg-white rounded-sm border border-gray-200 p-3">
          <form onSubmit={handleSave} className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">{f.label}</label>
                  <input
                    type={f.secret ? 'password' : (f.type || 'text')}
                    value={(form[f.key] as string | number) ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            {/* Booleans */}
            <div className="flex flex-wrap gap-4 pt-1">
              {([
                { key: 'testMode', label: 'Modo Prueba' },
                { key: 'active', label: 'Activo' },
                { key: 'validationOnline', label: 'Validacion Online' },
              ] as { key: keyof ICfConfig; label: string }[]).map(f => (
                <label key={f.key} className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
                  <input type="checkbox" checked={!!form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600" />
                  {f.label}
                </label>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <CompactButton type="submit" variant="primary" disabled={saving}
                className="!bg-purple-600 hover:!bg-purple-700">
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Guardando...' : 'Guardar'}
              </CompactButton>
            </div>
          </form>
        </div>
      )}

      {!config && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">No se encontro configuracion fiscal. Se puede crear una nueva.</p>
        </div>
      )}
    </div>
  );
};

export default CfConfigSection;
