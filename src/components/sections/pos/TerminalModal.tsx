import React, { useState, useEffect } from 'react';
import { Monitor, Save, X, Edit, Plus, Clock, User, Smartphone, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { ITerminal, terminalService } from '../../../services/terminalService';
import { getPumpsConfig } from '../../../services/dispenserService';
import { PumpConfig } from '../../../types/dispenser';
import { CompactButton } from '../../ui';

interface TerminalFormData {
  siteId: string;
  terminalId: number;
  name: string;
  sectorId?: number;
  connected: boolean;
  active: boolean;
  hasIntegratedDispenser: boolean;
  linkedDispenserId: number | null;
}

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminal?: ITerminal | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'Nunca';
  const date = new Date(dateString);
  return date.toLocaleString('es-DO', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
};

const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose, terminal, mode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [dispensers, setDispensers] = useState<PumpConfig[]>([]);
  const [formData, setFormData] = useState<TerminalFormData>({
    siteId: '', 
    terminalId: 0, 
    name: '', 
    sectorId: undefined, 
    connected: false, 
    active: true,
    hasIntegratedDispenser: false,
    linkedDispenserId: null
  });

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';

  useEffect(() => {
    const fetchDispensers = async () => {
      try {
        const config = await getPumpsConfig();
        if (config && config.Pumps) {
          setDispensers(config.Pumps);
        }
      } catch (error) {
        console.error('Error al cargar dispensadoras:', error);
      }
    };
    fetchDispensers();
  }, []);

  useEffect(() => {
    if (terminal && isOpen && (isEditing || isViewing)) {
      setFormData({
        siteId: terminal.siteId || '',
        terminalId: terminal.terminalId || 0,
        name: terminal.name || '',
        sectorId: terminal.sectorId,
        connected: Boolean(terminal.connected),
        active: Boolean(terminal.active),
        hasIntegratedDispenser: terminal.hasIntegratedDispenser || false,
        linkedDispenserId: terminal.linkedDispenserId || null
      });
    } else if (mode === 'create' && isOpen) {
      setFormData({ 
        siteId: '', 
        terminalId: 0, 
        name: '', 
        sectorId: undefined, 
        connected: false, 
        active: true,
        hasIntegratedDispenser: false,
        linkedDispenserId: null
      });
    }
  }, [terminal, isOpen, isEditing, isViewing, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number' || name === 'linkedDispenserId') {
      finalValue = value === '' ? null : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;

    setLoading(true);
    try {
      if (isEditing && terminal) {
        const response = await terminalService.updateTerminal(terminal.siteId, terminal.terminalId, formData);
        if (response.successful) {
          toast.success(`Terminal actualizada exitosamente \n ${formData.name}`, { duration: 5000 });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al actualizar terminal.', { duration: 5000 });
        }
      } else {
        const response = await terminalService.createTerminal(formData);
        if (response.successful) {
          toast.success(`Terminal creada exitosamente \n ${formData.name}`, { duration: 5000 });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al crear terminal.', { duration: 5000 });
        }
      }
    } catch (error) {
      console.error('Error al procesar terminal:', error);
      toast.error('Error de conexión.', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const HeaderIcon = isEditing ? Edit : isViewing ? Monitor : Plus;
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
                {isViewing ? 'Ver Terminal' : isEditing ? 'Editar Terminal' : 'Crear Nueva Terminal'}
              </h3>
              <p className="text-2xs text-text-muted">
                {isViewing ? `Viendo: ${terminal?.name}` : isEditing ? `Editando: ${terminal?.name}` : 'Completa el formulario'}
              </p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required disabled={isViewing}
                className={inputCls(isViewing)} placeholder="Nombre de la terminal" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Terminal *</label>
              <input type="number" name="terminalId" value={formData.terminalId} onChange={handleInputChange} required disabled={isViewing}
                className={inputCls(isViewing)} placeholder="ID de la terminal" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID del Sitio *</label>
              <input type="text" name="siteId" value={formData.siteId} onChange={handleInputChange} required disabled={isViewing}
                className={inputCls(isViewing)} placeholder="ID del sitio" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Sector</label>
              <select name="sectorId" value={formData.sectorId || ''} onChange={handleInputChange} disabled={isViewing} className={inputCls(isViewing)}>
                <option value="">Selecciona un sector</option>
                <option value="1">Oficina Estación</option>
                <option value="2">Pista</option>
                <option value="3">Tienda</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
              <span className="text-xs text-text-primary">Conectada</span>
              <input type="checkbox" name="connected" checked={formData.connected} onChange={handleInputChange}
                disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </label>
            <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
              <span className="text-xs text-text-primary">Activa</span>
              <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange}
                disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </label>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary">Integración con Dispensadora</h4>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center justify-between px-2 h-7 bg-blue-50/50 border border-blue-100 rounded-sm cursor-pointer">
                <span className="text-xs text-blue-900 font-medium">¿Integración Activa?</span>
                <input type="checkbox" name="hasIntegratedDispenser" checked={formData.hasIntegratedDispenser} onChange={handleInputChange}
                  disabled={isViewing} className="rounded border-blue-300 text-blue-600 focus:ring-blue-500" />
              </label>
              
              <div>
                <select 
                  name="linkedDispenserId" 
                  value={formData.linkedDispenserId || ''} 
                  onChange={handleInputChange} 
                  disabled={isViewing || !formData.hasIntegratedDispenser} 
                  className={inputCls(isViewing || !formData.hasIntegratedDispenser)}
                >
                  <option value="">Selecciona Bomba</option>
                  {dispensers.map(pump => (
                    <option key={pump.Id} value={pump.Id}>
                      BOMBA {pump.Id} {pump.Tag ? `- ${pump.Tag}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {!formData.hasIntegratedDispenser && (
              <p className="text-2xs text-text-muted italic px-1">
                Activa para vincular esta terminal directamente a una bomba en el flujo mobile.
              </p>
            )}
          </div>

          {terminal && isViewing && (
            <div className="space-y-2">
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">Información de Conexión</h4>
              <div className="grid grid-cols-2 gap-3">
                {terminal.connected && (
                  <div className="bg-blue-50 border border-blue-200 rounded-sm p-2 text-xs space-y-1">
                    <div className="flex items-center gap-1 font-medium text-blue-900 mb-1"><User className="w-3 h-3" />Actual</div>
                    <div className="flex justify-between"><span className="text-blue-700">Usuario:</span><span className="font-medium text-blue-900">{terminal.connectedStaftId + ' - ' + terminal.connectedUsername || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-blue-700">Dispositivo:</span><span className="font-medium text-blue-900">{terminal?.connectedHostname?.toUpperCase().substring(0, 6) || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-blue-700">Hora:</span><span className="font-medium text-blue-900">{formatDate(terminal.connectedTime)}</span></div>
                  </div>
                )}
                <div className="bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-medium text-text-primary mb-1"><Smartphone className="w-3 h-3" />Última</div>
                  <div className="flex justify-between"><span className="text-text-muted">Usuario:</span><span className="font-medium">{terminal.lastConnectionUsername || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Dispositivo:</span><span className="font-medium">{terminal?.lastConnectionHostname?.toUpperCase().substring(0, 6) || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Hora:</span><span className="font-medium">{formatDate(terminal.lastConnectionTime)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={handleClose}>{isViewing ? 'Cerrar' : 'Cancelar'}</CompactButton>
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

export default TerminalModal;
