import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dataphone } from '../../../services/dataphoneService';
import { useDeleteDataphoneMutation } from '../../../store/api/dataphonesApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dataphone: Dataphone | null;
  onSuccess: () => void;
}

const DeleteDataphoneDialog: React.FC<Props> = ({ isOpen, onClose, dataphone, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteDataphone] = useDeleteDataphoneMutation();

  const handleDelete = async () => {
    if (!dataphone) return;
    setDeleting(true);
    try {
      await deleteDataphone(dataphone.dataphoneId).unwrap();
      toast.success(`Dataphone ${dataphone.name} eliminado`);
      onSuccess(); onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al eliminar') ?? 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !dataphone) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-sm w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-text-primary text-center mb-1">Eliminar Dataphone</h3>
          <p className="text-sm text-text-secondary text-center mb-4">
            ¿Eliminar <strong>{dataphone.name}</strong> ({dataphone.siteId})?
            <br /><span className="font-medium text-red-600">Esta acción no se puede deshacer.</span>
          </p>
          <div className="flex gap-2">
            <CompactButton variant="ghost" onClick={onClose} disabled={deleting} className="flex-1 justify-center">Cancelar</CompactButton>
            <CompactButton variant="danger" onClick={handleDelete} disabled={deleting} className="flex-1 justify-center">
              {deleting ? (<><RefreshCw className="w-3 h-3 animate-spin" /> Eliminando...</>) : 'Eliminar'}
            </CompactButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDataphoneDialog;
