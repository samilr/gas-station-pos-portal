import React, { useState, useEffect, useCallback } from 'react';
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
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

const POLLING_INTERVAL = 2000;

const STATE_TEXT: Record<PumpVisualState, string> = {
  available: 'Disponible',
  dispensing: 'Dispensando',
  locked: 'Bloqueada',
  offline: 'Offline',
  'end-of-transaction': 'Fin Transaccion',
};

const STATE_DOT_COLOR: Record<PumpVisualState, string> = {
  available: 'green',
  dispensing: 'orange',
  locked: 'red',
  offline: 'gray',
  'end-of-transaction': 'blue',
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

      const newStatuses = new Map<number, PumpStatusPacket>();
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

  // Polling: solo dispara si la llamada anterior ya termino
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
        return { fuel: mapFuelProductName(d.FuelGradeName), volume: d.Volume, amount: d.Amount, lastDateTime: d.DateTimeStart };
      }
      case 'PumpEndOfTransactionStatus': {
        const d = packet.Data as PumpEndOfTransactionStatusData;
        return { fuel: mapFuelProductName(d.FuelGradeName), volume: d.Volume, amount: d.Amount, lastDateTime: d.DateTime };
      }
      case 'PumpIdleStatus': {
        const d = packet.Data as PumpIdleStatusData;
        if (d.LastTransaction > 0) {
          return { fuel: mapFuelProductName(d.LastFuelGradeName), volume: d.LastVolume, amount: d.LastAmount, lastDateTime: d.LastDateTime };
        }
        break;
      }
      case 'PumpOfflineStatus': {
        const d = packet.Data as PumpOfflineStatusData;
        if (d.LastTransaction > 0) {
          return { fuel: mapFuelProductName(d.LastFuelGradeName), volume: d.LastVolume, amount: d.LastAmount, lastDateTime: d.LastDateTime };
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

  if (loading && pumpStatuses.size === 0) {
    return (
      <div className="space-y-1">
        <div className="bg-white rounded-sm p-3">
          <div className="h-6 bg-gray-200 rounded w-64 mb-1 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-96 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-sm p-3 bg-gray-200 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar>
        <CompactButton
          variant="danger"
          onClick={handleLockAll}
          disabled={isLockingAll || isUnlockingAll}
        >
          {isLockingAll ? (
            <><div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Bloqueando...</>
          ) : (
            <><Lock className="w-3.5 h-3.5" /> Bloquear Todas</>
          )}
        </CompactButton>

        <CompactButton
          variant="ghost"
          onClick={handleUnlockAll}
          disabled={isLockingAll || isUnlockingAll}
          className="border-green-300 text-green-600 hover:bg-green-50"
        >
          {isUnlockingAll ? (
            <><div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /> Desbloqueando...</>
          ) : (
            <><Unlock className="w-3.5 h-3.5" /> Desbloquear Todas</>
          )}
        </CompactButton>

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los estados</option>
          <option value="available">Disponibles</option>
          <option value="dispensing">Dispensando</option>
          <option value="locked">Bloqueadas</option>
          <option value="offline">Offline</option>
          <option value="end-of-transaction">Fin de transaccion</option>
        </select>

        <CompactButton
          variant="icon"
          onClick={() => setViewMode('table')}
          className={viewMode === 'table' ? 'bg-blue-100 text-blue-600' : ''}
        >
          <List className="w-4 h-4" />
        </CompactButton>
        <CompactButton
          variant="icon"
          onClick={() => setViewMode('cards')}
          className={viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : ''}
        >
          <LayoutGrid className="w-4 h-4" />
        </CompactButton>
      </Toolbar>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <div>
            <p className="text-red-700 text-sm font-medium">Error de conexion</p>
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Contenido */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header">
                  <th className="px-2 text-left font-medium text-gray-500">#</th>
                  <th className="px-2 text-left font-medium text-gray-500">Estado</th>
                  <th className="px-2 text-left font-medium text-gray-500">Combustible</th>
                  <th className="px-2 text-left font-medium text-gray-500">Volumen</th>
                  <th className="px-2 text-left font-medium text-gray-500">Monto</th>
                  <th className="px-2 text-left font-medium text-gray-500">Ultima Transaccion</th>
                  <th className="px-2 text-left font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPumps.map(([number, packet]) => {
                  const state = getPumpVisualState(packet);
                  const pumpData = getPumpData(packet);
                  const locked = isPumpLocked(packet);

                  return (
                    <tr key={number} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
                      <td className="px-2 text-sm whitespace-nowrap">
                        <span className="font-bold text-gray-900">#{number}</span>
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        <StatusDot color={STATE_DOT_COLOR[state]} label={STATE_TEXT[state]} />
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap text-gray-900">{pumpData.fuel}</td>
                      <td className="px-2 text-sm whitespace-nowrap text-gray-900">{pumpData.volume.toFixed(3)} G.</td>
                      <td className="px-2 text-sm whitespace-nowrap font-medium text-gray-900">{formatCurrency(pumpData.amount)}</td>
                      <td className="px-2 text-sm whitespace-nowrap text-gray-900">
                        {pumpData.lastDateTime ? formatDateTime(pumpData.lastDateTime) : '-'}
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        {state === 'locked' ? (
                          <button
                            onClick={() => handlePumpLockToggle(number, true)}
                            className="text-green-600 hover:text-green-700 text-xs font-medium"
                          >
                            Desbloquear
                          </button>
                        ) : state === 'available' ? (
                          <button
                            onClick={() => handlePumpLockToggle(number, false)}
                            className="text-red-600 hover:text-red-700 text-xs font-medium"
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
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
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
        </div>
      )}

      {/* Leyenda */}
      <div className="bg-blue-50 border border-blue-200 rounded-sm p-2">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-0.5">Leyenda de Estados:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li><span className="font-semibold text-green-600">Verde:</span> Dispensadora disponible</li>
              <li><span className="font-semibold text-orange-600">Naranja:</span> Dispensadora dispensando</li>
              <li><span className="font-semibold text-red-600">Rojo:</span> Dispensadora bloqueada</li>
              <li><span className="font-semibold text-gray-600">Gris:</span> Dispensadora offline</li>
              <li><span className="font-semibold text-blue-600">Azul:</span> Fin de transaccion</li>
            </ul>
            <p className="mt-1 text-xs opacity-75">
              Los datos se actualizan automaticamente cada 2 segundos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispensersSection;
