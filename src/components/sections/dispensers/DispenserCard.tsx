import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

interface DispenserCardProps {
  pumpNumber: number;
  packet: PumpStatusPacket | null;
  isLoading?: boolean;
  error?: string;
  onStatusChange?: () => void;
}

const STATE_CONFIG: Record<PumpVisualState, { bg: string; label: string }> = {
  available:          { bg: 'bg-green-500',  label: 'Disponible' },
  dispensing:         { bg: 'bg-orange-500', label: 'Dispensando' },
  locked:             { bg: 'bg-red-500',    label: 'Bloqueada' },
  offline:            { bg: 'bg-gray-300',   label: 'Offline' },
  'end-of-transaction': { bg: 'bg-blue-500', label: 'Fin Transacción' },
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
  const { bg, label } = STATE_CONFIG[state];
  const hasData = !!packet && state !== 'offline';

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

  // Extraer datos para mostrar según el estado
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
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`relative rounded-lg p-4 shadow-sm ${bg} ${state === 'dispensing' ? 'animate-pulse' : ''}`}
    >
      {/* Header: número + lock */}
      <div className="flex items-center justify-between mb-2">
        <span className={`font-bold text-lg ${hasData ? 'text-white' : 'text-gray-700'}`}>
          #{pumpNumber}
        </span>
        <button
          onClick={handleLockToggle}
          disabled={isLocking || isLoading || !packet || state === 'dispensing'}
          className={`transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${hasData ? 'text-white opacity-75 hover:opacity-100' : 'text-gray-500'}`}
          title={locked ? 'Desbloquear dispensadora' : 'Bloquear dispensadora'}
        >
          {isLocking ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : locked ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Unlock className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Icono central */}
      <div className={hasData ? 'text-white' : 'text-gray-500'}>
        <Fuel className={`w-10 h-10 mx-auto mb-2 opacity-90 ${state === 'dispensing' ? 'animate-bounce' : ''}`} />

        {/* Estado */}
        <p className="text-xs text-center font-medium opacity-90 mb-1">{label}</p>

        {/* Datos */}
        {displayData && (
          <>
            <p className="text-xs text-center opacity-80 truncate">{displayData.fuel}</p>
            <div className="flex justify-between text-xs mt-1">
              <span>{displayData.volume.toFixed(3)} G.</span>
              <span>{formatCurrency(displayData.amount)}</span>
            </div>
            {displayData.tag && (
              <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                <Tag className="w-3 h-3" />
                <span className="truncate">{displayData.tag}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Overlay de carga */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
};

export default DispenserCard;
