import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import dispensersConfigService, { Dispenser } from '../../../services/dispensersConfigService';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dispenser: Dispenser | null;
  onSuccess: () => void;
}

const DeleteDispenserConfigDialog: React.FC<Props> = ({ isOpen, onClose, dispenser, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!dispenser) return;
    setDeleting(true);
    try {
      const res = await dispensersConfigService.remove(dispenser.dispenserId);
      if (res.successful) {
        toast.success(`Dispensadora #${dispenser.pumpNumber} eliminada`, { duration: 4000 });
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

  if (!isOpen || !dispenser) return null;

  const label = dispenser.name || `${dispenser.siteId} · Bomba #${dispenser.pumpNumber}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-sm w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-text-primary text-center mb-1">Eliminar Dispensadora</h3>
          <p className="text-sm text-text-secondary text-center mb-4">
            ¿Eliminar <strong>{label}</strong>?
            <br /><span className="font-medium text-red-600">Esta acción no se puede deshacer.</span>
          </p>
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

export default DeleteDispenserConfigDialog;
