import React, { useState, useEffect, useCallback } from 'react';
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
import { CompactButton } from '../../ui';
import Toolbar from '../../ui/Toolbar';

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
    setSubtitle('Informacion y configuracion del controlador PTS');
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
      toast.error('Error al cargar informacion del sistema');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
      <div className="bg-white rounded-sm shadow-sm p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-500 text-xs">Cargando informacion del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar>
        <CompactButton variant="icon" onClick={loadData}>
          <RefreshCw className="w-3.5 h-3.5" />
        </CompactButton>
        <CompactButton variant="danger" onClick={() => setShowRestart(true)}>
          <Power className="w-3.5 h-3.5" />
          Reiniciar PTS
        </CompactButton>
      </Toolbar>

      {/* Info table */}
      <div className="bg-white rounded-sm shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="h-8 text-xs uppercase tracking-wide bg-table-header">
              <th className="px-2 text-left font-medium text-gray-500 w-1/3">Parametro</th>
              <th className="px-2 text-left font-medium text-gray-500">Valor</th>
              <th className="px-2 text-left font-medium text-gray-500">Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
              <td className="px-2 text-sm whitespace-nowrap"><Battery className="w-3.5 h-3.5 text-green-600 inline mr-1" />Bateria</td>
              <td className="px-2 text-sm whitespace-nowrap font-medium">{batteryVolts} V</td>
              <td className="px-2 text-xs text-gray-500 whitespace-nowrap">{voltage != null ? `${voltage} mV` : ''}</td>
            </tr>
            <tr className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
              <td className="px-2 text-sm whitespace-nowrap"><Cpu className="w-3.5 h-3.5 text-blue-600 inline mr-1" />Temperatura CPU</td>
              <td className="px-2 text-sm whitespace-nowrap font-medium">{cpuTemp}C</td>
              <td className="px-2 text-xs whitespace-nowrap">
                {Number(cpuTemp) > 70 ? <span className="text-red-600">Temperatura alta</span> : <span className="text-gray-500">Normal</span>}
              </td>
            </tr>
            <tr className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
              <td className="px-2 text-sm whitespace-nowrap"><Wifi className="w-3.5 h-3.5 text-purple-600 inline mr-1" />ID Controlador</td>
              <td className="px-2 text-sm whitespace-nowrap font-medium text-ellipsis overflow-hidden">{uniqueIdValue}</td>
              <td className="px-2 text-xs text-gray-500 whitespace-nowrap text-ellipsis overflow-hidden">{configIdValue ? `Config: ${configIdValue}` : ''}</td>
            </tr>
            <tr className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
              <td className="px-2 text-sm whitespace-nowrap"><Cpu className="w-3.5 h-3.5 text-indigo-600 inline mr-1" />Firmware</td>
              <td className="px-2 text-sm whitespace-nowrap font-medium">{firmwareDate ? new Date(firmwareDate).toLocaleDateString('es-DO') : '-'}</td>
              <td className="px-2 text-xs text-gray-500 whitespace-nowrap text-ellipsis overflow-hidden">{pumpProtocols.join(', ') || ''}</td>
            </tr>
            <tr className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
              <td className="px-2 text-sm whitespace-nowrap"><AlertCircle className="w-3.5 h-3.5 text-gray-600 inline mr-1" />Unidades</td>
              <td className="px-2 text-sm whitespace-nowrap font-medium">{volumeUnit || tempUnit ? `Vol: ${volumeUnit}, Temp: ${tempUnit}` : '-'}</td>
              <td className="px-2 text-xs text-gray-500 whitespace-nowrap"></td>
            </tr>
            <tr className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
              <td className="px-2 text-sm whitespace-nowrap"><MapPin className="w-3.5 h-3.5 text-red-500 inline mr-1" />GPS</td>
              <td className="px-2 text-sm whitespace-nowrap font-medium text-ellipsis overflow-hidden">
                {gps ? `${(prop(gps, 'Latitude') ?? 0).toFixed(4)}${prop(gps, 'NorthSouthIndicator') || ''}, ${(prop(gps, 'Longitude') ?? 0).toFixed(4)}${prop(gps, 'EastWestIndicator') || ''}` : '-'}
              </td>
              <td className="px-2 text-xs text-gray-500 whitespace-nowrap text-ellipsis overflow-hidden">
                {gps ? `Estado: ${prop(gps, 'Status') || '-'} | Modo: ${prop(gps, 'Mode') || '-'}` : 'Sin datos GPS'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Conexion PTS */}
      <PtsConnectionSettings />

      {/* Fecha y Hora */}
      <div className="bg-white rounded-sm shadow-sm p-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900">Fecha y Hora del Sistema</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Fecha y Hora</label>
            <input
              type="datetime-local"
              value={editDateTime}
              onChange={(e) => setEditDateTime(e.target.value)}
              className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Offset UTC</label>
            <input
              type="number"
              value={editUtcOffset}
              onChange={(e) => setEditUtcOffset(Number(e.target.value))}
              className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Sincronizacion NTP</label>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setEditAutoSync(!editAutoSync)}
                className={`relative w-9 h-5 rounded-full transition-colors ${editAutoSync ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${editAutoSync ? 'translate-x-4' : ''}`} />
              </button>
              <span className="text-xs text-gray-600">{editAutoSync ? 'Activada' : 'Desactivada'}</span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <CompactButton variant="primary" onClick={handleSaveDateTime} disabled={savingDateTime}>
            {savingDateTime ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar Fecha/Hora
          </CompactButton>
        </div>
      </div>

      {/* Restart Modal */}
      <ConfirmActionModal
        isOpen={showRestart}
        onClose={() => setShowRestart(false)}
        onConfirm={async () => {
          await restartSystem();
          toast.success('Reinicio del PTS iniciado. El sistema estara offline por ~60 segundos.');
        }}
        title="Reiniciar Controlador PTS"
        message="Esta seguro de reiniciar el controlador PTS? La conexion se perdera por aproximadamente 60 segundos y todas las operaciones se detendran."
        confirmLabel="Reiniciar"
        confirmColor="red"
      />
    </div>
  );
};

export default SystemSection;
