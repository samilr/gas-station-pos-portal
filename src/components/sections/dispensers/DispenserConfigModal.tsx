import React, { useEffect, useState } from 'react';
import { Fuel, Save, X, Edit, Plus, RefreshCw, Network, Cable, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ConnectionType, Dispenser, Parity, StopBits,
} from '../../../services/dispensersConfigService';
import {
  useCreateDispenserConfigMutation,
  useUpdateDispenserConfigMutation,
} from '../../../store/api/dispensersConfigApi';
import { setDispenserRequiresAuthorization } from '../../../services/ptsConfigService';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';
import { SiteAutocomplete } from '../../ui/autocompletes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dispenser?: Dispenser | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

interface FormState {
  siteId: string;
  pumpNumber: number | '';
  ptsId: string;
  nozzlesCount: number | '';
  name: string;
  active: boolean;
  brand: string;
  model: string;
  serialNumber: string;
  connectionType: ConnectionType;
  ipAddress: string;
  tcpPort: number | '';
  serialPort: string;
  baudRate: number | '';
  dataBits: number | '';
  parity: Parity | '';
  stopBits: StopBits | '';
  protocol: string;
  protocolVersion: string;
  ptsPort: number | '';
  busAddress: number | '';
  timeoutMs: number | '';
  requiresAuthorization: boolean;
}

const EMPTY: FormState = {
  siteId: '', pumpNumber: '', ptsId: '', nozzlesCount: 1, name: '', active: true,
  brand: '', model: '', serialNumber: '',
  connectionType: 'TCP', ipAddress: '', tcpPort: '',
  serialPort: '', baudRate: 9600, dataBits: 8, parity: 'None', stopBits: '1',
  protocol: '', protocolVersion: '', ptsPort: '', busAddress: '', timeoutMs: 5000,
  requiresAuthorization: false,
};

const BAUD_RATES = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];

const fromDispenser = (d: Dispenser): FormState => ({
  siteId: d.siteId,
  pumpNumber: d.pumpNumber,
  ptsId: d.ptsId ?? '',
  nozzlesCount: d.nozzlesCount,
  name: d.name ?? '',
  active: d.active,
  brand: d.brand ?? '',
  model: d.model ?? '',
  serialNumber: d.serialNumber ?? '',
  connectionType: d.connectionType,
  ipAddress: d.ipAddress ?? '',
  tcpPort: d.tcpPort ?? '',
  serialPort: d.serialPort ?? '',
  baudRate: d.baudRate ?? '',
  dataBits: d.dataBits ?? '',
  parity: (d.parity ?? '') as Parity | '',
  stopBits: (d.stopBits ?? '') as StopBits | '',
  protocol: d.protocol ?? '',
  protocolVersion: d.protocolVersion ?? '',
  ptsPort: d.ptsPort ?? '',
  busAddress: d.busAddress ?? '',
  timeoutMs: d.timeoutMs,
  requiresAuthorization: d.requiresAuthorization,
});

const toNullable = <T,>(v: T | ''): T | null => (v === '' ? null : (v as T));

