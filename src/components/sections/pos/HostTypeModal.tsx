import React, { useState, useEffect } from 'react';
import { Layers, Save, X, Edit, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { hostTypeService, IHostType } from '../../../services/hostTypeService';
import { HostTypeCode, HOST_TYPE_LABELS } from '../../../types/host_type.enum';
import { CompactButton } from '../../ui';

interface HostTypeFormData {
  name: string;
  description: string;
  active: boolean;
  code: string;
  hasPrinter: boolean;
}

interface HostTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostType?: IHostType | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

const EMPTY_FORM: HostTypeFormData = {
  name: '',
  description: '',
  active: true,
  code: '',
  hasPrinter: false,
};

const HostTypeModal: React.FC<HostTypeModalProps> = ({ isOpen, onClose, hostType, mode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<HostTypeFormData>(EMPTY_FORM);

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';

  useEffect(() => {
    if (hostType && isOpen && (isEditing || isViewing)) {
      setFormData({
        name: hostType.name || '',
        description: hostType.description || '',
        active: hostType.active ?? true,
        code: hostType.code || '',
        hasPrinter: hostType.hasPrinter ?? false,
      });
    } else if (mode === 'create' && isOpen) {
      setFormData(EMPTY_FORM);
    }
  }, [hostType, isOpen, isEditing, isViewing, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        active: formData.active,
        code: formData.code || undefined,
        hasPrinter: formData.hasPrinter,
      };

      if (isEditing && hostType) {
        const response = await hostTypeService.updateHostType(hostType.hostTypeId, payload);
        if (response.successful) {
          toast.success(`Tipo actualizado exitosamente \n ${formData.name}`, { duration: 5000 });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al actualizar tipo.', { duration: 5000 });
        }
      } else {
        const response = await hostTypeService.createHostType(payload);
        if (response.successful) {
          toast.success(`Tipo creado exitosamente \n ${formData.name}`, { duration: 5000 });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al crear tipo.', { duration: 5000 });
        }
      }
    } catch (error) {
      console.error('Error al procesar tipo de dispositivo:', error);
      toast.error('Error de conexión.', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const HeaderIcon = isEditing ? Edit : isViewing ? Layers : Plus;
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
                {isViewing ? 'Ver Tipo de Dispositivo' : isEditing ? 'Editar Tipo' : 'Crear Nuevo Tipo'}
              </h3>
              <p className="text-2xs text-text-muted">
                {isViewing ? `Viendo: ${hostType?.name}` : isEditing ? `Editando: ${hostType?.name}` : 'Completa el formulario'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required disabled={isViewing}
                className={inputCls(isViewing)} placeholder="Nombre visible" />
            </div>
            <div className="col-span-2">
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Descripción</label>
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} disabled={isViewing}
                className={inputCls(isViewing)} placeholder="Descripción del tipo" />
            </div>
            <div className="col-span-2">
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Código</label>
              <select name="code" value={formData.code} onChange={handleInputChange} disabled={isViewing} className={inputCls(isViewing)}>
                <option value="">Sin definir</option>
                {Object.values(HostTypeCode).map(code => (
                  <option key={code} value={code}>{HOST_TYPE_LABELS[code]} ({code})</option>
                ))}
              </select>
              <p className="text-2xs text-text-muted italic mt-0.5 px-0.5">
                Se usa para lógica estable. Códigos no válidos se guardan como nulo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
              <span className="text-xs text-text-primary">Activo</span>
              <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange}
                disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </label>
            <label className="flex items-center justify-between px-2 h-7 bg-blue-50/50 border border-blue-100 rounded-sm cursor-pointer">
              <span className="text-xs text-blue-900 font-medium">Tiene Impresora</span>
              <input type="checkbox" name="hasPrinter" checked={formData.hasPrinter} onChange={handleInputChange}
                disabled={isViewing} className="rounded border-blue-300 text-blue-600 focus:ring-blue-500" />
            </label>
          </div>

          {hostType && isViewing && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary pb-1 border-b border-gray-200">Información</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-text-muted">ID:</span><span className="font-medium">{hostType.hostTypeId}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Código:</span><span className="font-medium font-mono text-xs">{hostType.code || 'N/A'}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>{isViewing ? 'Cerrar' : 'Cancelar'}</CompactButton>
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

export default HostTypeModal;
