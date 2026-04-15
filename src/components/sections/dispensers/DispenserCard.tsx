import React, { useState } from 'react';
import { Fuel, Lock, Unlock, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import type {
  PumpStatusPacket,
  PumpFillingStatusData,
  PumpIdleStatusData,
  PumpEndOfTransactionStatusData,
  PumpVisualState,
} from '../../../types/dispenser';
import { getPumpVisualState, isPumpLocked, lockPump, unlockPump } from '../../../services/dispenserService';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import StatusDot from '../../ui/StatusDot';

interface DispenserCardProps {
  pumpNumber: number;
  packet: PumpStatusPacket | null;
  isLoading?: boolean;
  error?: string;
  onStatusChange?: () => void;
}

const STATE_CONFIG: Record<PumpVisualState, {
  color: string;
  label: string;
  card: string;
  accent: string;
  numberColor: string;
  iconColor: string;
}> = {
  available: {
    color: 'green',
    label: 'Disponible',
    card: 'bg-white border-table-border hover:border-green-200 hover:bg-green-50/30',
    accent: 'bg-green-400',
    numberColor: 'text-gray-900',
    iconColor: 'text-gray-400',
  },
  dispensing: {
    color: 'orange',
    label: 'Dispensando',
    card: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-orange-300 animate-dispensing-glow',
    accent: 'bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 animate-fuel-flow',
    numberColor: 'text-orange-700',
    iconColor: 'text-orange-500 animate-fuel-drop',
  },
  locked: {
    color: 'red',
    label: 'Bloqueada',
    card: 'bg-red-50/40 border-red-200 hover:bg-red-50/60',
    accent: 'bg-red-400',
    numberColor: 'text-red-700',
    iconColor: 'text-red-400',
  },
  offline: {
    color: 'gray',
    label: 'Offline',
    card: 'bg-gray-50 border-gray-200 opacity-75',
    accent: 'bg-gray-300',
    numberColor: 'text-gray-500',
    iconColor: 'text-gray-300',
  },
  'end-of-transaction': {
    color: 'blue',
    label: 'Fin Trans.',
    card: 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/60',
    accent: 'bg-blue-400',
    numberColor: 'text-blue-700',
    iconColor: 'text-blue-400',
  },
};

const DispenserCard: React.FC<DispenserCardProps> = ({
  pumpNumber,
  packet,
  isLoading = false,
  error,
  onStatusChange,
}) => {
  const [isLocking, setIsLocking] = useState(false);

  const state: PumpVisualState = error ? 'offline' : getPumpVisualState(packet);
  const locked = isPumpLocked(packet);
  const cfg = STATE_CONFIG[state];
  const { color, label } = cfg;
  const isDispensing = state === 'dispensing';

  const handleLockToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocking) return;

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
      console.error('Error al cambiar estado de bloqueo:', err);
      toast.error(`Error al ${locked ? 'desbloquear' : 'bloquear'} dispensadora ${pumpNumber}`, { duration: 3000 });
    } finally {
      setIsLocking(false);
    }
  };

  const getDisplayData = () => {
    if (!packet) return null;

    if (state === 'dispensing') {
      const d = packet.Data as PumpFillingStatusData;
      return { fuel: mapFuelProductName(d.FuelGradeName), volume: d.Volume, amount: d.Amount, tag: null };
    }

    if (state === 'end-of-transaction') {
      const d = packet.Data as PumpEndOfTransactionStatusData;
      return { fuel: mapFuelProductName(d.FuelGradeName), volume: d.Volume, amount: d.Amount, tag: d.Tag || null };
    }

    if (state === 'available' || state === 'locked') {
      const d = packet.Data as PumpIdleStatusData;
      if (d.LastTransaction > 0) {
        return { fuel: mapFuelProductName(d.LastFuelGradeName), volume: d.LastVolume, amount: d.LastAmount, tag: null };
      }
    }

    return null;
  };

  const displayData = getDisplayData();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(n);

  return (
    <div
      className={`animate-card-rise relative overflow-hidden rounded-md border p-2 transition-all duration-300 ease-out ${cfg.card}`}
    >
      {/* Barra superior de flujo (animada cuando dispensa) */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${cfg.accent}`} />

      {/* Header: numero + lock */}
      <div className="flex items-center justify-between mb-1 mt-0.5">
        <span className={`font-bold text-sm tracking-tight transition-colors ${cfg.numberColor}`}>
          #{pumpNumber}
        </span>
        <button
          onClick={handleLockToggle}
          disabled={isLocking || isLoading || !packet || isDispensing}
          className="text-gray-500 hover:text-gray-800 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          title={locked ? 'Desbloquear dispensadora' : 'Bloquear dispensadora'}
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

      {/* Icono + estado */}
      <div className="flex items-center gap-1.5 mb-1">
        <Fuel className={`w-4 h-4 transition-colors duration-300 ${cfg.iconColor}`} />
        <StatusDot color={color} label={label} />
      </div>

      {/* Datos */}
      {displayData && (
        <div
          className={`space-y-0.5 border-t pt-1 transition-colors ${
            isDispensing ? 'border-orange-200' : 'border-gray-100'
          }`}
        >
          <p
            className={`text-xs truncate transition-colors ${
              isDispensing ? 'text-orange-700 font-medium' : 'text-gray-600'
            }`}
          >
            {displayData.fuel}
          </p>
          <div
            className={`flex justify-between text-xs tabular-nums transition-colors ${
              isDispensing ? 'text-orange-900' : 'text-gray-700'
            }`}
          >
            <span className={isDispensing ? 'font-semibold' : ''}>
              {displayData.volume.toFixed(3)} G.
            </span>
            <span className={isDispensing ? 'font-bold' : 'font-medium'}>
              {formatCurrency(displayData.amount)}
            </span>
          </div>
          {displayData.tag && (
            <div className="flex items-center gap-1 text-2xs text-gray-500">
              <Tag className="w-3 h-3" />
              <span className="truncate">{displayData.tag}</span>
            </div>
          )}
        </div>
      )}

      {/* Overlay de carga */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-md">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default DispenserCard;
