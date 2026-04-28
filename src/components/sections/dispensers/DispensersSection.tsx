import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle, Lock, Unlock, LayoutGrid, List, Fuel, Play, Square, Pause, RotateCcw, Zap, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DispenserCard from './DispenserCard';
import DispenserMonitorCard from './DispenserMonitorCard';
import AuthorizeModal from './AuthorizeModal';
import ConfirmActionModal from './ConfirmActionModal';
import {
  getAllPumpStatuses,
  lockAllPumps,
  unlockAllPumps,
  getPumpVisualState,
  getPumpNumber,
  lockPump,
  unlockPump,
  stopPump,
  emergencyStopPump,
  suspendPump,
  resumePump,
  closeTransaction,
} from '../../../services/dispenserService';
import type {
  PumpStatusPacket,
  PumpFillingStatusData,
  PumpIdleStatusData,
  PumpOfflineStatusData,
  PumpEndOfTransactionStatusData,
  PumpVisualState,
  NozzlePrice,
} from '../../../types/dispenser';
import type { PumpStatusMeta } from '../../../types/ptsConfig';
import { useHeader } from '../../../context/HeaderContext';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

// Mapeo de indice de pistola a codigo de grado de combustible (usado para autorizar)
const NOZZLE_FUEL_GRADE_MAP: Record<number, { id: number; code: string }> = {
  1: { id: 1, code: '1-025' },
  2: { id: 2, code: '1-001' },
  3: { id: 3, code: '2-025' },
  4: { id: 4, code: '2-001' },
  5: { id: 5, code: '' },
  6: { id: 6, code: '' },
};

