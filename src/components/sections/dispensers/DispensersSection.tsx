import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Lock, Unlock, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import DispenserCard from './DispenserCard';
import {
  getAllPumpStatuses,
  lockAllPumps,
  unlockAllPumps,
  getPumpVisualState,
  isPumpLocked,
  getPumpNumber,
  lockPump,
  unlockPump,
} from '../../../services/dispenserService';
import type {
  PumpStatusPacket,
  PumpFillingStatusData,
  PumpIdleStatusData,
  PumpOfflineStatusData,
  PumpEndOfTransactionStatusData,
  PumpVisualState,
} from '../../../types/dispenser';
import { useHeader } from '../../../context/HeaderContext';

const POLLING_INTERVAL = 2000;
const PUMP_COUNT = 18;

const STATE_TEXT: Record<PumpVisualState, string> = {
  available: 'Disponible',
  dispensing: 'Dispensando',
  locked: 'Bloqueada',
  offline: 'Offline',
  'end-of-transaction': 'Fin Transacción',
};

const STATE_COLOR: Record<PumpVisualState, string> = {
  available: 'text-green-600 bg-green-50',
  dispensing: 'text-orange-600 bg-orange-50',
  locked: 'text-red-600 bg-red-50',
  offline: 'text-gray-600 bg-gray-50',
  'end-of-transaction': 'text-blue-600 bg-blue-50',
};

const DispensersSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [pumpStatuses, setPumpStatuses] = useState<Map<number, PumpStatusPacket | null>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLockingAll, setIsLockingAll] = useState(false);
  const [isUnlockingAll, setIsUnlockingAll] = useState(false);
  const [filterState, setFilterState] = useState<string>('all');
  const { setSubtitle } = useHeader();

  // Inicializar el mapa
  useEffect(() => {
    const initial = new Map<number, PumpStatusPacket | null>();
    for (let i = 1; i <= PUMP_COUNT; i++) initial.set(i, null);
    setPumpStatuses(initial);
  }, []);

  useEffect(() => {
    setSubtitle('Monitoreo en tiempo real del estado de las dispensadoras');
    return () => { setSubtitle(''); };
  }, [setSubtitle]);

  const fetchingRef = React.useRef(false);

  const fetchPumpStatuses = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const packets = await getAllPumpStatuses();

      const newStatuses = new Map<number, PumpStatusPacket | null>();
      for (let i = 1; i <= PUMP_COUNT; i++) newStatuses.set(i, null);

      packets.forEach((packet) => {
        const num = getPumpNumber(packet as PumpStatusPacket);
        newStatuses.set(num, packet as PumpStatusPacket);
      });

      setPumpStatuses(newStatuses);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error al obtener estado de dispensadoras:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Polling: solo dispara si la llamada anterior ya terminó
  useEffect(() => {
    fetchPumpStatuses();
    const interval = setInterval(fetchPumpStatuses, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPumpStatuses]);

  const handleLockAll = async () => {
    if (isLockingAll || isUnlockingAll) return;
    try {
      setIsLockingAll(true);
      await lockAllPumps();
      toast.success('Todas las dispensadoras han sido bloqueadas', { duration: 3000 });
      setTimeout(fetchPumpStatuses, 500);
    } catch (err) {
      console.error('Error al bloquear todas:', err);
      toast.error('Error al bloquear todas las dispensadoras', { duration: 3000 });
    } finally {
      setIsLockingAll(false);
    }
  };

  const handleUnlockAll = async () => {
    if (isLockingAll || isUnlockingAll) return;
    try {
      setIsUnlockingAll(true);
      await unlockAllPumps();
      toast.success('Todas las dispensadoras han sido desbloqueadas', { duration: 3000 });
      setTimeout(fetchPumpStatuses, 500);
    } catch (err) {
      console.error('Error al desbloquear todas:', err);
      toast.error('Error al desbloquear todas las dispensadoras', { duration: 3000 });
    } finally {
      setIsUnlockingAll(false);
    }
  };

  const handlePumpLockToggle = async (pumpNumber: number, isLocked: boolean) => {
    try {
      if (isLocked) {
        await unlockPump(pumpNumber);
        toast.success(`Dispensadora ${pumpNumber} desbloqueada`, { duration: 2000 });
      } else {
        await lockPump(pumpNumber);
        toast.success(`Dispensadora ${pumpNumber} bloqueada`, { duration: 2000 });
      }
      setTimeout(fetchPumpStatuses, 500);
    } catch (err) {
      console.error('Error al cambiar estado de bloqueo:', err);
      toast.error(`Error al ${isLocked ? 'desbloquear' : 'bloquear'} dispensadora ${pumpNumber}`, { duration: 3000 });
    }
  };

  const formatDateTime = (dateTimeString: string | null | undefined): string => {
    if (!dateTimeString) return '-';
    try {
      return new Date(dateTimeString).toLocaleString('es-DO', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    } catch {
      return dateTimeString;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(amount);

  const getPumpData = (packet: PumpStatusPacket | null) => {
    if (!packet) return { fuel: '-', volume: 0, amount: 0, lastDateTime: null as string | null };

    switch (packet.Type) {
      case 'PumpFillingStatus': {
        const d = packet.Data as PumpFillingStatusData;
        return { fuel: d.FuelGradeName, volume: d.Volume, amount: d.Amount, lastDateTime: d.DateTimeStart };
      }
      case 'PumpEndOfTransactionStatus': {
        const d = packet.Data as PumpEndOfTransactionStatusData;
        return { fuel: d.FuelGradeName, volume: d.Volume, amount: d.Amount, lastDateTime: d.DateTime };
      }
      case 'PumpIdleStatus': {
        const d = packet.Data as PumpIdleStatusData;
        if (d.LastTransaction > 0) {
          return { fuel: d.LastFuelGradeName, volume: d.LastVolume, amount: d.LastAmount, lastDateTime: d.LastDateTime };
        }
        break;
      }
      case 'PumpOfflineStatus': {
        const d = packet.Data as PumpOfflineStatusData;
        if (d.LastTransaction > 0) {
          return { fuel: d.LastFuelGradeName, volume: d.LastVolume, amount: d.LastAmount, lastDateTime: d.LastDateTime };
        }
        break;
      }
    }
    return { fuel: '-', volume: 0, amount: 0, lastDateTime: null as string | null };
  };

  // Filtrar
  const filteredPumps = Array.from(pumpStatuses.entries()).filter(([, packet]) => {
    if (filterState === 'all') return true;
    return getPumpVisualState(packet) === filterState;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monitoreo de Dispensadoras</h1>
            <p className="text-gray-600 text-sm mt-1">Monitoreo en tiempo real del estado de las dispensadoras</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLockAll}
            disabled={isLockingAll || isUnlockingAll}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
          >
            {isLockingAll ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Bloqueando...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Bloquear Todas</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUnlockAll}
            disabled={isLockingAll || isUnlockingAll}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
          >
            {isUnlockingAll ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Desbloqueando...</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Desbloquear Todas</span>
              </>
            )}
          </motion.button>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="available">Disponibles</option>
            <option value="dispensing">Dispensando</option>
            <option value="locked">Bloqueadas</option>
            <option value="offline">Offline</option>
            <option value="end-of-transaction">Fin de transacción</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-red-700 font-medium">Error de conexión</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Contenido */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Combustible</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volumen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Transacción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPumps.map(([number, packet]) => {
                    const state = getPumpVisualState(packet);
                    const pumpData = getPumpData(packet);
                    const locked = isPumpLocked(packet);

                    return (
                      <tr key={number} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">#{number}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATE_COLOR[state]}`}>
                            {STATE_TEXT[state]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{pumpData.fuel}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{pumpData.volume.toFixed(3)} G.</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(pumpData.amount)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {pumpData.lastDateTime ? formatDateTime(pumpData.lastDateTime) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {state === 'locked' ? (
                            <button
                              onClick={() => handlePumpLockToggle(number, true)}
                              className="text-green-600 hover:text-green-700 font-medium"
                            >
                              Desbloquear
                            </button>
                          ) : state === 'available' ? (
                            <button
                              onClick={() => handlePumpLockToggle(number, false)}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Bloquear
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          >
            {filteredPumps.map(([number, packet]) => (
              <DispenserCard
                key={number}
                pumpNumber={number}
                packet={packet}
                isLoading={loading && packet === null}
                error={error && packet === null ? error : undefined}
                onStatusChange={fetchPumpStatuses}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leyenda */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Leyenda de Estados:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="font-semibold text-green-600">Verde:</span> Dispensadora disponible</li>
              <li><span className="font-semibold text-orange-600">Naranja:</span> Dispensadora dispensando (con animación)</li>
              <li><span className="font-semibold text-red-600">Rojo:</span> Dispensadora bloqueada</li>
              <li><span className="font-semibold text-gray-600">Gris:</span> Dispensadora offline</li>
              <li><span className="font-semibold text-blue-600">Azul:</span> Fin de transacción (estado transiente)</li>
            </ul>
            <p className="mt-2 text-xs opacity-75">
              Los datos se actualizan automáticamente cada 2 segundos
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DispensersSection;
