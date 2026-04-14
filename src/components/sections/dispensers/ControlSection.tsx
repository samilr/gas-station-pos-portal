import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock, Unlock, Play, Square, Pause, RotateCcw,
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

const STATE_DOT_COLOR: Record<PumpVisualState, string> = {
  available: 'green',
  dispensing: 'orange',
  locked: 'red',
  offline: 'gray',
  'end-of-transaction': 'blue',
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
              className={`relative bg-white rounded-sm border p-1.5 text-left hover:bg-row-hover transition-colors ${
                selected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-table-border'
              } ${isFilling ? 'ring-1 ring-orange-300' : ''}`}
            >
              {selected && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center shadow">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">#{num}</span>
                {locked && <Lock className="w-3 h-3 text-red-500" />}
              </div>
              <StatusDot color={STATE_DOT_COLOR[state]} label={STATE_LABEL[state]} className="mt-0.5" />
              {fillingData && (
                <p className="text-2xs text-gray-600 mt-0.5 truncate">
                  {fillingData.Volume.toFixed(1)} G.
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel de acciones */}
      {hasSelection && (
        <div className="bg-white rounded-sm border border-table-border">
          <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
            <Fuel className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
              Acciones -- Bomba(s): {Array.from(selectedPumps).sort((a, b) => a - b).join(', ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 p-2">
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
      <div className="bg-white rounded-sm border border-table-border">
        <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
          <Lock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">Acciones Globales</span>
        </div>
        <div className="flex flex-wrap gap-1 p-2">
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

      {/* Info compacto */}
      <div className="flex items-start gap-1.5 px-2 py-1 text-2xs text-text-muted">
        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
        <span>
          Clic para seleccionar bombas. Autorizar requiere 1 bomba. Detener/Suspender solo aplica a bombas dispensando. Emergencia requiere confirmacion.
        </span>
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
