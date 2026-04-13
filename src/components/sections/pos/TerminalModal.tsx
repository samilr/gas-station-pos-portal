import React, { useState, useEffect } from 'react';
import { Monitor, Save, X, Edit, Plus, Clock, User, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { ITerminal, terminalService } from '../../../services/terminalService';

interface TerminalFormData {
  siteId: string;
  terminalId: number;
  name: string;
  sectorId?: number;
  connected: boolean;
  active: boolean;
}

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminal?: ITerminal | null;
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

const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose, terminal, mode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TerminalFormData>({
    siteId: '',
    terminalId: 0,
    name: '',
    sectorId: undefined,
    connected: false,
    active: true
  });

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  // Cargar datos del terminal cuando se abre el modal para editar o ver
  useEffect(() => {
    if (terminal && isOpen && (isEditing || isViewing)) {
      setFormData({
        siteId: terminal.site_id || '',
        terminalId: terminal.terminal_id || 0,
        name: terminal.name || '',
        sectorId: terminal.sector_id,
        connected: Boolean(terminal.connected),
        active: Boolean(terminal.active)
      });
    } else if (isCreating && isOpen) {
      setFormData({
        siteId: '',
        terminalId: 0,
        name: '',
        sectorId: undefined,
        connected: false,
        active: true
      });
    }
  }, [terminal, isOpen, isEditing, isViewing, isCreating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
               type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;

    setLoading(true);
    try {
      if (isEditing && terminal) {
        const response = await terminalService.updateTerminal(terminal.site_id, terminal.terminal_id, formData);
        if (response.successful) {
          toast.success(`Terminal actualizada exitosamente \n ${formData.name}`, {
            duration: 5000,
            icon: '✅',
          });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al actualizar terminal. Por favor, inténtalo de nuevo.', {
            duration: 5000,
            icon: '❌',
          });
        }
      } else {
        const response = await terminalService.createTerminal(formData);
        if (response.successful) {
          toast.success(`Terminal creada exitosamente \n ${formData.name}`, {
            duration: 5000,
            icon: '✅',
          });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al crear terminal. Por favor, inténtalo de nuevo.', {
            duration: 5000,
            icon: '❌',
          });
        }
      }
    } catch (error) {
      console.error('Error al procesar terminal:', error);
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
      <div className="bg-white rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <Edit className="w-4 h-4 text-green-600" />
            ) : isViewing ? (
              <Monitor className="w-4 h-4 text-blue-600" />
            ) : (
              <Plus className="w-4 h-4 text-blue-600" />
            )}
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {isViewing ? 'Ver Terminal' : isEditing ? 'Editar Terminal' : 'Crear Nueva Terminal'}
              </h3>
              <p className="text-xs text-text-muted">
                {isViewing ? `Viendo: ${terminal?.name}` : isEditing ? `Editando: ${terminal?.name}` : 'Completa el formulario para crear una nueva terminal'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-600" />
                <span>Información Básica</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                    Nombre de la Terminal *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing}
                    className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa el nombre de la terminal"
                  />
                </div>

                <div>
                  <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                    Terminal *
                  </label>
                  <input
                    type="number"
                    name="terminalId"
                    value={formData.terminalId}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing}
                    className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa el ID de la terminal"
                  />
                </div>

                <div>
                  <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                    ID del Sitio *
                  </label>
                  <input
                    type="text"
                    name="siteId"
                    value={formData.siteId}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing}
                    className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa el ID del sitio"
                  />
                </div>

                <div>
                  <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                    Sector
                  </label>
                  <select
                    name="sectorId"
                    value={formData.sectorId || ''}
                    onChange={handleInputChange}
                    disabled={isViewing}
                    className={`w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">Selecciona un sector</option>
                    <option value="1">Oficina Estación</option>
                    <option value="2">Pista</option>
                    <option value="3">Tienda</option>
                  </select>
                </div>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-sm">
                  <div>
                    <label className="text-2xs uppercase tracking-wide text-gray-500">Conectada</label>
                    <p className="text-xs text-text-muted">Indica si la terminal está conectada</p>
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

                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-sm">
                  <div>
                    <label className="text-2xs uppercase tracking-wide text-gray-500">Activa</label>
                    <p className="text-xs text-text-muted">Indica si la terminal está activa</p>
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

            {/* Connection Information - Solo lectura */}
            {terminal && isViewing && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>Información de Conexión</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Conexión Actual */}
                  {terminal.connected && (
                    <div className="bg-blue-50 border border-blue-200 rounded-sm p-3">
                      <h4 className="text-xs font-medium text-blue-900 mb-2 flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Conexión Actual</span>
                      </h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Usuario:</span>
                          <span className="font-medium text-blue-900">
                            {terminal.connected_staft_id + ' - '+ terminal.connected_username || 'No conectado'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Dispositivo:</span>
                          <span className="font-medium text-blue-900">
                            {terminal?.connected_hostname?.toUpperCase().substring(10,16) || 'No disponible'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Hora de Conexión:</span>
                          <span className="font-medium text-blue-900">
                            {formatDate(terminal.connected_time)}
                          </span>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Última Conexión */}
                  <div className="bg-gray-50 border border-gray-200 rounded-sm p-3">
                    <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Última Conexión</span>
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usuario:</span>
                        <span className="font-medium text-gray-900">
                          {terminal.last_connection_username || 'No disponible'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dispositivo:</span>
                        <span className="font-medium text-gray-900">
                          {terminal?.last_connection_hostname?.toUpperCase().substring(10,16) || 'No disponible'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hora de Conexión:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(terminal.last_connection_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="h-7 px-3 text-sm rounded-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isViewing ? 'Cerrar' : 'Cancelar'}
              </button>
              {!isViewing && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 h-7 px-3 text-sm rounded-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isEditing ? 'Actualizar Terminal' : 'Crear Terminal'}</span>
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

export default TerminalModal;
