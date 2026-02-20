import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FuelIcon, Lock } from 'lucide-react';
import { PumpStatusPacket, PumpFillingStatus, PumpIdleStatus } from '../../../services/dispenserService';
import dispenserService from '../../../services/dispenserService';
import toast from 'react-hot-toast';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';

interface DispenserCardProps {
  pumpNumber: number;
  packet: PumpStatusPacket | null;
  isLoading?: boolean;
  error?: string;
  onStatusChange?: () => void;
}

const DispenserCard: React.FC<DispenserCardProps> = ({ 
  pumpNumber, 
  packet, 
  isLoading = false,
  error,
  onStatusChange
}) => {
  const [isLocking, setIsLocking] = useState(false);

  // Determinar el estado de la dispensadora
  const getStatus = () => {
    if (error || !packet) return 'error';
    // Verificar si está offline primero
    if (packet.Type === 'PumpOfflineStatus') return 'offline';
    // Verificar si está bloqueada
    if (dispenserService.isPumpLocked(packet)) return 'blocked';
    if (packet.Type === 'PumpFillingStatus') return 'dispensing';
    if (packet.Type === 'PumpIdleStatus') return 'available';
    return 'error';
  };

  const status = getStatus();
  const isLocked = dispenserService.isPumpLocked(packet);
  const fillingData = packet?.Type === 'PumpFillingStatus' 
    ? (packet.Data as PumpFillingStatus) 
    : null;
  const idleData = packet?.Type === 'PumpIdleStatus' 
    ? (packet.Data as PumpIdleStatus) 
    : null;

  // Manejar bloqueo/desbloqueo
  const handleLockToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLocking) return;
    
    try {
      setIsLocking(true);
      
      if (isLocked) {
        await dispenserService.unlockPump(pumpNumber);
        toast.success(`Dispensadora ${pumpNumber} desbloqueada`, {
          duration: 2000,
          icon: '🔓',
        });
      } else {
        await dispenserService.lockPump(pumpNumber);
        toast.success(`Dispensadora ${pumpNumber} bloqueada`, {
          duration: 2000,
          icon: '🔒',
        });
      }
      
      // Refrescar el estado después de un breve delay
      setTimeout(() => {
        if (onStatusChange) {
          onStatusChange();
        }
      }, 500);
    } catch (err) {
      console.error('Error al cambiar estado de bloqueo:', err);
      toast.error(`Error al ${isLocked ? 'desbloquear' : 'bloquear'} dispensadora ${pumpNumber}`, {
        duration: 3000,
        icon: '❌',
      });
    } finally {
      setIsLocking(false);
    }
  };

  // Obtener color de fondo según el estado
  const getBgColor = () => {
    if (!packet || status === 'offline' || status === 'error') return 'bg-gray-200';
    if (status === 'available') return 'bg-green-500';
    if (status === 'dispensing') return 'bg-orange-500';
    return 'bg-red-500'; // blocked
  };

  // Obtener datos para mostrar
  const getDisplayData = () => {
    if (!packet) return null;

    if (status === 'dispensing' && fillingData) {
      return {
        fuel: mapFuelProductName(fillingData.FuelGradeName),
        volume: fillingData.Volume.toFixed(2),
        amount: fillingData.Amount.toFixed(2)
      };
    }

    if (status === 'available' && idleData && idleData.LastTransaction > 0) {
      return {
        fuel: mapFuelProductName(idleData.LastFuelGradeName),
        volume: idleData.LastVolume.toFixed(2),
        amount: idleData.LastAmount.toFixed(2)
      };
    }

    return null;
  };

  const displayData = getDisplayData();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-lg p-4 shadow-sm ${getBgColor()} ${status === 'dispensing' ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`font-bold text-lg ${packet ? 'text-white' : 'text-gray-700'}`}>
          #{pumpNumber}
        </span>
        <button
          onClick={handleLockToggle}
          disabled={isLocking || isLoading || !packet}
          className={`transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${packet ? 'text-white opacity-75 hover:opacity-100' : 'text-gray-500'}`}
          title={isLocked ? 'Desbloquear dispensadora' : 'Bloquear dispensadora'}
        >
          {isLocking ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className={packet ? 'text-white' : 'text-gray-600'}>
        <FuelIcon 
          className={`w-12 h-12 mx-auto mb-2 opacity-90 ${status === 'dispensing' ? 'animate-bounce' : ''}`} 
        />
        {displayData && (
          <>
            <p className="text-xs opacity-90 mb-1">{displayData.fuel}</p>
            <div className="flex justify-between text-xs">
              <span>{displayData.volume} G.</span>
              <span>RD${displayData.amount}</span>
            </div>
          </>
        )}
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </motion.div>
  );
};

export default DispenserCard;

