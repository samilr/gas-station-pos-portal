import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock, Unlock, Play, Square, AlertTriangle, Pause, RotateCcw, X as XClose,
  CheckCircle2, Fuel, Zap, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllPumpStatuses,
  getPumpVisualState,
  isPumpLocked,
  getPumpNumber,
  lockPump,
  unlockPump,
  lockAllPumps,
  unlockAllPumps,
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
  PumpVisualState,
  NozzlePrice,
} from '../../../types/dispenser';
import { useHeader } from '../../../context/HeaderContext';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import AuthorizeModal from './AuthorizeModal';
import ConfirmActionModal from './ConfirmActionModal';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

// Mapeo de indice de pistola a codigo de grado de combustible
const NOZZLE_FUEL_GRADE_MAP: Record<number, { id: number; code: string }> = {
  1: { id: 1, code: '1-025' },
  2: { id: 2, code: '1-001' },
  3: { id: 3, code: '2-025' },
  4: { id: 4, code: '2-001' },
  5: { id: 5, code: '' },
  6: { id: 6, code: '' },
};

const POLLING_INTERVAL = 2000;

const STATE_LABEL: Record<PumpVisualState, string> = {
  available: 'Disponible',
  dispensing: 'Dispensando',
  locked: 'Bloqueada',
  offline: 'Offline',
  'end-of-transaction': 'Fin Trans.',
};

const STATE_BG: Record<PumpVisualState, string> = {
  available: 'bg-green-500',
  dispensing: 'bg-orange-500',
  locked: 'bg-red-500',
  offline: 'bg-gray-300',
  'end-of-transaction': 'bg-blue-500',
};

const STATE_RING: Record<PumpVisualState, string> = {
  available: 'ring-green-400',
  dispensing: 'ring-orange-400',
  locked: 'ring-red-400',
  offline: 'ring-gray-300',
  'end-of-transaction': 'ring-blue-400',
};

