import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import fuelIslandService, { FuelIsland } from '../../../services/fuelIslandService';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fuelIsland: FuelIsland | null;
  onSuccess: () => void;
}

const DeleteFuelIslandDialog: React.FC<Props> = ({ isOpen, onClose, fuelIsland, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!fuelIsland) return;
    setDeleting(true);
    try {
      const res = await fuelIslandService.remove(fuelIsland.fuelIslandId);
      if (res.successful) {
        toast.success(`Fuel island ${fuelIsland.name} eliminada`, { duration: 4000 });
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || 'Error al eliminar');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !fuelIsland) return null;

  const dispCount = fuelIsland.dispensers?.length ?? 0;
  const terminal = fuelIsland.terminals?.[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-sm w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-text-primary text-center mb-1">Eliminar Fuel Island</h3>
          <p className="text-sm text-text-secondary text-center mb-3">
            ¿Eliminar <strong>{fuelIsland.name}</strong> ({fuelIsland.siteId})?
          </p>
          {(dispCount > 0 || terminal) && (
            <ul className="text-2xs text-text-muted space-y-0.5 mb-3 bg-gray-50 border border-gray-200 rounded-sm p-2">
              {dispCount > 0 && (
                <li>· Los <strong>{dispCount}</strong> dispenser(s) quedarán sin asignar (no se borran).</li>
              )}
              {terminal && (
                <li>
                  · El terminal <strong>#{terminal.terminalId} · {terminal.name}</strong> quedará sin isleta
                  (<code>fuelIslandId = null</code>).
                </li>
              )}
            </ul>
          )}
          {dispCount === 0 && !terminal && (
            <p className="text-xs font-medium text-red-600 text-center mb-3">
              Esta acción no se puede deshacer.
            </p>
          )}
          <div className="flex gap-2">
            <CompactButton variant="ghost" onClick={onClose} disabled={deleting} className="flex-1 justify-center">
              Cancelar
            </CompactButton>
            <CompactButton variant="danger" onClick={handleDelete} disabled={deleting} className="flex-1 justify-center">
              {deleting ? (<><RefreshCw className="w-3 h-3 animate-spin" /> Eliminando...</>) : 'Eliminar'}
            </CompactButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteFuelIslandDialog;
