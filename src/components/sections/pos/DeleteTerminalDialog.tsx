import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { ITerminal } from '../../../services/terminalService';
import { useDeleteTerminalMutation } from '../../../store/api/terminalsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';

interface DeleteTerminalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  terminal: ITerminal | null;
  onSuccess: () => void;
}

const DeleteTerminalDialog: React.FC<DeleteTerminalDialogProps> = ({ isOpen, onClose, terminal, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteTerminal] = useDeleteTerminalMutation();

  const handleDelete = async () => {
    if (!terminal) return;
    setDeleting(true);
    try {
      await deleteTerminal({ siteId: terminal.siteId, terminalId: terminal.terminalId }).unwrap();
      toast.success(`Terminal eliminada exitosamente \n ${terminal.name}`, { duration: 5000 });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        getErrorMessage(err, 'Error al eliminar terminal.') ?? 'Error al eliminar terminal.',
        { duration: 5000 }
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !terminal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-sm w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-text-primary text-center mb-1">Eliminar Terminal</h3>
          <p className="text-sm text-text-secondary text-center mb-4">
            ¿Estás seguro de eliminar la terminal <strong>{terminal.name}</strong>?
            <br /><span className="font-medium text-red-600">Esta acción no se puede deshacer.</span>
          </p>
          <div className="flex gap-2">
            <CompactButton variant="ghost" onClick={onClose} disabled={deleting} className="flex-1 justify-center">Cancelar</CompactButton>
            <CompactButton variant="danger" onClick={handleDelete} disabled={deleting} className="flex-1 justify-center">
              {deleting ? <><RefreshCw className="w-3 h-3 animate-spin" /> Eliminando...</> : 'Eliminar'}
            </CompactButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteTerminalDialog;
