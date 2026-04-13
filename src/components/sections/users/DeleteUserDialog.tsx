import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePermissions } from '../../../hooks/usePermissions';
import { IUser, userService } from '../../../services/userService';
import { PermissionGate } from '../../common';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onSuccess: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ isOpen, onClose, user, onSuccess }) => {
  const { } = usePermissions();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await userService.deleteUser(user.user_id);
      if (response.successful) {
        toast.success(`Usuario eliminado exitosamente \n ${user.name}`, {
          duration: 5000,
          icon: '✅',
        });
        onSuccess();
        onClose();
      } else {
        toast.error('Error al eliminar usuario. Por favor, inténtalo de nuevo.', {
          duration: 5000,
          icon: '❌',
        });
        console.error('Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error de conexión. Por favor, inténtalo de nuevo.', {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <PermissionGate permissions={['users.delete']} fallback={
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-sm max-w-lg w-full p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Acceso Denegado
          </h3>
          <p className="text-xs text-text-muted mb-3">
            No tienes permisos para eliminar usuarios. Solo usuarios ADMIN pueden realizar esta acción.
          </p>
          <button
            onClick={onClose}
            className="h-7 px-3 text-sm rounded-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    }>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-sm max-w-lg w-full">
          {/* Dialog Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Eliminar Usuario
                </h3>
                <p className="text-xs text-text-muted">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Dialog Content */}
          <div className="p-4">
            <div className="mb-3">
              <p className="text-sm text-gray-700 mb-3">
                ¿Estás seguro de que quieres eliminar al usuario <strong>{user.name}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-sm p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-medium text-red-800">
                      Advertencia
                    </h4>
                    <p className="text-xs text-red-700 mt-1">
                      Esta acción eliminará permanentemente el usuario y todos sus datos asociados.
                      Esta operación no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="bg-gray-50 rounded-sm p-3 mb-3">
              <h4 className="text-xs font-medium text-gray-900 mb-2">Detalles del Usuario</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usuario:</span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rol:</span>
                  <span className="font-medium">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`font-medium ${user.active === 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {user.active === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-7 px-3 text-sm rounded-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center space-x-2 h-7 px-3 text-sm rounded-sm font-medium bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Usuario</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};

export default DeleteUserDialog;
