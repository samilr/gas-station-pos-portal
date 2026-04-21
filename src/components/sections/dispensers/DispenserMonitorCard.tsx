import React, { useState } from 'react';
import { Lock, Unlock, Tag, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import type {
  PumpStatusPacket,
  PumpFillingStatusData,
  PumpIdleStatusData,
  PumpEndOfTransactionStatusData,
  PumpOfflineStatusData,
  PumpVisualState,
} from '../../../types/dispenser';
import { getPumpVisualState, isPumpLocked, lockPump, unlockPump } from '../../../services/dispenserService';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import { DispenserIllustration, FuelGradePanel } from './illustrations';

interface Props {
  pumpNumber: number;
  packet: PumpStatusPacket | null;
  isLoading?: boolean;
  error?: string;
  onStatusChange?: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}

const STATE_STYLE: Record<PumpVisualState, {
  label: string;
  labelBg: string;
  labelText: string;
  border: string;
}> = {
  available:  { label: 'Disponible',      labelBg: 'bg-green-100',  labelText: 'text-green-700',  border: 'border-green-200' },
  dispensing: { label: 'Dispensando',     labelBg: 'bg-orange-500', labelText: 'text-white',      border: 'border-orange-400' },
  locked:     { label: 'Bloqueada',       labelBg: 'bg-red-100',    labelText: 'text-red-700',    border: 'border-red-200' },
  offline:    { label: 'Offline',         labelBg: 'bg-gray-200',   labelText: 'text-gray-500',   border: 'border-gray-200' },
  'end-of-transaction': { label: 'Fin Trans.', labelBg: 'bg-blue-100', labelText: 'text-blue-700', border: 'border-blue-200' },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(n);

// Dado el packet, devuelve:
// - Precios de las 4 mangueras (array)
// - Si está dispensando: qué manguera está activa + su precio + producto
const extractNozzleInfo = (packet: PumpStatusPacket | null, state: PumpVisualState) => {
  if (!packet) return { prices: [0, 0, 0, 0], names: [null, null, null, null] as (string | null)[], activeNozzle: null as number | null };

  const prices: number[] = [0, 0, 0, 0];
  const names: (string | null)[] = [null, null, null, null];

  switch (packet.Type) {
    case 'PumpIdleStatus': {
      const d = packet.Data as PumpIdleStatusData;
      (d.NozzlePrices ?? []).slice(0, 4).forEach((p, i) => { prices[i] = p; });
      // Solo conocemos el nombre del combustible de la última transacción
      if (d.LastNozzle >= 1 && d.LastNozzle <= 4 && d.LastFuelGradeName) {
        names[d.LastNozzle - 1] = mapFuelProductName(d.LastFuelGradeName);
      }
      return { prices, names, activeNozzle: null };
    }
    case 'PumpFillingStatus': {
      const d = packet.Data as PumpFillingStatusData;
      if (d.Nozzle >= 1 && d.Nozzle <= 4) {
        prices[d.Nozzle - 1] = d.Price;
        names[d.Nozzle - 1] = mapFuelProductName(d.FuelGradeName);
      }
      return { prices, names, activeNozzle: state === 'dispensing' ? d.Nozzle : null };
    }
    case 'PumpEndOfTransactionStatus': {
      const d = packet.Data as PumpEndOfTransactionStatusData;
      if (d.Nozzle >= 1 && d.Nozzle <= 4) {
        prices[d.Nozzle - 1] = d.Price;
        names[d.Nozzle - 1] = mapFuelProductName(d.FuelGradeName);
      }
      return { prices, names, activeNozzle: null };
    }
    case 'PumpOfflineStatus': {
      const d = packet.Data as PumpOfflineStatusData;
      if (d.LastNozzle >= 1 && d.LastNozzle <= 4 && d.LastFuelGradeName) {
        names[d.LastNozzle - 1] = mapFuelProductName(d.LastFuelGradeName);
      }
      return { prices, names, activeNozzle: null };
    }
  }
  return { prices, names, activeNozzle: null };
};

// Volumen y monto a mostrar en el board principal
const extractLcdData = (packet: PumpStatusPacket | null) => {
  if (!packet) return { volume: 0, amount: 0, tag: null as string | null };
  switch (packet.Type) {
    case 'PumpFillingStatus': {
      const d = packet.Data as PumpFillingStatusData;
      return { volume: d.Volume, amount: d.Amount, tag: null };
    }
    case 'PumpEndOfTransactionStatus': {
      const d = packet.Data as PumpEndOfTransactionStatusData;
      return { volume: d.Volume, amount: d.Amount, tag: d.Tag || null };
    }
    case 'PumpIdleStatus': {
      const d = packet.Data as PumpIdleStatusData;
      if (d.LastTransaction > 0) return { volume: d.LastVolume, amount: d.LastAmount, tag: null };
      return { volume: 0, amount: 0, tag: null };
    }
    case 'PumpOfflineStatus': {
      const d = packet.Data as PumpOfflineStatusData;
      if (d.LastTransaction > 0) return { volume: d.LastVolume, amount: d.LastAmount, tag: null };
      return { volume: 0, amount: 0, tag: null };
    }
  }
  return { volume: 0, amount: 0, tag: null };
};

const DispenserMonitorCard: React.FC<Props> = ({ pumpNumber, packet, isLoading, error, onStatusChange, selected = false, onToggleSelect }) => {
  const [isLocking, setIsLocking] = useState(false);

  const state: PumpVisualState = error ? 'offline' : getPumpVisualState(packet);
  const locked = isPumpLocked(packet);
  const isDispensing = state === 'dispensing';
  const style = STATE_STYLE[state];

  const { prices, names, activeNozzle } = extractNozzleInfo(packet, state);
  const { volume, amount, tag } = extractLcdData(packet);

  const handleLockToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocking || isDispensing) return;
    try {
      setIsLocking(true);
      if (locked) {
        await unlockPump(pumpNumber);
        toast.success(`Dispensadora ${pumpNumber} desbloqueada`, { duration: 2000 });
      } else {
        await lockPump(pumpNumber);
        toast.success(`Dispensadora ${pumpNumber} bloqueada`, { duration: 2000 });
      }
      setTimeout(() => onStatusChange?.(), 500);
    } catch (err) {
      console.error(err);
      toast.error(`Error al ${locked ? 'desbloquear' : 'bloquear'} dispensadora ${pumpNumber}`, { duration: 3000 });
    } finally {
      setIsLocking(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Si no hay onToggleSelect, no es seleccionable
    if (!onToggleSelect) return;
    // No seleccionar si se hizo click sobre un botón interactivo
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    onToggleSelect();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative rounded-md border-2 bg-white overflow-hidden flex flex-col transition-all ${
        onToggleSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-blue-500 ring-1 ring-blue-300 shadow-sm shadow-blue-100'
          : isDispensing
            ? 'border-orange-400 shadow-lg shadow-orange-200/50'
            : style.border
      }`}
    >
      {/* Indicador de selección */}
      {selected && (
        <div className="absolute top-1 left-1 z-10 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow ring-2 ring-white">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Header: número + estado + lock */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
        <span className={`text-base font-extrabold tabular-nums ${selected ? 'pl-5' : ''} text-text-primary`}>#{pumpNumber}</span>
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide ${style.labelBg} ${style.labelText} ${isDispensing ? 'animate-pulse' : ''}`}>
            {style.label}
          </span>
          <button
            onClick={handleLockToggle}
            disabled={isLocking || !packet || isDispensing}
            className="text-gray-500 hover:text-gray-900 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title={locked ? 'Desbloquear' : 'Bloquear'}
          >
            {isLocking ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : locked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Ilustración principal de la dispensadora */}
      <div className="px-2 pt-1.5">
        <DispenserIllustration
          active={state !== 'offline'}
          nozzleCount={4}
          highlighted={isDispensing}
          dispensing={isDispensing}
          volume={isDispensing || (amount > 0 && state === 'end-of-transaction') ? volume : null}
          amount={isDispensing || (amount > 0 && state === 'end-of-transaction') ? amount : null}
          activeNozzle={activeNozzle}
        />
      </div>

      {/* Fila de 4 mini-paneles Shell, uno por manguera */}
      <div className="px-1.5 pb-1.5 pt-1 grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((idx) => {
          const nozzleNumber = idx + 1;
          const isActive = activeNozzle === nozzleNumber;
          return (
            <div
              key={idx}
              className={`aspect-[1/2] relative rounded-sm transition-all duration-300 ${
                isActive
                  ? 'ring-1 ring-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_4px_12px_-2px_rgba(16,185,129,0.35)]'
                  : activeNozzle != null
                    ? 'opacity-70'
                    : ''
              }`}
            >
              <FuelGradePanel
                productName={names[idx]}
                price={prices[idx] || 0}
                nozzleNumber={nozzleNumber}
                dispensing={isActive}
              />
            </div>
          );
        })}
      </div>

      {/* Footer: datos + tag */}
      {(amount > 0 || volume > 0) && (
        <div className={`px-2 py-1 border-t text-xs tabular-nums flex items-center justify-between ${
          isDispensing ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <span className={`font-medium ${isDispensing ? 'text-orange-900' : 'text-gray-700'}`}>
            {volume.toFixed(3)} <span className="text-2xs text-text-muted">GAL</span>
          </span>
          <span className={`font-bold ${isDispensing ? 'text-orange-900' : 'text-gray-800'}`}>
            {formatCurrency(amount)}
          </span>
        </div>
      )}

      {tag && (
        <div className="px-2 py-0.5 bg-gray-50 border-t border-gray-200 flex items-center gap-1 text-2xs text-text-muted">
          <Tag className="w-3 h-3" />
          <span className="truncate">{tag}</span>
        </div>
      )}

      {/* Overlay loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default DispenserMonitorCard;