// Alineado con `PumpStatusPollerHostedService` del backend (5s).
// El proxy PTS sirve `/dispensers/status` desde un cache que se refresca
// cada 5s — polear más rápido desperdicia llamadas sin traer data nueva.
const POLLING_INTERVAL = 5000;

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
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'visual'>('visual');
  const [pumpStatuses, setPumpStatuses] = useState<Map<number, PumpStatusPacket | null>>(new Map());
  const [statusMeta, setStatusMeta] = useState<PumpStatusMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<string>('all');
  const { setSubtitle } = useHeader();

  // Estado de selección + acciones
  const [selectedPumps, setSelectedPumps] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [authorizeModal, setAuthorizeModal] = useState<{ pump: number; nozzlePrices: NozzlePrice[] } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: 'red' | 'orange' | 'green';
    onConfirm: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    setSubtitle('Monitoreo en tiempo real del estado de las dispensadoras');
    return () => { setSubtitle(''); };
  }, [setSubtitle]);

  const fetchingRef = React.useRef(false);

  const fetchPumpStatuses = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { packets, meta } = await getAllPumpStatuses();

      const newStatuses = new Map<number, PumpStatusPacket>();
      packets.forEach((packet) => {
        const num = getPumpNumber(packet);
        newStatuses.set(num, packet);
      });

      setPumpStatuses(newStatuses);
      setStatusMeta(meta);
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

  // ===== Selección + acciones =====
  const togglePumpSelection = (num: number) => {
    setSelectedPumps((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };
  const selectAll = () => setSelectedPumps(new Set(pumpStatuses.keys()));
  const clearSelection = () => setSelectedPumps(new Set());

  const hasSelection = selectedPumps.size > 0;
  const hasDispensingSelected = Array.from(selectedPumps).some((n) =>
    getPumpVisualState(pumpStatuses.get(n) || null) === 'dispensing'
  );
  // Hay al menos una bomba bloqueada en todo el set
  const hasLockedPumps = Array.from(pumpStatuses.values()).some(
    (p) => getPumpVisualState(p) === 'locked'
  );
  // Hay al menos una bomba bloqueada dentro de la selección
  const hasLockedSelected = Array.from(selectedPumps).some(
    (n) => getPumpVisualState(pumpStatuses.get(n) || null) === 'locked'
  );
  // Mostrar botón "Desbloquear" solo si aplica: (sin selección → hay al menos 1 bloqueada) ó (con selección → hay al menos 1 bloqueada en la selección)
  const showUnlockButton = hasSelection ? hasLockedSelected : hasLockedPumps;

  const runBulkAction = async (label: string, action: () => Promise<void>) => {
    setActionLoading(label);
    try {
      await action();
      setTimeout(fetchPumpStatuses, 500);
    } finally {
      setActionLoading(null);
    }
  };

  // Bloquear: si hay selección → masivo sobre los seleccionados; si no → todas (con confirmación)
  const handleLock = () => {
    if (hasSelection) {
      runBulkAction('lock', async () => {
        for (const num of selectedPumps) {
          try { await lockPump(num); } catch { toast.error(`Error al bloquear bomba ${num}`); }
        }
        toast.success(`${selectedPumps.size} bomba(s) bloqueada(s)`, { duration: 2000 });
      });
      return;
    }
    setConfirmModal({
      title: 'Bloquear Todas',
      message: '¿Bloquear TODAS las bombas? Ninguna podrá dispensar hasta desbloquearlas.',
      confirmLabel: 'Bloquear Todas',
      confirmColor: 'red',
      onConfirm: async () => {
        await lockAllPumps();
        toast.success('Todas las bombas bloqueadas', { duration: 3000 });
        setTimeout(fetchPumpStatuses, 500);
      },
    });
  };
  const handleUnlock = () => {
    if (hasSelection) {
      runBulkAction('unlock', async () => {
        for (const num of selectedPumps) {
          try { await unlockPump(num); } catch { toast.error(`Error al desbloquear bomba ${num}`); }
        }
        toast.success(`${selectedPumps.size} bomba(s) desbloqueada(s)`, { duration: 2000 });
      });
      return;
    }
    setConfirmModal({
      title: 'Desbloquear Todas',
      message: '¿Desbloquear TODAS las bombas?',
      confirmLabel: 'Desbloquear Todas',
      confirmColor: 'green',
      onConfirm: async () => {
        await unlockAllPumps();
        toast.success('Todas las bombas desbloqueadas', { duration: 3000 });
        setTimeout(fetchPumpStatuses, 500);
      },
    });
  };
  const handleBulkStop = () => {
    if (!hasSelection) return;
    runBulkAction('stop', async () => {
      for (const num of selectedPumps) {
        try { await stopPump(num); } catch { toast.error(`Error al detener bomba ${num}`); }
      }
      toast.success(`${selectedPumps.size} bomba(s) detenida(s)`, { duration: 2000 });
    });
  };
  const handleBulkSuspend = () => {
    if (!hasSelection) return;
    runBulkAction('suspend', async () => {
      for (const num of selectedPumps) {
        try { await suspendPump(num); } catch { toast.error(`Error al suspender bomba ${num}`); }
      }
      toast.success(`${selectedPumps.size} bomba(s) suspendida(s)`, { duration: 2000 });
    });
  };
  const handleBulkResume = () => {
    if (!hasSelection) return;
    runBulkAction('resume', async () => {
      for (const num of selectedPumps) {
        try { await resumePump(num); } catch { toast.error(`Error al reanudar bomba ${num}`); }
      }
      toast.success(`${selectedPumps.size} bomba(s) reanudada(s)`, { duration: 2000 });
    });
  };
  const handleBulkCloseTransaction = () => {
    if (!hasSelection) return;
    runBulkAction('close', async () => {
      for (const num of selectedPumps) {
        try { await closeTransaction(num); } catch { toast.error(`Error al cerrar transaccion bomba ${num}`); }
      }
      toast.success('Transaccion(es) cerrada(s)', { duration: 2000 });
    });
  };
  const handleBulkEmergencyStop = () => {
    if (!hasSelection) return;
    const pumps = Array.from(selectedPumps).sort((a, b) => a - b).join(', ');
    setConfirmModal({
      title: 'Parada de Emergencia',
      message: `¿Ejecutar PARADA DE EMERGENCIA en las bombas ${pumps}? Detiene el dispensado de forma inmediata.`,
      confirmLabel: 'Parada de Emergencia',
      confirmColor: 'red',
      onConfirm: async () => {
        for (const num of selectedPumps) {
          try { await emergencyStopPump(num); } catch { toast.error(`Error emergencia bomba ${num}`); }
        }
        toast.success('Parada de emergencia ejecutada', { duration: 3000 });
        setTimeout(fetchPumpStatuses, 500);
      },
    });
  };

  const handleAuthorize = () => {
    if (selectedPumps.size !== 1) {
      toast.error('Seleccione exactamente una bomba para autorizar');
      return;
    }
    const pumpNum = Array.from(selectedPumps)[0];
    const packet = pumpStatuses.get(pumpNum);
    let nozzlePrices: NozzlePrice[] = [];
    if (packet?.Type === 'PumpIdleStatus') {
      const d = packet.Data as any;
      const rawPrices: number[] = d.NozzlePrices || d.nozzlePrices || [];
      rawPrices.forEach((price: number, index: number) => {
        if (price > 0) {
          const nozzleNum = index + 1;
          const gradeInfo = NOZZLE_FUEL_GRADE_MAP[nozzleNum];
          const gradeName = gradeInfo?.code ? mapFuelProductName(gradeInfo.code) : `Pistola ${nozzleNum}`;
          nozzlePrices.push({ Nozzle: nozzleNum, FuelGradeId: gradeInfo?.id || nozzleNum, FuelGradeName: gradeName, Price: price });
        }
      });
    }
    if (nozzlePrices.length === 0) {
      nozzlePrices = [{ Nozzle: 1, FuelGradeId: 1, FuelGradeName: 'Combustible', Price: 0 }];
    }
    setAuthorizeModal({ pump: pumpNum, nozzlePrices });
  };

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
      {/* Toolbar — todas las acciones de Control integradas */}
      <Toolbar>
        {/* Selección */}
        <CompactButton variant="ghost" onClick={selectAll} disabled={pumpStatuses.size === 0}>
          Seleccionar todas
        </CompactButton>
        {hasSelection && (
          <>
            <CompactButton variant="ghost" onClick={clearSelection}>
              <X className="w-3 h-3" /> Limpiar
            </CompactButton>
            <span className="text-xs text-blue-600 font-semibold px-1">
              {selectedPumps.size} sel.
            </span>
          </>
        )}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Acciones — contexto-dependientes */}
        <CompactButton
          variant="primary"
          onClick={handleAuthorize}
          disabled={selectedPumps.size !== 1 || !!actionLoading}
          title={selectedPumps.size !== 1 ? 'Seleccione exactamente 1 bomba' : ''}
        >
          <Fuel className="w-3.5 h-3.5" /> Autorizar
        </CompactButton>

        <CompactButton
          variant="danger"
          onClick={handleLock}
          disabled={!!actionLoading}
        >
          {actionLoading === 'lock' ? (
            <><div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Bloqueando...</>
          ) : (
            <><Lock className="w-3.5 h-3.5" /> {hasSelection ? 'Bloquear' : 'Bloquear Todas'}</>
          )}
        </CompactButton>

        {showUnlockButton && (
          <CompactButton
            variant="ghost"
            onClick={handleUnlock}
            disabled={!!actionLoading}
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            {actionLoading === 'unlock' ? (
              <><div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /> Desbloqueando...</>
            ) : (
              <><Unlock className="w-3.5 h-3.5" /> {hasSelection ? 'Desbloquear' : 'Desbloquear Todas'}</>
            )}
          </CompactButton>
        )}

        <CompactButton
          variant="ghost"
          onClick={handleBulkStop}
          disabled={!hasDispensingSelected || !!actionLoading}
          className="border-orange-300 text-orange-600 hover:bg-orange-50"
          title={!hasDispensingSelected ? 'Requiere bomba dispensando seleccionada' : ''}
        >
          {actionLoading === 'stop' ? (
            <><div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" /> ...</>
          ) : (
            <><Square className="w-3.5 h-3.5" /> Detener</>
          )}
        </CompactButton>

        <CompactButton
          variant="ghost"
          onClick={handleBulkSuspend}
          disabled={!hasDispensingSelected || !!actionLoading}
          className="border-yellow-400 text-yellow-700 hover:bg-yellow-50"
          title={!hasDispensingSelected ? 'Requiere bomba dispensando seleccionada' : ''}
        >
          {actionLoading === 'suspend' ? (
            <><div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /> ...</>
          ) : (
            <><Pause className="w-3.5 h-3.5" /> Suspender</>
          )}
        </CompactButton>

        <CompactButton
          variant="ghost"
          onClick={handleBulkResume}
          disabled={!hasSelection || !!actionLoading}
          className="border-teal-300 text-teal-600 hover:bg-teal-50"
          title={!hasSelection ? 'Seleccione al menos 1 bomba' : ''}
        >
          {actionLoading === 'resume' ? (
            <><div className="w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /> ...</>
          ) : (
            <><Play className="w-3.5 h-3.5" /> Reanudar</>
          )}
        </CompactButton>

        <CompactButton
          variant="ghost"
          onClick={handleBulkCloseTransaction}
          disabled={!hasSelection || !!actionLoading}
          className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
          title={!hasSelection ? 'Seleccione al menos 1 bomba' : ''}
        >
          {actionLoading === 'close' ? (
            <><div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> ...</>
          ) : (
            <><RotateCcw className="w-3.5 h-3.5" /> Cerrar Trans.</>
          )}
        </CompactButton>

        <CompactButton
          onClick={handleBulkEmergencyStop}
          disabled={!hasSelection || !!actionLoading}
          className="bg-red-600 text-white hover:bg-red-700 border border-red-700"
          title={!hasSelection ? 'Seleccione al menos 1 bomba' : ''}
        >
          <Zap className="w-3.5 h-3.5" /> Emergencia
        </CompactButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

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
          title="Vista de tabla"
        >
          <List className="w-4 h-4" />
        </CompactButton>
        <CompactButton
          variant="icon"
          onClick={() => setViewMode('cards')}
          className={viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : ''}
          title="Vista compacta"
        >
          <LayoutGrid className="w-4 h-4" />
        </CompactButton>
        <CompactButton
          variant="icon"
          onClick={() => setViewMode('visual')}
          className={viewMode === 'visual' ? 'bg-blue-100 text-blue-600' : ''}
          title="Vista visual (surtidoras con SVG)"
        >
          <Fuel className="w-4 h-4" />
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

      {/* Cache stale warning — el snapshot del proxy PTS está caducado o el último poll falló */}
      {statusMeta?.stale && !error && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-2 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <div className="flex-1">
            <p className="text-amber-800 text-sm font-medium">Datos desactualizados</p>
            <p className="text-amber-700 text-xs">
              {statusMeta.error
                ? `El PTS no responde: ${statusMeta.error}`
                : `Snapshot con ${statusMeta.ageSeconds.toFixed(0)}s de antigüedad. Verifica el proxy PTS.`}
            </p>
          </div>
        </div>
      )}

      {/* Contenido */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-sm border border-table-border overflow-hidden">
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

                  return (
                    <tr key={number} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
                      <td className="px-2 text-sm whitespace-nowrap">
                        <span className="font-semibold text-gray-900">#{number}</span>
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        <StatusDot color={STATE_DOT_COLOR[state]} label={STATE_TEXT[state]} />
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap text-gray-900 overflow-hidden text-ellipsis">{pumpData.fuel}</td>
                      <td className="px-2 text-sm whitespace-nowrap text-gray-900">{pumpData.volume.toFixed(3)} G.</td>
                      <td className="px-2 text-sm whitespace-nowrap font-medium text-gray-900">{formatCurrency(pumpData.amount)}</td>
                      <td className="px-2 text-sm whitespace-nowrap text-gray-900 overflow-hidden text-ellipsis">
                        {pumpData.lastDateTime ? formatDateTime(pumpData.lastDateTime) : '-'}
                      </td>
                      <td className="px-2 text-sm whitespace-nowrap">
                        {state === 'locked' ? (
                          <CompactButton variant="ghost" onClick={() => handlePumpLockToggle(number, true)} className="border-green-300 text-green-600 hover:bg-green-50">
                            <Unlock className="w-3 h-3" /> Desbloquear
                          </CompactButton>
                        ) : state === 'available' ? (
                          <CompactButton variant="danger" onClick={() => handlePumpLockToggle(number, false)}>
                            <Lock className="w-3 h-3" /> Bloquear
                          </CompactButton>
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
      ) : viewMode === 'cards' ? (
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
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {filteredPumps.map(([number, packet]) => (
            <DispenserMonitorCard
              key={number}
              pumpNumber={number}
              packet={packet}
              isLoading={loading && packet === null}
              error={error && packet === null ? error : undefined}
              onStatusChange={fetchPumpStatuses}
              selected={selectedPumps.has(number)}
              onToggleSelect={() => togglePumpSelection(number)}
            />
          ))}
        </div>
      )}


      {/* Footer: indicador de freshness del snapshot del proxy PTS */}
      <div className="flex items-center justify-end gap-2 px-2 py-1 text-2xs text-text-muted opacity-75">
        {statusMeta && (
          <>
            <span className={statusMeta.stale ? 'text-amber-600 font-medium' : ''}>
              Última actualización del PTS: hace {statusMeta.ageSeconds.toFixed(1)}s
              {statusMeta.fromCache ? '' : ' (live)'}
            </span>
            <span className="text-gray-300">·</span>
          </>
        )}
        <span>Refresh cada {POLLING_INTERVAL / 1000}s</span>
      </div>

      {/* Modales */}
      {authorizeModal && (
        <AuthorizeModal
          isOpen={true}
          onClose={() => setAuthorizeModal(null)}
          pumpNumber={authorizeModal.pump}
          nozzlePrices={authorizeModal.nozzlePrices}
          onSuccess={() => setTimeout(fetchPumpStatuses, 500)}
        />
      )}
      {confirmModal && (
        <ConfirmActionModal
          isOpen={true}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          confirmColor={confirmModal.confirmColor}
        />
      )}
    </div>
  );
};


export default DispensersSection;
