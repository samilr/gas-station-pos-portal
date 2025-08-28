import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { deviceService, IDevice } from '../../../../services/deviceService';
import toast from 'react-hot-toast';

interface DeleteDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  device: IDevice | null;
  onSuccess: () => void;
}

const DeleteDeviceDialog: React.FC<DeleteDeviceDialogProps> = ({ isOpen, onClose, device, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!device) return;
    
    setLoading(true);
    try {
      const response = await deviceService.deleteDevice(device.id);
      if (response.successful) {
        toast.success(`Dispositivo eliminado exitosamente \n ${device.name}`, {
          duration: 5000,
          icon: '✅',
        });
        onSuccess();
        onClose();
      } else {
        toast.error('Error al eliminar dispositivo. Por favor, inténtalo de nuevo.', {
          duration: 5000,
          icon: '❌',
        });
        console.error('Error al eliminar dispositivo');
      }
    } catch (error) {
      console.error('Error al eliminar dispositivo:', error);
      toast.error('Error de conexión. Por favor, inténtalo de nuevo.', {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !device) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Dialog Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Eliminar Dispositivo
              </h3>
              <p className="text-sm text-gray-600">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              ¿Estás seguro de que quieres eliminar el dispositivo <strong>{device.name}</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Advertencia
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Esta acción eliminará permanentemente el dispositivo y todos sus datos asociados. 
                    Esta operación no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Detalles del Dispositivo</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{device.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID del Dispositivo:</span>
                <span className="font-medium">{device.deviceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{device.deviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sitio:</span>
                <span className="font-medium">{device.siteId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${device.status ? 'text-green-600' : 'text-red-600'}`}>
                  {device.status ? 'Activo' : 'Inactivo'}
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
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Dispositivo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDeviceDialog;