const DispenserConfigModal: React.FC<Props> = ({ isOpen, onClose, dispenser, mode, onSuccess }) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [requireAuthBusy, setRequireAuthBusy] = useState(false);
  const [createDispenser] = useCreateDispenserConfigMutation();
  const [updateDispenser] = useUpdateDispenserConfigMutation();

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';
  const isSerial = form.connectionType !== 'TCP';

  useEffect(() => {
    if (!isOpen) return;
    if (dispenser && (isEditing || isViewing)) setForm(fromDispenser(dispenser));
    else setForm(EMPTY);
  }, [isOpen, dispenser, isEditing, isViewing]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Toggle pre-pago atómico (PTS 1.4 + 2.1 + BD orquestados server-side).
  // Se ejecuta inmediatamente — independiente del "Guardar" del form.
  // Si el PTS rechaza, el switch vuelve a su valor anterior.
  const handleToggleRequiresAuthorization = async (next: boolean) => {
    if (!dispenser) return;
    if (!form.active) {
      toast.error('La dispensadora debe estar activa para cambiar el modo de cobro');
      return;
    }
    const previous = form.requiresAuthorization;
    // Optimistic UI: refleja el cambio mientras la llamada está en vuelo.
    update('requiresAuthorization', next);
    setRequireAuthBusy(true);
    try {
      const res = await setDispenserRequiresAuthorization(dispenser.dispenserId, next);
      toast.success(
        `Bomba #${res.pumpNumber}: modo ${res.requireAuthorization ? 'pre-pago' : 'post-pago'} aplicado al PTS y BD`,
      );
      onSuccess();
    } catch (err: any) {
      update('requiresAuthorization', previous);
      toast.error(err?.message || 'Error al cambiar el modo de cobro');
    } finally {
      setRequireAuthBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;

    setLoading(true);
    try {
      if (isCreating) {
        if (!form.siteId || form.pumpNumber === '' || form.nozzlesCount === '' || form.timeoutMs === '') {
          toast.error('Completa los campos obligatorios');
          setLoading(false);
          return;
        }
        const payload = {
          siteId: form.siteId,
          pumpNumber: Number(form.pumpNumber),
          ptsId: form.ptsId || null,
          nozzlesCount: Number(form.nozzlesCount),
          name: form.name || null,
          brand: form.brand || null,
          model: form.model || null,
          serialNumber: form.serialNumber || null,
          connectionType: form.connectionType,
          ipAddress: toNullable(form.ipAddress),
          tcpPort: toNullable(form.tcpPort) as number | null,
          serialPort: toNullable(form.serialPort),
          baudRate: toNullable(form.baudRate) as number | null,
          dataBits: toNullable(form.dataBits) as number | null,
          parity: toNullable(form.parity) as Parity | null,
          stopBits: toNullable(form.stopBits) as StopBits | null,
          protocol: form.protocol || null,
          protocolVersion: form.protocolVersion || null,
          ptsPort: toNullable(form.ptsPort) as number | null,
          busAddress: toNullable(form.busAddress) as number | null,
          timeoutMs: Number(form.timeoutMs),
        };
        try {
          await createDispenser(payload).unwrap();
          toast.success(`Dispensadora creada: #${payload.pumpNumber}`, { duration: 4000 });
          onSuccess();
          onClose();
        } catch (err) {
          toast.error(getErrorMessage(err, 'Error al crear dispensadora') ?? 'Error al crear dispensadora');
        }
      } else if (isEditing && dispenser) {
        const payload = {
          ptsId: form.ptsId || null,
          nozzlesCount: form.nozzlesCount === '' ? null : Number(form.nozzlesCount),
          name: form.name || null,
          active: form.active,
          brand: form.brand || null,
          model: form.model || null,
          serialNumber: form.serialNumber || null,
          connectionType: form.connectionType,
          ipAddress: toNullable(form.ipAddress),
          tcpPort: toNullable(form.tcpPort) as number | null,
          serialPort: toNullable(form.serialPort),
          baudRate: toNullable(form.baudRate) as number | null,
          dataBits: toNullable(form.dataBits) as number | null,
          parity: toNullable(form.parity) as Parity | null,
          stopBits: toNullable(form.stopBits) as StopBits | null,
          protocol: form.protocol || null,
          protocolVersion: form.protocolVersion || null,
          ptsPort: toNullable(form.ptsPort) as number | null,
          busAddress: toNullable(form.busAddress) as number | null,
          timeoutMs: form.timeoutMs === '' ? null : Number(form.timeoutMs),
        };
        try {
          await updateDispenser({ id: dispenser.dispenserId, body: payload }).unwrap();
          toast.success('Dispensadora actualizada', { duration: 4000 });
          onSuccess();
          onClose();
        } catch (err) {
          toast.error(getErrorMessage(err, 'Error al actualizar') ?? 'Error al actualizar');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const HeaderIcon = isEditing ? Edit : isViewing ? Fuel : Plus;
  const headerColor = isEditing ? 'green' : 'blue';

  const inputCls = (disabled: boolean) =>
    `w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  const sectionHeader = 'text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200 flex items-center gap-1';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-2xl shadow-xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-${headerColor}-100 rounded-sm flex items-center justify-center`}>
              <HeaderIcon className={`w-4 h-4 text-${headerColor}-600`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {isViewing ? 'Ver Dispensadora' : isEditing ? 'Editar Dispensadora' : 'Nueva Dispensadora'}
              </h3>
              <p className="text-2xs text-text-muted">
                {dispenser ? `${dispenser.siteId} · Bomba #${dispenser.pumpNumber}` : 'Completa el formulario'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Identidad */}
          <div>
            <h4 className={sectionHeader}><Fuel className="w-3 h-3" /> Identidad</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Sucursal *</label>
                <SiteAutocomplete
                  value={form.siteId}
                  onChange={(v) => update('siteId', v ?? '')}
                  disabled={isViewing || isEditing}
                  required
                />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Pump Number *</label>
                <input type="number" value={form.pumpNumber}
                  onChange={(e) => update('pumpNumber', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  disabled={isViewing || isEditing} required min={1}
                  className={inputCls(isViewing || isEditing)} placeholder="1" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">PTS ID</label>
                <input type="text" value={form.ptsId} onChange={(e) => update('ptsId', e.target.value)}
                  disabled={isViewing} maxLength={24}
                  className={inputCls(isViewing)} placeholder="004A00323233..." />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nozzles *</label>
                <input type="number" value={form.nozzlesCount}
                  onChange={(e) => update('nozzlesCount', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  disabled={isViewing} required min={1}
                  className={inputCls(isViewing)} />
              </div>
              <div className="col-span-2">
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre</label>
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                  disabled={isViewing} maxLength={100}
                  className={inputCls(isViewing)} placeholder="Bomba 1 Isla Norte" />
              </div>
            </div>
          </div>

          {/* Hardware */}
          <div>
            <h4 className={sectionHeader}><Cable className="w-3 h-3" /> Hardware</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Marca</label>
                <input type="text" value={form.brand} onChange={(e) => update('brand', e.target.value)}
                  disabled={isViewing} className={inputCls(isViewing)} placeholder="Gilbarco" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Modelo</label>
                <input type="text" value={form.model} onChange={(e) => update('model', e.target.value)}
                  disabled={isViewing} className={inputCls(isViewing)} placeholder="Encore 700S" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Serial</label>
                <input type="text" value={form.serialNumber} onChange={(e) => update('serialNumber', e.target.value)}
                  disabled={isViewing} className={inputCls(isViewing)} placeholder="GB2024-1001" />
              </div>
            </div>
          </div>

          {/* Conexión */}
          <div>
            <h4 className={sectionHeader}><Network className="w-3 h-3" /> Conexión</h4>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Tipo *</label>
                <select value={form.connectionType}
                  onChange={(e) => update('connectionType', e.target.value as ConnectionType)}
                  disabled={isViewing} className={inputCls(isViewing)}>
                  <option value="TCP">TCP</option>
                  <option value="SERIAL">SERIAL</option>
                  <option value="RS485">RS485</option>
                  <option value="RS422">RS422</option>
                </select>
              </div>
              {!isSerial && (
                <>
                  <div className="col-span-2">
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">IP</label>
                    <input type="text" value={form.ipAddress} onChange={(e) => update('ipAddress', e.target.value)}
                      disabled={isViewing} className={inputCls(isViewing)} placeholder="192.168.1.50" />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Puerto TCP</label>
                    <input type="number" value={form.tcpPort}
                      onChange={(e) => update('tcpPort', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      disabled={isViewing} className={inputCls(isViewing)} placeholder="10001" />
                  </div>
                </>
              )}
              {isSerial && (
                <>
                  <div className="col-span-3">
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Serial Port</label>
                    <input type="text" value={form.serialPort} onChange={(e) => update('serialPort', e.target.value)}
                      disabled={isViewing} className={inputCls(isViewing)} placeholder="/dev/ttyUSB0 o COM3" />
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Baud Rate</label>
                    <select value={form.baudRate}
                      onChange={(e) => update('baudRate', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      disabled={isViewing} className={inputCls(isViewing)}>
                      <option value="">—</option>
                      {BAUD_RATES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Data Bits</label>
                    <select value={form.dataBits}
                      onChange={(e) => update('dataBits', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      disabled={isViewing} className={inputCls(isViewing)}>
                      <option value="">—</option>
                      <option value={7}>7</option>
                      <option value={8}>8</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Parity</label>
                    <select value={form.parity}
                      onChange={(e) => update('parity', e.target.value as Parity | '')}
                      disabled={isViewing} className={inputCls(isViewing)}>
                      <option value="">—</option>
                      <option value="None">None</option>
                      <option value="Even">Even</option>
                      <option value="Odd">Odd</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Stop Bits</label>
                    <select value={form.stopBits}
                      onChange={(e) => update('stopBits', e.target.value as StopBits | '')}
                      disabled={isViewing} className={inputCls(isViewing)}>
                      <option value="">—</option>
                      <option value="1">1</option>
                      <option value="1.5">1.5</option>
                      <option value="2">2</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Protocolo */}
          <div>
            <h4 className={sectionHeader}>Protocolo</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Protocolo</label>
                <input type="text" value={form.protocol} onChange={(e) => update('protocol', e.target.value)}
                  disabled={isViewing} className={inputCls(isViewing)} placeholder="GILBARCO_TWO_WIRE" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Versión</label>
                <input type="text" value={form.protocolVersion} onChange={(e) => update('protocolVersion', e.target.value)}
                  disabled={isViewing} className={inputCls(isViewing)} placeholder="1.0" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Timeout (ms) *</label>
                <input type="number" value={form.timeoutMs}
                  onChange={(e) => update('timeoutMs', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  disabled={isViewing} required min={1}
                  className={inputCls(isViewing)} />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5" title="Puerto serial dentro del PTS Controller (mapea a pumps[i].Port)">
                  PTS Port
                </label>
                <input type="number" value={form.ptsPort}
                  onChange={(e) => update('ptsPort', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  disabled={isViewing} min={1} max={4}
                  className={inputCls(isViewing)} placeholder="1-4" />
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5" title="Dirección de bus dentro del puerto PTS (mapea a pumps[i].Address)">
                  Bus Address
                </label>
                <input type="number" value={form.busAddress}
                  onChange={(e) => update('busAddress', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  disabled={isViewing} min={1}
                  className={inputCls(isViewing)} placeholder="1-4" />
              </div>
            </div>
          </div>

          {/* Estado */}
          {!isCreating && (
            <div className="space-y-1.5">
              <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
                <span className="text-xs text-text-primary">Activa</span>
                <input type="checkbox" checked={form.active} onChange={(e) => update('active', e.target.checked)}
                  disabled={isViewing} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </label>
              <div className="flex items-center justify-between px-2 min-h-7 bg-gray-50 border border-gray-200 rounded-sm py-1">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3 text-text-secondary" />
                  <span className="text-xs text-text-primary">Modo de cobro</span>
                </div>
                {isViewing ? (
                  <span
                    className={`inline-flex items-center px-1.5 h-5 rounded-sm text-2xs font-medium ${
                      form.requiresAuthorization
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {form.requiresAuthorization ? 'PRE-PAGO' : 'POST-PAGO'}
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={form.requiresAuthorization ? 'pre' : 'post'}
                      disabled={requireAuthBusy || !form.active}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === 'pre' || v === 'post') {
                          handleToggleRequiresAuthorization(v === 'pre');
                        }
                      }}
                      title={
                        !form.active
                          ? 'Activa la dispensadora para cambiar el modo'
                          : 'Aplica los parámetros 1.4 y 2.1 al PTS y actualiza la BD atómicamente'
                      }
                      className={`h-7 px-2 text-sm border rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        form.requiresAuthorization
                          ? 'border-teal-300 bg-teal-50 text-teal-900 font-medium'
                          : 'border-gray-300 bg-white text-text-primary'
                      } ${(requireAuthBusy || !form.active) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <option value="post">Post-pago</option>
                      <option value="pre">Pre-pago (CheckIn/CheckOut)</option>
                    </select>
                    {requireAuthBusy && (
                      <RefreshCw className="w-3 h-3 animate-spin text-text-muted" />
                    )}
                  </div>
                )}
              </div>
              {!isViewing && (
                <p className="text-2xs text-text-muted px-1">
                  El cambio se aplica al PTS y a la BD inmediatamente — no requiere "Guardar".
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>
            {isViewing ? 'Cerrar' : 'Cancelar'}
          </CompactButton>
          {!isViewing && (
            <CompactButton type="submit" variant="primary" disabled={loading}>
              {loading ? (<><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</>) : (<><Save className="w-3 h-3" /> Guardar</>)}
            </CompactButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default DispenserConfigModal;
