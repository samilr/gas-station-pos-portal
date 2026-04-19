import React, { useState, useEffect } from 'react';
import { Smartphone, Save, X, Edit, Plus, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { hostService, IHost } from '../../../services/deviceService';
import { getHostTypeLabel } from '../../../types/host_type.enum';
import { CompactButton } from '../../ui';

interface HostFormData {
  hostId: number;
  name: string;
  description: string;
  ipAddress: string;
  siteId: string;
  deviceId: string;
  connected: boolean;
  connectedLastTime?: string | Date;
  connectedLastUserId?: number;
  active: boolean;
  hostTypeId?: number;
}

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device?: IHost | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

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
    active: true,
    hostTypeId: undefined
  });

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  useEffect(() => {
    if (device && isOpen && (isEditing || isViewing)) {
      setFormData({
        hostId: device.hostId || 0,
        name: device.name || '',
        description: device.description || '',
        ipAddress: device.ipAddress || '',
        siteId: device.siteId || '',
        deviceId: device.deviceId || '',
        connected: device.connected || false,
        connectedLastTime: device.connectedLastTime as any,
        connectedLastUserId: device.connectedLastUserId,
        active: device.active || true,
        hostTypeId: device.hostTypeId
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
        active: true,
        hostTypeId: undefined
      });
    }
  }, [device, isOpen, isEditing, isViewing, isCreating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'hostTypeId') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseInt(value, 10)
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? (value === '' ? undefined : parseInt(value, 10) || 0) :
              value === '' ? undefined : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;

    setLoading(true);
    try {
      if (isEditing) {
        const response = await hostService.updateHost(device!.hostId, formData);
        if (response.successful) {
          toast.success(`Dispositivo actualizado exitosamente \n ${formData.name}`, { duration: 5000 });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al actualizar dispositivo. Por favor, inténtalo de nuevo.', { duration: 5000 });
        }
      } else {
        const response = await hostService.createHost(formData);
        if (response.successful) {
          toast.success(`Dispositivo creado exitosamente \n ${formData.name}`, { duration: 5000 });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al crear dispositivo. Por favor, inténtalo de nuevo.', { duration: 5000 });
        }
      }
    } catch (error) {
      console.error('Error al procesar dispositivo:', error);
      toast.error('Error de conexión. Por favor, inténtalo de nuevo.', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const HeaderIcon = isEditing ? Edit : isViewing ? Smartphone : Plus;
  const headerColor = isEditing ? 'green' : 'blue';

  const inputCls = (disabled: boolean) =>
    `w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-${headerColor}-100 rounded-sm flex items-center justify-center`}>
              <HeaderIcon className={`w-4 h-4 text-${headerColor}-600`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {isViewing ? 'Ver Dispositivo' : isEditing ? 'Editar Dispositivo' : 'Crear Nuevo Dispositivo'}
              </h3>
              <p className="text-2xs text-text-muted">
                {isViewing ? `Viendo: ${device?.name}` : isEditing ? `Editando: ${device?.name}` : 'Completa el formulario'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre del Dispositivo *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required disabled={isViewing}
                className={inputCls(isViewing)} placeholder="Ingresa el nombre" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Descripción</label>
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} disabled={isViewing}
                className={inputCls(isViewing)} placeholder="Descripción" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID del Sitio</label>
              <input type="text" name="siteId" value={formData.siteId} onChange={handleInputChange} disabled={isViewing}
                className={inputCls(isViewing)} placeholder="ID del sitio" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID del Dispositivo</label>
              <input type="text" name="deviceId" value={formData.deviceId} onChange={handleInputChange} disabled={isViewing}
                className={inputCls(isViewing)} placeholder="ID del dispositivo" />
            </div>
            <div className="col-span-2">
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Tipo de Dispositivo</label>
              <select name="hostTypeId" value={formData.hostTypeId || ''} onChange={handleInputChange} disabled={isViewing}
                className={inputCls(isViewing)}>
                <option value="">Seleccione un tipo</option>
                <option value={1}>POS Android</option>
                <option value={2}>Smartphone Android</option>
                <option value={3}>Escáner Android</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
              <span className="text-xs text-text-primary">Conectado</span>
              <input type="checkbox" name="connected" checked={formData.connected} onChange={handleInputChange}
                disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </label>
            <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
              <span className="text-xs text-text-primary">Activo</span>
              <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange}
                disabled={isViewing || isCreating} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </label>
          </div>

          {device && isViewing && (
            <div className="space-y-2">
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Información del Sistema</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-sm p-2 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-medium text-blue-900 mb-1">
                    <Smartphone className="w-3 h-3" />Host
                  </div>
                  <div className="flex justify-between"><span className="text-blue-700">Host ID:</span><span className="font-medium text-blue-900">{device.hostId}</span></div>
                  <div className="flex justify-between"><span className="text-blue-700">IP:</span><span className="font-medium text-blue-900">{device.ipAddress || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-blue-700">Estado:</span><span className={`font-medium ${device.active ? 'text-green-600' : 'text-red-600'}`}>{device.active ? 'Activo' : 'Inactivo'}</span></div>
                  <div className="flex justify-between"><span className="text-blue-700">Tipo:</span><span className="font-medium text-blue-900">{device.hostType?.name || getHostTypeLabel(device.hostType?.code)}</span></div>
                  {device.hostType?.hasPrinter != null && (
                    <div className="flex justify-between"><span className="text-blue-700">Impresora:</span><span className={`font-medium ${device.hostType.hasPrinter ? 'text-green-600' : 'text-gray-500'}`}>{device.hostType.hasPrinter ? 'Sí' : 'No'}</span></div>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-medium text-text-primary mb-1">
                    <Clock className="w-3 h-3" />Conexión
                  </div>
                  <div className="flex justify-between"><span className="text-text-muted">Estado:</span><span className={`font-medium ${device.connected ? 'text-green-600' : 'text-red-600'}`}>{device.connected ? 'Conectado' : 'Desconectado'}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Último Usuario:</span><span className="font-medium">{device.connectedLastUserId || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Última:</span><span className="font-medium">{formatDate(device.connectedLastTime)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={handleClose}>
            {isViewing ? 'Cerrar' : 'Cancelar'}
          </CompactButton>
          {!isViewing && (
            <CompactButton type="submit" variant="primary" disabled={loading}>
              {loading ? <><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</> : <><Save className="w-3 h-3" /> Guardar</>}
            </CompactButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default DeviceModal;
