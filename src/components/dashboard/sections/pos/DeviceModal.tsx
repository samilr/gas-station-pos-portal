import React, { useState, useEffect } from 'react';
import { Smartphone, Save, X, Edit, Plus, Clock, User, Globe } from 'lucide-react';
import { hostService, IHost } from '../../../../services/deviceService';
import toast from 'react-hot-toast';

interface HostFormData {
  hostId: number;
  name: string;
  description: string;
  ipAddress: string;
  siteId: string;
  deviceId: string;
  connected: boolean;
  connectedLastTime?: Date;
  connectedLastUserId?: number;
  active: boolean;
}

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device?: IHost | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

// Función para formatear fecha
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'Nunca';
  const date = new Date(dateString);
  return date.toLocaleString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const DeviceModal: React.FC<DeviceModalProps> = ({ isOpen, onClose, device, mode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<HostFormData>({
    hostId: 0,
    name: '',
    description: '',
    ipAddress: '',
    siteId: '',
    deviceId: '',
    connected: false,
    connectedLastTime: undefined,
    connectedLastUserId: undefined,
    active: true
  });

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  // Cargar datos del dispositivo cuando se abre el modal para editar o ver
  useEffect(() => {
    if (device && isOpen && (isEditing || isViewing)) {
      setFormData({
        hostId: device.host_id || 0,
        name: device.name || '',
        description: device.description || '',
        ipAddress: device.ip_address || '',
        siteId: device.site_id || '',
        deviceId: device.device_id || '',
        connected: device.connected || false,
        connectedLastTime: device.connected_last_time,
        connectedLastUserId: device.connected_last_user_id,
        active: device.active || true
      });
    } else if (isCreating && isOpen) {
      setFormData({
        hostId: 0,
        name: '',
        description: '',
        ipAddress: '',
        siteId: '',
        deviceId: '',
        connected: false,
        connectedLastTime: undefined,
        connectedLastUserId: undefined,
        active: true
      });
    }
  }, [device, isOpen, isEditing, isViewing, isCreating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;
    
    setLoading(true);
    try {
      if (isEditing) {
        const response = await hostService.updateHost(device!.host_id, formData);
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
        const response = await hostService.createHost(formData);
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa una descripción del dispositivo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID del Sitio
                  </label>
                  <input
                    type="text"
                    name="siteId"
                    value={formData.siteId}
                    onChange={handleInputChange}
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa el ID del sitio"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID del Dispositivo
                  </label>
                  <input
                    type="text"
                    name="deviceId"
                    value={formData.deviceId}
                    onChange={handleInputChange}
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa el ID del dispositivo"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Conectado</label>
                    <p className="text-xs text-gray-500">Indica si el dispositivo está conectado</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="connected"
                      checked={formData.connected}
                      onChange={handleInputChange}
                      disabled={isViewing}
                      className="sr-only peer"
                    />
                    <div className={`relative w-12 h-7 rounded-full transition-all duration-300 ease-in-out ${
                      formData.connected 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200 border-2 border-gray-300'
                    } ${isViewing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 ease-in-out transform shadow-sm ${
                        formData.connected ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                      {formData.connected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Activo</label>
                    <p className="text-xs text-gray-500">Indica si el dispositivo está activo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      disabled={isViewing}
                      className="sr-only peer"
                    />
                    <div className={`relative w-12 h-7 rounded-full transition-all duration-300 ease-in-out ${
                      formData.active 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200 border-2 border-gray-300'
                    } ${isViewing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 ease-in-out transform shadow-sm ${
                        formData.active ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                      {formData.active && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* System Information - Solo lectura */}
            {device && isViewing && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <span>Información del Sistema</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información del Host */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center space-x-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Información del Host</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Host ID:</span>
                        <span className="font-medium text-blue-900">
                          {device.host_id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Dirección IP:</span>
                        <span className="font-medium text-blue-900">
                          {device.ip_address ? 
                            (device.ip_address.length > 16 ? 
                              `${device.ip_address.substring(0, 16)}...` : 
                              device.ip_address
                            ) : 
                            'No disponible'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Estado:</span>
                        <span className={`font-medium ${device.active ? 'text-green-600' : 'text-red-600'}`}>
                          {device.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de Conexión */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Información de Conexión</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={`font-medium ${device.connected ? 'text-green-600' : 'text-red-600'}`}>
                          {device.connected ? 'Conectado' : 'Desconectado'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Último Usuario:</span>
                        <span className="font-medium text-gray-900">
                          {device.connected_last_user_id || 'No disponible'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Última Conexión:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(device.connected_last_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