const ControlSection: React.FC = () => {
  const [pumpStatuses, setPumpStatuses] = useState<Map<number, PumpStatusPacket | null>>(new Map());
  const [selectedPumps, setSelectedPumps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { setSubtitle } = useHeader();

  // Modals
  const [authorizeModal, setAuthorizeModal] = useState<{ pump: number; nozzlePrices: NozzlePrice[] } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: 'red' | 'orange' | 'green';
    onConfirm: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    setSubtitle('Panel de control de dispensadoras');
    return () => { setSubtitle(''); };
  }, [setSubtitle]);

  const fetchingRef = React.useRef(false);

  const fetchStatuses = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setError(null);
      const packets = await getAllPumpStatuses();
      const map = new Map<number, PumpStatusPacket>();
      packets.forEach((pkt) => {
        const num = getPumpNumber(pkt as PumpStatusPacket);
        map.set(num, pkt as PumpStatusPacket);
      });
      setPumpStatuses(map);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexion');
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatuses]);

  const togglePump = (num: number) => {
    setSelectedPumps((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<number>(pumpStatuses.keys());
    setSelectedPumps(all);
  };

  const clearSelection = () => setSelectedPumps(new Set());

  const getSelectedPackets = () =>
    Array.from(selectedPumps).map((n) => ({ pump: n, packet: pumpStatuses.get(n) || null }));

  const runAction = async (label: string, action: () => Promise<void>) => {
    setActionLoading(label);
    try {
      await action();
      setTimeout(fetchStatuses, 500);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLock = () => {
    if (selectedPumps.size === 0) return;
    runAction('lock', async () => {
      for (const num of selectedPumps) {
        try {
          await lockPump(num);
        } catch (err) {
          toast.error(`Error al bloquear bomba ${num}`);
        }
      }
      toast.success(`${selectedPumps.size} bomba(s) bloqueada(s)`, { duration: 2000 });
    });
  };

  const handleUnlock = () => {
    if (selectedPumps.size === 0) return;
    runAction('unlock', async () => {
      for (const num of selectedPumps) {
        try {
          await unlockPump(num);
        } catch (err) {
          toast.error(`Error al desbloquear bomba ${num}`);
        }
      }
      toast.success(`${selectedPumps.size} bomba(s) desbloqueada(s)`, { duration: 2000 });
    });
  };

  const handleLockAll = () => {
    setConfirmModal({
      title: 'Bloquear Todas',
      message: 'Esta seguro de que desea bloquear las 18 bombas? Ninguna podra dispensar hasta que se desbloqueen.',
      confirmLabel: 'Bloquear Todas',
      confirmColor: 'red',
      onConfirm: async () => {
        await lockAllPumps();
        toast.success('Todas las bombas bloqueadas', { duration: 3000 });
        setTimeout(fetchStatuses, 500);
      },
    });
  };

  const handleUnlockAll = () => {
    setConfirmModal({
      title: 'Desbloquear Todas',
      message: 'Esta seguro de que desea desbloquear las 18 bombas?',
      confirmLabel: 'Desbloquear Todas',
      confirmColor: 'green',
      onConfirm: async () => {
        await unlockAllPumps();
        toast.success('Todas las bombas desbloqueadas', { duration: 3000 });
        setTimeout(fetchStatuses, 500);
      },
    });
  };

  const handleStop = () => {
    if (selectedPumps.size === 0) return;
    runAction('stop', async () => {
      for (const num of selectedPumps) {
        try {
          await stopPump(num);
        } catch (err) {
          toast.error(`Error al detener bomba ${num}`);
        }
      }
      toast.success(`${selectedPumps.size} bomba(s) detenida(s)`, { duration: 2000 });
    });
  };

  const handleEmergencyStop = () => {
    if (selectedPumps.size === 0) return;
    const pumps = Array.from(selectedPumps).join(', ');
    setConfirmModal({
      title: 'Parada de Emergencia',
      message: `Esta seguro de ejecutar una PARADA DE EMERGENCIA en las bombas ${pumps}? Esto detendra el dispensado de forma inmediata.`,
      confirmLabel: 'Parada de Emergencia',
      confirmColor: 'red',
      onConfirm: async () => {
        for (const num of selectedPumps) {
          try {
            await emergencyStopPump(num);
          } catch (err) {
            toast.error(`Error en parada de emergencia bomba ${num}`);
          }
        }
        toast.success('Parada de emergencia ejecutada', { duration: 3000 });
        setTimeout(fetchStatuses, 500);
      },
    });
  };

  const handleSuspend = () => {
    if (selectedPumps.size === 0) return;
    runAction('suspend', async () => {
      for (const num of selectedPumps) {
        try {
          await suspendPump(num);
        } catch (err) {
          toast.error(`Error al suspender bomba ${num}`);
        }
      }
      toast.success(`${selectedPumps.size} bomba(s) suspendida(s)`, { duration: 2000 });
    });
  };

  const handleResume = () => {
    if (selectedPumps.size === 0) return;
    runAction('resume', async () => {
      for (const num of selectedPumps) {
        try {
          await resumePump(num);
        } catch (err) {
          toast.error(`Error al reanudar bomba ${num}`);
        }
      }
      toast.success(`${selectedPumps.size} bomba(s) reanudada(s)`, { duration: 2000 });
    });
  };

  const handleCloseTransaction = () => {
    if (selectedPumps.size === 0) return;
    runAction('close', async () => {
      for (const num of selectedPumps) {
        try {
          await closeTransaction(num);
        } catch (err) {
          toast.error(`Error al cerrar transaccion bomba ${num}`);
        }
      }
      toast.success(`Transaccion(es) cerrada(s)`, { duration: 2000 });
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
          const gradeName = gradeInfo?.code
            ? mapFuelProductName(gradeInfo.code)
            : `Pistola ${nozzleNum}`;
          nozzlePrices.push({
            Nozzle: nozzleNum,
            FuelGradeId: gradeInfo?.id || nozzleNum,
            FuelGradeName: gradeName,
            Price: price,
          });
        }
      });
    }

    if (nozzlePrices.length === 0) {
      nozzlePrices = [{ Nozzle: 1, FuelGradeId: 1, FuelGradeName: 'Combustible', Price: 0 }];
    }

    setAuthorizeModal({ pump: pumpNum, nozzlePrices });
  };

  // Contadores de estado
  const stateCounts = { available: 0, dispensing: 0, locked: 0, offline: 0, 'end-of-transaction': 0 };
  pumpStatuses.forEach((packet) => {
    const st = getPumpVisualState(packet);
    stateCounts[st]++;
  });

  const hasSelection = selectedPumps.size > 0;
  const hasDispensingSelected = getSelectedPackets().some(
    ({ packet }) => getPumpVisualState(packet) === 'dispensing'
  );

  if (loading && pumpStatuses.size === 0) {
    return (
      <div className="space-y-1">
        <div className="bg-white rounded-sm p-3">
          <div className="h-6 bg-gray-200 rounded w-64 mb-1 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-80 animate-pulse" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-sm p-2 bg-gray-200 animate-pulse h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        chips={[
          { label: '', value: stateCounts.available, color: 'green' },
          { label: '', value: stateCounts.dispensing, color: 'orange' },
          { label: '', value: stateCounts.locked, color: 'red' },
          { label: '', value: stateCounts.offline, color: 'gray' },
        ]}
      >
        <CompactButton variant="ghost" onClick={selectAll} className="text-xs">
          Seleccionar todas
        </CompactButton>
        <CompactButton variant="ghost" onClick={clearSelection} disabled={!hasSelection} className="text-xs">
          Limpiar
        </CompactButton>
        {hasSelection && (
          <span className="text-xs text-gray-500">{selectedPumps.size} sel.</span>
        )}
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

      {/* Grid de bombas seleccionables */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1">
        {Array.from(pumpStatuses.entries()).map(([num, packet]) => {
          const state = getPumpVisualState(packet);
          const selected = selectedPumps.has(num);
          const locked = isPumpLocked(packet);
          const isFilling = state === 'dispensing';
          const fillingData = isFilling ? (packet?.Data as PumpFillingStatusData) : null;

          return (
            <button
              key={num}
              onClick={() => togglePump(num)}
              className={`relative rounded-sm p-2 text-center transition-all ${STATE_BG[state]} ${
                selected ? `ring-2 ${STATE_RING[state]} ring-offset-1` : ''
              } ${isFilling ? 'animate-pulse' : ''}`}
            >
              {selected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                </div>
              )}

              <span className={`font-bold text-sm ${state === 'offline' ? 'text-gray-600' : 'text-white'}`}>
                {num}
              </span>
              <p className={`text-[10px] mt-0.5 ${state === 'offline' ? 'text-gray-500' : 'text-white/80'}`}>
                {STATE_LABEL[state]}
              </p>
              {locked && <Lock className="w-2.5 h-2.5 text-white/70 mx-auto mt-0.5" />}
              {fillingData && (
                <p className="text-[10px] text-white/80 mt-0.5 truncate">
                  {fillingData.Volume.toFixed(1)}G.
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel de acciones */}
      {hasSelection && (
        <div className="bg-white rounded-sm shadow-sm p-2">
          <p className="text-xs font-semibold text-gray-900 mb-1">
            Acciones -- Bomba(s): {Array.from(selectedPumps).sort((a, b) => a - b).join(', ')}
          </p>

          <div className="flex flex-wrap gap-1">
            <ActionButton
              icon={<Fuel className="w-3.5 h-3.5" />}
              label="Autorizar"
              color="bg-blue-600 hover:bg-blue-700"
              onClick={handleAuthorize}
              disabled={selectedPumps.size !== 1 || !!actionLoading}
              loading={actionLoading === 'authorize'}
              title={selectedPumps.size !== 1 ? 'Seleccione exactamente 1 bomba' : ''}
            />
            <ActionButton
              icon={<Lock className="w-3.5 h-3.5" />}
              label="Bloquear"
              color="bg-red-600 hover:bg-red-700"
              onClick={handleLock}
              disabled={!!actionLoading}
              loading={actionLoading === 'lock'}
            />
            <ActionButton
              icon={<Unlock className="w-3.5 h-3.5" />}
              label="Desbloquear"
              color="bg-green-600 hover:bg-green-700"
              onClick={handleUnlock}
              disabled={!!actionLoading}
              loading={actionLoading === 'unlock'}
            />
            <ActionButton
              icon={<Square className="w-3.5 h-3.5" />}
              label="Detener"
              color="bg-orange-600 hover:bg-orange-700"
              onClick={handleStop}
              disabled={!hasDispensingSelected || !!actionLoading}
              loading={actionLoading === 'stop'}
            />
            <ActionButton
              icon={<Pause className="w-3.5 h-3.5" />}
              label="Suspender"
              color="bg-yellow-600 hover:bg-yellow-700"
              onClick={handleSuspend}
              disabled={!hasDispensingSelected || !!actionLoading}
              loading={actionLoading === 'suspend'}
            />
            <ActionButton
              icon={<Play className="w-3.5 h-3.5" />}
              label="Reanudar"
              color="bg-teal-600 hover:bg-teal-700"
              onClick={handleResume}
              disabled={!!actionLoading}
              loading={actionLoading === 'resume'}
            />
            <ActionButton
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              label="Cerrar Trans."
              color="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleCloseTransaction}
              disabled={!!actionLoading}
              loading={actionLoading === 'close'}
            />
            <ActionButton
              icon={<Zap className="w-3.5 h-3.5" />}
              label="Emergencia"
              color="bg-red-700 hover:bg-red-800"
              onClick={handleEmergencyStop}
              disabled={!!actionLoading}
              loading={actionLoading === 'emergency'}
            />
          </div>
        </div>
      )}

      {/* Acciones globales */}
      <div className="bg-white rounded-sm shadow-sm p-2">
        <p className="text-xs font-semibold text-gray-900 mb-1">Acciones Globales</p>
        <div className="flex flex-wrap gap-1">
          <CompactButton
            variant="danger"
            onClick={handleLockAll}
            disabled={!!actionLoading}
          >
            <Lock className="w-3.5 h-3.5" />
            Bloquear Todas
          </CompactButton>
          <CompactButton
            variant="ghost"
            onClick={handleUnlockAll}
            disabled={!!actionLoading}
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            <Unlock className="w-3.5 h-3.5" />
            Desbloquear Todas
          </CompactButton>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-sm p-2">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-0.5">Instrucciones:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Haga clic en las bombas para seleccionarlas</li>
              <li><strong>Autorizar:</strong> requiere exactamente 1 bomba seleccionada</li>
              <li><strong>Detener/Suspender:</strong> solo aplica a bombas que esten dispensando</li>
              <li><strong>Emergencia:</strong> requiere confirmacion antes de ejecutar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      {authorizeModal && (
        <AuthorizeModal
          isOpen={true}
          onClose={() => setAuthorizeModal(null)}
          pumpNumber={authorizeModal.pump}
          nozzlePrices={authorizeModal.nozzlePrices}
          onSuccess={() => setTimeout(fetchStatuses, 500)}
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

// Boton de accion reutilizable
const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
}> = ({ icon, label, color, onClick, disabled, loading, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`inline-flex items-center gap-1 h-7 px-2 rounded-sm text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
  >
    {loading ? (
      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    ) : (
      icon
    )}
    {label}
  </button>
);

export default ControlSection;
