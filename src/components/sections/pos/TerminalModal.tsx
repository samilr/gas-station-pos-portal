import React, { useState, useEffect } from 'react';
import { Monitor, Save, X, Edit, Plus, User, Smartphone, RefreshCw, Layers, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { ITerminal } from '../../../services/terminalService';
import { useCreateTerminalMutation, useUpdateTerminalMutation } from '../../../store/api/terminalsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { FuelIsland } from '../../../services/fuelIslandService';
import { store } from '../../../store';
import { fuelIslandsApi } from '../../../store/api/fuelIslandsApi';
import { CompactButton } from '../../ui';
import { SiteAutocomplete } from '../../ui/autocompletes';
import { getHostTypeLabel } from '../../../types/host_type.enum';

interface TerminalFormData {
  siteId: string;
  terminalId: number;
  name: string;
  sectorId?: number;
  active: boolean;
  fuelIslandId: number | null;
  unassignFuelIsland: boolean;
  fuelIslandEnabled: boolean;
  dataphoneEnabled: boolean;
  terminalType: number;
  productList: number;
  useCustomerDisplay: boolean;
  openCashDrawer: boolean;
  printDevice: number;
  cashFund: number;
  productListType: number;
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

const EMPTY_FORM: TerminalFormData = {
  siteId: '',
  terminalId: 0,
  name: '',
  sectorId: undefined,
  active: true,
  fuelIslandId: null,
  unassignFuelIsland: false,
  fuelIslandEnabled: true,
  dataphoneEnabled: false,
  terminalType: 1,
  productList: 1,
  useCustomerDisplay: false,
  openCashDrawer: false,
  printDevice: 1,
  cashFund: 0,
  productListType: 1,
};

const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose, terminal, mode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fuelIslands, setFuelIslands] = useState<FuelIsland[]>([]);
  const [loadingIslands, setLoadingIslands] = useState(false);
  const [formData, setFormData] = useState<TerminalFormData>(EMPTY_FORM);
  const [createTerminal] = useCreateTerminalMutation();
  const [updateTerminal] = useUpdateTerminalMutation();

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  useEffect(() => {
    if (terminal && isOpen && (isEditing || isViewing)) {
      setFormData({
        siteId: terminal.siteId || '',
        terminalId: terminal.terminalId || 0,
        name: terminal.name || '',
        sectorId: terminal.sectorId,
        active: Boolean(terminal.active),
        fuelIslandId: terminal.fuelIslandId ?? null,
        unassignFuelIsland: false,
        fuelIslandEnabled: terminal.fuelIslandEnabled ?? true,
        dataphoneEnabled: terminal.dataphoneEnabled ?? false,
        terminalType: terminal.terminalType ?? 1,
        productList: terminal.productList ?? 1,
        useCustomerDisplay: terminal.useCustomerDisplay ?? false,
        openCashDrawer: terminal.openCashDrawer ?? false,
        printDevice: terminal.printDevice ?? 1,
        cashFund: terminal.cashFund ?? 0,
        productListType: terminal.productListType ?? 1,
      });
    } else if (isCreating && isOpen) {
      setFormData(EMPTY_FORM);
    }
  }, [terminal, isOpen, isEditing, isViewing, isCreating]);

  // Cargar isletas del sitio para el selector
  useEffect(() => {
    if (!isOpen || isViewing) return;
    if (!formData.siteId) {
      setFuelIslands([]);
      return;
    }
    const loadIslands = async () => {
      setLoadingIslands(true);
      try {
        const result = await store.dispatch(
          fuelIslandsApi.endpoints.listFuelIslands.initiate({ siteId: formData.siteId })
        );
        setFuelIslands(result.data ?? []);
      } catch {
        setFuelIslands([]);
      } finally {
        setLoadingIslands(false);
      }
    };
    loadIslands();
  }, [isOpen, isViewing, formData.siteId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? null : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleFuelIslandChange = (value: string) => {
    if (value === '__UNASSIGN__') {
      setFormData((f) => ({ ...f, fuelIslandId: null, unassignFuelIsland: true }));
    } else if (value === '') {
      setFormData((f) => ({ ...f, fuelIslandId: null, unassignFuelIsland: false }));
    } else {
      setFormData((f) => ({ ...f, fuelIslandId: parseInt(value, 10), unassignFuelIsland: false }));
    }
  };

  const buildPayload = () => {
    // Para create: enviar fuelIslandId si hay selección
    // Para update: usar tri-estado (unassignFuelIsland tiene prioridad)
    const { unassignFuelIsland, fuelIslandId, ...rest } = formData;
    if (isCreating) {
      return {
        ...rest,
        fuelIslandId: fuelIslandId ?? null,
      };
    }
    // editing
    return {
      ...rest,
      ...(unassignFuelIsland
        ? { unassignFuelIsland: true }
        : fuelIslandId != null
          ? { fuelIslandId }
          : {}),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;

    if (formData.fuelIslandEnabled && (formData.unassignFuelIsland || formData.fuelIslandId == null)) {
      toast.error('Selecciona una isleta para activar la integración');
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      if (isEditing && terminal) {
        try {
          await updateTerminal({ siteId: terminal.siteId, terminalId: terminal.terminalId, body: payload }).unwrap();
          toast.success(`Terminal actualizada exitosamente\n${formData.name}`, { duration: 5000 });
          onSuccess();
          onClose();
        } catch (err) {
          toast.error(getErrorMessage(err, 'Error al actualizar terminal.') ?? 'Error al actualizar terminal.', { duration: 6000 });
        }
      } else {
        try {
          await createTerminal(payload as any).unwrap();
          toast.success(`Terminal creada exitosamente\n${formData.name}`, { duration: 5000 });
          onSuccess();
          onClose();
        } catch (err) {
          toast.error(getErrorMessage(err, 'Error al crear terminal.') ?? 'Error al crear terminal.', { duration: 6000 });
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

  const fuelIslandSelectValue = formData.unassignFuelIsland
    ? '__UNASSIGN__'
    : (formData.fuelIslandId == null ? '' : String(formData.fuelIslandId));

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
              <input type="number" name="terminalId" value={formData.terminalId} onChange={handleInputChange} required disabled={isViewing || isEditing}
                className={inputCls(isViewing || isEditing)} placeholder="ID de la terminal" />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Sucursal *</label>
              <SiteAutocomplete
                name="siteId"
                value={formData.siteId}
                onChange={(v) => setFormData(prev => ({ ...prev, siteId: v ?? '' }))}
                required
                disabled={isViewing || isEditing}
                placeholder="Selecciona una sucursal"
              />
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

          <div className="grid grid-cols-1 gap-3">
            <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
              <span className="text-xs text-text-primary">Activa</span>
              <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange}
                disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </label>
          </div>

          {/* Integraciones */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary flex items-center gap-1">
              <Layers className="w-3 h-3 text-orange-500" /> Integraciones
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`col-span-2 flex items-center justify-between px-2 h-7 rounded-sm cursor-pointer border ${
                  formData.dataphoneEnabled
                    ? 'bg-blue-50/50 border-blue-100'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <span className={`text-xs font-medium flex items-center gap-1 ${formData.dataphoneEnabled ? 'text-blue-900' : 'text-text-primary'}`}>
                  <Smartphone className="w-3 h-3" /> Datafono integrado
                </span>
                <input
                  type="checkbox"
                  name="dataphoneEnabled"
                  checked={formData.dataphoneEnabled}
                  onChange={handleInputChange}
                  disabled={isViewing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <p className="col-span-2 text-2xs text-text-muted flex items-start gap-1 -mt-1">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                {formData.dataphoneEnabled
                  ? 'El terminal procesará pagos con tarjeta vía dataphone físico conectado.'
                  : 'El terminal no aceptará pagos con tarjeta.'}
              </p>

              <div className="col-span-2 pt-2 border-t border-gray-100">
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Isleta asignada</label>
                <select
                  value={fuelIslandSelectValue}
                  onChange={(e) => handleFuelIslandChange(e.target.value)}
                  disabled={isViewing || !formData.siteId || loadingIslands}
                  className={inputCls(isViewing || !formData.siteId || loadingIslands)}
                >
                  <option value="">
                    {!formData.siteId
                      ? 'Primero ingresa el Site ID'
                      : loadingIslands
                        ? 'Cargando isletas...'
                        : isEditing ? '— No cambiar —' : '— Ninguna —'}
                  </option>
                  {isEditing && <option value="__UNASSIGN__">— Ninguna —</option>}
                  {fuelIslands.map((i) => (
                    <option key={i.fuelIslandId} value={i.fuelIslandId}>
                      {i.name}{!i.active ? ' (inactiva)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <label
                className={`col-span-2 flex items-center justify-between px-2 h-7 rounded-sm cursor-pointer border ${
                  formData.fuelIslandEnabled
                    ? 'bg-blue-50/50 border-blue-100'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <span className={`text-xs font-medium flex items-center gap-1 ${formData.fuelIslandEnabled ? 'text-blue-900' : 'text-amber-900'}`}>
                  <Layers className="w-3 h-3" /> Integración con isleta (flujo automático)
                </span>
                <input
                  type="checkbox"
                  name="fuelIslandEnabled"
                  checked={formData.fuelIslandEnabled}
                  onChange={handleInputChange}
                  disabled={isViewing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <p className="col-span-2 text-2xs text-text-muted flex items-start gap-1">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                {formData.fuelIslandEnabled
                  ? 'El POS usará la isleta asignada para operar en modo automático.'
                  : 'Bypass: el POS ignora la isleta y cae a flujo manual. La asignación se conserva.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary">Configuración</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Tipo Terminal</label>
                <input type="number" name="terminalType" value={formData.terminalType} onChange={handleInputChange} disabled={isViewing}
                  className={inputCls(isViewing)} min={1} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Lista de Productos</label>
                <input type="number" name="productList" value={formData.productList} onChange={handleInputChange} disabled={isViewing}
                  className={inputCls(isViewing)} min={1} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Dispositivo Impresión</label>
                <input type="number" name="printDevice" value={formData.printDevice} onChange={handleInputChange} disabled={isViewing}
                  className={inputCls(isViewing)} min={1} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Fondo de Caja</label>
                <input type="number" name="cashFund" value={formData.cashFund} onChange={handleInputChange} disabled={isViewing}
                  className={inputCls(isViewing)} min={0} step="0.01" />
              </div>
              <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
                <span className="text-xs text-text-primary">Display Cliente</span>
                <input type="checkbox" name="useCustomerDisplay" checked={formData.useCustomerDisplay} onChange={handleInputChange}
                  disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </label>
              <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
                <span className="text-xs text-text-primary">Abrir Cajón</span>
                <input type="checkbox" name="openCashDrawer" checked={formData.openCashDrawer} onChange={handleInputChange}
                  disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </label>
            </div>
          </div>

          {terminal && isViewing && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary pb-1 border-b border-gray-200">Información de Conexión</h4>
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

              {terminal.device && (
                <div>
                  <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary pb-1 border-b border-gray-200 mb-2">Dispositivo Conectado</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-text-muted">Nombre:</span><span className="font-medium">{terminal.device.name}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Tipo:</span><span className="font-medium">{terminal.device.hostTypeName || getHostTypeLabel(terminal.device.hostTypeCode)}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Código:</span><span className="font-medium font-mono text-xs">{terminal.device.hostTypeCode}</span></div>
                    <div className="flex justify-between"><span className="text-text-muted">Impresora:</span><span className={`font-medium ${terminal.device.hasPrinter ? 'text-green-600' : 'text-gray-500'}`}>{terminal.device.hasPrinter ? 'Sí' : 'No'}</span></div>
                  </div>
                </div>
              )}
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
