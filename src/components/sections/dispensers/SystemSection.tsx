import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Battery, Cpu, Clock, MapPin, RefreshCw, AlertCircle, Power, Save, Wifi,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getSystemInfo,
  getSystemDateTime,
  updateSystemDateTime,
  getGpsData,
  restartSystem,
  prop,
} from '../../../services/dispenserService';
import type { PtsPacket, DateTimeData, GpsData } from '../../../types/dispenser';
import { useHeader } from '../../../context/HeaderContext';
import ConfirmActionModal from './ConfirmActionModal';
import PtsConnectionSettings from './PtsConnectionSettings';

const SystemSection: React.FC = () => {
  const [infoPackets, setInfoPackets] = useState<PtsPacket[]>([]);
  const [dateTime, setDateTime] = useState<DateTimeData | null>(null);
  const [gps, setGps] = useState<GpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRestart, setShowRestart] = useState(false);
  const { setSubtitle } = useHeader();

  // DateTime edit
  const [editDateTime, setEditDateTime] = useState('');
  const [editAutoSync, setEditAutoSync] = useState(true);
  const [editUtcOffset, setEditUtcOffset] = useState(-4);
  const [savingDateTime, setSavingDateTime] = useState(false);

  useEffect(() => {
    setSubtitle('Información y configuración del controlador PTS');
    return () => { setSubtitle(''); };
  }, [setSubtitle]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [info, dt, gpsData] = await Promise.all([
        getSystemInfo(),
        getSystemDateTime(),
        getGpsData(),
      ]);
      setInfoPackets(info);
      setDateTime(dt);
      setGps(gpsData);

      if (dt) {
        const dtVal = prop(dt, 'DateTime');
        setEditDateTime(dtVal?.slice(0, 16) || '');
        setEditAutoSync(prop(dt, 'AutoSynchronize') ?? true);
        setEditUtcOffset(prop(dt, 'UTCOffset') ?? -4);
      }
    } catch (err) {
      toast.error('Error al cargar información del sistema');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Extraer datos de los packets del sistema (tolerante a camelCase)
  const getPacketData = (type: string): any => {
    const pkt = infoPackets.find((p) => p.Type === type);
    return pkt?.Data || null;
  };

  const batteryData = getPacketData('BatteryVoltage');
  const cpuData = getPacketData('CpuTemperature');
  const firmwareData = getPacketData('FirmwareInformation');
  const uniqueId = getPacketData('UniqueIdentifier');
  const configId = getPacketData('ConfigurationIdentifier');
  const units = getPacketData('MeasurementUnits');

  const voltage = prop(batteryData, 'Voltage');
  const batteryVolts = voltage != null ? (voltage / 1000).toFixed(2) : '-';
  const cpuTemp = prop(cpuData, 'Temperature') ?? '-';
  const firmwareDate = prop(firmwareData, 'DateTime');
  const pumpProtocols: string[] = prop(firmwareData, 'PumpProtocols') || [];
  const uniqueIdValue = prop(uniqueId, 'Id') || '-';
  const configIdValue = prop(configId, 'Id') || '';
  const volumeUnit = prop(units, 'Volume') || '';
  const tempUnit = prop(units, 'Temperature') || '';

  const handleSaveDateTime = async () => {
    setSavingDateTime(true);
    try {
      await updateSystemDateTime({
        DateTime: editDateTime + ':00',
        AutoSynchronize: editAutoSync,
        UTCOffset: editUtcOffset,
      });
      toast.success('Fecha y hora actualizada');
      loadData();
    } catch {
      toast.error('Error al actualizar fecha/hora');
    } finally {
      setSavingDateTime(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Cargando información del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema PTS</h1>
            <p className="text-gray-600 text-sm mt-1">Información y configuración del controlador</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRestart(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              <Power className="w-4 h-4" />
              Reiniciar PTS
            </motion.button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Batería */}
        <InfoCard
          icon={<Battery className="w-5 h-5 text-green-600" />}
          title="Batería"
          value={`${batteryVolts} V`}
          subtitle={voltage != null ? `${voltage} mV` : ''}
        />

        {/* CPU */}
        <InfoCard
          icon={<Cpu className="w-5 h-5 text-blue-600" />}
          title="Temperatura CPU"
          value={`${cpuTemp}°C`}
          subtitle={Number(cpuTemp) > 70 ? 'Temperatura alta' : 'Normal'}
          alert={Number(cpuTemp) > 70}
        />

        {/* ID Único */}
        <InfoCard
          icon={<Wifi className="w-5 h-5 text-purple-600" />}
          title="ID Controlador"
          value={uniqueIdValue}
          subtitle={configIdValue ? `Config: ${configIdValue}` : ''}
        />

        {/* Firmware */}
        <InfoCard
          icon={<Cpu className="w-5 h-5 text-indigo-600" />}
          title="Firmware"
          value={firmwareDate ? new Date(firmwareDate).toLocaleDateString('es-DO') : '-'}
          subtitle={pumpProtocols.join(', ') || ''}
        />

        {/* Unidades */}
        <InfoCard
          icon={<AlertCircle className="w-5 h-5 text-gray-600" />}
          title="Unidades de Medida"
          value={volumeUnit || tempUnit ? `Vol: ${volumeUnit}, Temp: ${tempUnit}` : '-'}
          subtitle=""
        />

        {/* GPS */}
        <InfoCard
          icon={<MapPin className="w-5 h-5 text-red-500" />}
          title="GPS"
          value={gps ? `${(prop(gps, 'Latitude') ?? 0).toFixed(4)}°${prop(gps, 'NorthSouthIndicator') || ''}, ${(prop(gps, 'Longitude') ?? 0).toFixed(4)}°${prop(gps, 'EastWestIndicator') || ''}` : '-'}
          subtitle={gps ? `Estado: ${prop(gps, 'Status') || '-'} | Modo: ${prop(gps, 'Mode') || '-'}` : 'Sin datos GPS'}
        />
      </div>

      {/* Conexión PTS */}
      <PtsConnectionSettings />

      {/* Fecha y Hora */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Fecha y Hora del Sistema</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora</label>
            <input
              type="datetime-local"
              value={editDateTime}
              onChange={(e) => setEditDateTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offset UTC</label>
            <input
              type="number"
              value={editUtcOffset}
              onChange={(e) => setEditUtcOffset(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sincronización NTP</label>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setEditAutoSync(!editAutoSync)}
                className={`relative w-11 h-6 rounded-full transition-colors ${editAutoSync ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${editAutoSync ? 'translate-x-5' : ''}`} />
              </button>
              <span className="text-sm text-gray-600">{editAutoSync ? 'Activada' : 'Desactivada'}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveDateTime}
            disabled={savingDateTime}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
          >
            {savingDateTime ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Fecha/Hora
          </motion.button>
        </div>
      </div>

      {/* Restart Modal */}
      <ConfirmActionModal
        isOpen={showRestart}
        onClose={() => setShowRestart(false)}
        onConfirm={async () => {
          await restartSystem();
          toast.success('Reinicio del PTS iniciado. El sistema estará offline por ~60 segundos.');
        }}
        title="Reiniciar Controlador PTS"
        message="¿Está seguro de reiniciar el controlador PTS? La conexión se perderá por aproximadamente 60 segundos y todas las operaciones se detendrán."
        confirmLabel="Reiniciar"
        confirmColor="red"
      />
    </div>
  );
};

// Card de info reutilizable
const InfoCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  alert?: boolean;
}> = ({ icon, title, value, subtitle, alert }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-lg shadow-sm p-5 border-2 ${alert ? 'border-red-300' : 'border-transparent'}`}
  >
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <span className="text-sm font-medium text-gray-500">{title}</span>
    </div>
    <p className="text-lg font-semibold text-gray-900 truncate">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>}
  </motion.div>
);

export default SystemSection;
