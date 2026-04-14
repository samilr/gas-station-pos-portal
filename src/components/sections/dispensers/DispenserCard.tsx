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

const STATE_CONFIG: Record<PumpVisualState, { color: string; label: string }> = {
  available:            { color: 'green',  label: 'Disponible' },
  dispensing:           { color: 'orange', label: 'Dispensando' },
  locked:               { color: 'red',    label: 'Bloqueada' },
  offline:              { color: 'gray',   label: 'Offline' },
  'end-of-transaction': { color: 'blue',   label: 'Fin Trans.' },
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
  const { color, label } = STATE_CONFIG[state];

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
    <div className={`relative bg-white rounded-sm border border-table-border p-2 hover:bg-row-hover ${state === 'dispensing' ? 'ring-1 ring-orange-300' : ''}`}>
      {/* Header: numero + lock */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm text-gray-900">#{pumpNumber}</span>
        <button
          onClick={handleLockToggle}
          disabled={isLocking || isLoading || !packet || state === 'dispensing'}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
        <Fuel className={`w-4 h-4 text-gray-400 ${state === 'dispensing' ? 'animate-pulse text-orange-500' : ''}`} />
        <StatusDot color={color} label={label} />
      </div>

      {/* Datos */}
      {displayData && (
        <div className="space-y-0.5 border-t border-gray-100 pt-1">
          <p className="text-xs text-gray-600 truncate">{displayData.fuel}</p>
          <div className="flex justify-between text-xs text-gray-700">
            <span>{displayData.volume.toFixed(3)} G.</span>
            <span className="font-medium">{formatCurrency(displayData.amount)}</span>
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
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-sm">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default DispenserCard;
