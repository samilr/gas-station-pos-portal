import React, { useState, useEffect, useCallback } from 'react';
import {
  Wifi, Save, RefreshCw, CheckCircle, XCircle, Eye, EyeOff, Server,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getPtsSettings,
  updatePtsSettings,
  getSystemInfo,
  type PtsSettings,
} from '../../../services/dispenserService';
import { CompactButton } from '../../ui';

const PtsConnectionSettings: React.FC = () => {
  const [settings, setSettings] = useState<PtsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [baseUrl, setBaseUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pumpCount, setPumpCount] = useState(0);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPtsSettings();
      if (data) {
        setSettings(data);
        setBaseUrl(data.baseUrl || '');
        setUsername(data.username || '');
        setPassword(data.password || '');
        setPumpCount(data.pumpCount || 0);
        setPasswordChanged(false);
      }
    } catch {
      toast.error('Error al cargar configuracion PTS');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const hasChanges = settings && (
    baseUrl !== settings.baseUrl ||
    username !== settings.username ||
    passwordChanged ||
    pumpCount !== settings.pumpCount
  );

  const handleSave = async () => {
    if (!baseUrl.trim()) {
      toast.error('La URL base es requerida');
      return;
    }

    setSaving(true);
    setTestResult(null);
    try {
      const payload: Partial<PtsSettings> = {};
      if (baseUrl !== settings?.baseUrl) payload.baseUrl = baseUrl;
      if (username !== settings?.username) payload.username = username;
      if (passwordChanged && password !== '********') payload.password = password;
      if (pumpCount !== settings?.pumpCount) payload.pumpCount = pumpCount;

      await updatePtsSettings(payload);
      toast.success('Configuracion PTS actualizada. Los cambios toman efecto en la proxima solicitud.');
      setPasswordChanged(false);
      load();
    } catch (err) {
      toast.error('Error al guardar configuracion');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const packets = await getSystemInfo();
      if (packets.length > 0) {
        setTestResult('success');
        toast.success('Conexion al PTS exitosa');
      } else {
        setTestResult('error');
        toast.error('No se recibio respuesta del PTS');
      }
    } catch {
      setTestResult('error');
      toast.error('Error al conectar con el PTS. Verifique la configuracion.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-sm border border-table-border p-4 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm border border-table-border">
      <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
        <Server className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-700 flex-1">Conexion PTS</span>
        <CompactButton variant="icon" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" />
        </CompactButton>
      </div>

      <div className="p-2 space-y-2">
        {/* URL Base */}
        <div>
          <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
            URL del Controlador PTS
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://192.168.1.117/jsonPTS"
            className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
          <p className="text-2xs text-gray-400 mt-0.5">Debe incluir /jsonPTS al final</p>
        </div>

        {/* Usuario y Contrasena */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
              Usuario (Digest Auth)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
              Contrasena (Digest Auth)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordChanged(true);
                }}
                placeholder="********"
                className="w-full h-7 px-2 pr-7 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {!passwordChanged && (
              <p className="text-2xs text-gray-400 mt-0.5">Deje sin cambiar para mantener la contrasena actual</p>
            )}
          </div>
        </div>

        {/* Pump Count */}
        <div>
          <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
            Cantidad de Bombas
          </label>
          <input
            type="number"
            min="0"
            value={pumpCount}
            onChange={(e) => setPumpCount(Number(e.target.value))}
            className="w-28 h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-2xs text-gray-400 mt-0.5">0 = auto-detectar desde el PTS</p>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`flex items-center gap-1.5 p-1.5 rounded-sm text-xs ${
              testResult === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {testResult === 'success' ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Conexion exitosa al controlador PTS</>
            ) : (
              <><XCircle className="w-3.5 h-3.5" /> No se pudo conectar al PTS. Verifique la URL y credenciales.</>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-wrap gap-1 pt-1">
          <CompactButton
            variant="primary"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Guardar Cambios
          </CompactButton>

          <CompactButton
            variant="ghost"
            onClick={handleTestConnection}
            disabled={testing}
          >
            {testing ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Wifi className="w-3.5 h-3.5" />
            )}
            Probar Conexion
          </CompactButton>
        </div>
      </div>
    </div>
  );
};

export default PtsConnectionSettings;
