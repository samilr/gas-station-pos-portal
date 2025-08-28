import React, { useState, useEffect } from 'react';
import { Smartphone, Save, X, Edit, Plus } from 'lucide-react';
import { deviceService, IDevice } from '../../../../services/deviceService';
import toast from 'react-hot-toast';

interface DeviceFormData {
  name: string;
  deviceId: string;
  siteId: string;
  status: boolean;
  deviceType: string;
  description: string;
}

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device?: IDevice | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

const DeviceModal: React.FC<DeviceModalProps> = ({ isOpen, onClose, device, mode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DeviceFormData>({
    name: '',
    deviceId: '',
    siteId: '',
    status: true,
    deviceType: 'smartphone',
    description: ''
  });

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  // Cargar datos del dispositivo cuando se abre el modal para editar o ver
  useEffect(() => {
    if (device && isOpen && (isEditing || isViewing)) {
      setFormData({
        name: device.name || '',
        deviceId: device.deviceId || '',
        siteId: device.siteId || '',
        status: device.status || true,
        deviceType: device.deviceType || 'smartphone',
        description: device.description || ''
      });
    } else if (isCreating && isOpen) {
      setFormData({
        name: '',
        deviceId: '',
        siteId: '',
        status: true,
        deviceType: 'smartphone',
        description: ''
      });
    }
  }, [device, isOpen, isEditing, isViewing, isCreating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;
    
    setLoading(true);
    try {
      if (isEditing) {
        const response = await deviceService.updateDevice(device!.id, formData);
        if (response.successful) {
          toast.success(`Dispositivo actualizado exitosamente \n ${formData.name}`, {
            duration: 5000,
            icon: '✅',
          });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al actualizar dispositivo. Por favor, inténtalo de nuevo.', {
            duration: 5000,
            icon: '❌',
          });
        }
      } else {
        const response = await deviceService.createDevice(formData);
        if (response.successful) {
          toast.success(`Dispositivo creado exitosamente \n ${formData.name}`, {
            duration: 5000,
            icon: '✅',
          });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al crear dispositivo. Por favor, inténtalo de nuevo.', {
            duration: 5000,
            icon: '❌',
          });
        }
      }
    } catch (error) {
      console.error('Error al procesar dispositivo:', error);
      toast.error('Error de conexión. Por favor, inténtalo de nuevo.', {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <Edit className="w-6 h-6 text-green-600" />
            ) : (
              <Plus className="w-6 h-6 text-blue-600" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isViewing ? 'Ver Dispositivo' : isEditing ? 'Editar Dispositivo' : 'Crear Nuevo Dispositivo'}
              </h3>
              <p className="text-sm text-gray-600">
                {isViewing ? `Viendo: ${device?.name}` : isEditing ? `Editando: ${device?.name}` : 'Completa el formulario para crear un nuevo dispositivo'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <span>Información del Dispositivo</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Dispositivo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa el nombre del dispositivo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID del Dispositivo *
                  </label>
                  <input
                    type="text"
                    name="deviceId"
                    value={formData.deviceId}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa el ID del dispositivo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID del Sitio *
                  </label>
                  <input
                    type="text"
                    name="siteId"
                    value={formData.siteId}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa el ID del sitio"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Dispositivo *
                  </label>
                  <select
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="smartphone">Smartphone</option>
                    <option value="tablet">Tablet</option>
                    <option value="pos_device">Dispositivo POS</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status.toString()}
                    onChange={handleInputChange}
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isViewing}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Ingresa una descripción del dispositivo"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isViewing ? 'Cerrar' : 'Cancelar'}
              </button>
              {!isViewing && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isEditing ? 'Actualizar Dispositivo' : 'Crear Dispositivo'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeviceModal;
