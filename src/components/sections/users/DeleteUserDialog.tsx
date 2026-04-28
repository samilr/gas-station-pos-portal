import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePermissions } from '../../../hooks/usePermissions';
import { IUser } from '../../../services/userService';
import { useDeleteUserMutation } from '../../../store/api/usersApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { PermissionGate } from '../../common';
import { CompactButton } from '../../ui';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onSuccess: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ isOpen, onClose, user, onSuccess }) => {
  const { } = usePermissions();
  const [deleting, setDeleting] = useState(false);
  const [deleteUser] = useDeleteUserMutation();

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUser(user.user_id).unwrap();
      toast.success(`Usuario eliminado exitosamente \n ${user.name}`, { duration: 5000 });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al eliminar usuario.') ?? 'Error al eliminar usuario.', { duration: 5000 });
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <PermissionGate permissions={['users.delete']} fallback={
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-sm w-full max-w-sm shadow-xl p-4 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">Acceso Denegado</h3>
          <p className="text-sm text-text-secondary mb-4">No tienes permisos para eliminar usuarios.</p>
          <CompactButton variant="ghost" onClick={onClose} className="w-full justify-center">Cerrar</CompactButton>
        </div>
      </div>
    }>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-sm w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-4">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-base font-semibold text-text-primary text-center mb-1">Eliminar Usuario</h3>
            <p className="text-sm text-text-secondary text-center mb-4">
              ¿Eliminar al usuario <strong>{user.name}</strong> ({user.username})?
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
    </PermissionGate>
  );
};

export default DeleteUserDialog;
