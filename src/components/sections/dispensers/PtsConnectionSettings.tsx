import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
      toast.error('Error al cargar configuración PTS');
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
      toast.success('Configuración PTS actualizada. Los cambios toman efecto en la próxima solicitud.');
      setPasswordChanged(false);
      // Recargar para obtener los valores actualizados
      load();
    } catch (err) {
      toast.error('Error al guardar configuración');
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
        toast.success('Conexión al PTS exitosa');
      } else {
        setTestResult('error');
        toast.error('No se recibió respuesta del PTS');
      }
    } catch {
      setTestResult('error');
      toast.error('Error al conectar con el PTS. Verifique la configuración.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Server className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Conexión PTS</h2>
            <p className="text-sm text-gray-500">Configuración de conexión al controlador PTS-2</p>
          </div>
        </div>
        <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* URL Base */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL del Controlador PTS
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://192.168.1.117/jsonPTS"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">Debe incluir /jsonPTS al final</p>
        </div>

        {/* Usuario y Contraseña */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario (Digest Auth)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña (Digest Auth)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordChanged(true);
                }}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!passwordChanged && (
              <p className="text-xs text-gray-400 mt-1">Deje sin cambiar para mantener la contraseña actual</p>
            )}
          </div>
        </div>

        {/* Pump Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad de Bombas
          </label>
          <input
            type="number"
            min="0"
            value={pumpCount}
            onChange={(e) => setPumpCount(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">0 = auto-detectar desde el PTS</p>
        </div>

        {/* Test Result */}
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              testResult === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {testResult === 'success' ? (
              <><CheckCircle className="w-4 h-4" /> Conexión exitosa al controlador PTS</>
            ) : (
              <><XCircle className="w-4 h-4" /> No se pudo conectar al PTS. Verifique la URL y credenciales.</>
            )}
          </motion.div>
        )}

        {/* Botones */}
        <div className="flex flex-wrap gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Cambios
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            {testing ? (
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            Probar Conexión
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PtsConnectionSettings;
