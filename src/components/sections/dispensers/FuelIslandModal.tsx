import React, { useEffect, useState } from 'react';
import { Layers, Save, X, Edit, Plus, RefreshCw, Monitor, Fuel, Building2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { FuelIsland } from '../../../services/fuelIslandService';
import { Dispenser } from '../../../services/dispensersConfigService';
import {
  useCreateFuelIslandMutation,
  useUpdateFuelIslandMutation,
  useGetUnassignedDispensersQuery,
} from '../../../store/api/fuelIslandsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { useSites } from '../../../hooks/useSites';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fuelIsland?: FuelIsland | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

interface FormState {
  siteId: string;
  name: string;
  active: boolean;
  dispenserIds: number[];
}

const EMPTY: FormState = {
  siteId: '',
  name: '',
  active: true,
  dispenserIds: [],
};

const fromIsland = (isl: FuelIsland): FormState => ({
  siteId: isl.siteId,
  name: isl.name,
  active: isl.active,
  dispenserIds: (isl.dispensers ?? []).map((d) => d.dispenserId),
});

const FuelIslandModal: React.FC<Props> = ({ isOpen, onClose, fuelIsland, mode, onSuccess }) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);

  const [createIsland] = useCreateFuelIslandMutation();
  const [updateIsland] = useUpdateFuelIslandMutation();

  const { sites } = useSites();

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  const shouldLoadUnassigned = isOpen && isCreating && !!form.siteId;
  const { data: unassignedData, isFetching: loadingUnassigned } = useGetUnassignedDispensersQuery(
    form.siteId || undefined,
    { skip: !shouldLoadUnassigned }
  );
  const unassigned: Dispenser[] = shouldLoadUnassigned ? (unassignedData ?? []) : [];

  useEffect(() => {
    if (!isOpen) return;
    if (fuelIsland && (isEditing || isViewing)) setForm(fromIsland(fuelIsland));
    else setForm(EMPTY);
  }, [isOpen, fuelIsland, isEditing, isViewing]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleDispenser = (id: number) => {
    setForm((f) => ({
      ...f,
      dispenserIds: f.dispenserIds.includes(id)
        ? f.dispenserIds.filter((x) => x !== id)
        : [...f.dispenserIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewing) return;

    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      if (isCreating) {
        if (!form.siteId) {
          toast.error('El Site ID es obligatorio');
          setLoading(false);
          return;
        }
        const payload = {
          siteId: form.siteId,
          name: form.name.trim(),
          dispenserIds: form.dispenserIds,
        };
        try {
          await createIsland(payload).unwrap();
          toast.success(`Fuel island creada: ${payload.name}`, { duration: 4000 });
          onSuccess();
          onClose();
        } catch (err) {
          toast.error(getErrorMessage(err, 'Error al crear fuel island') ?? 'Error al crear fuel island');
        }
      } else if (isEditing && fuelIsland) {
        const payload = {
          name: form.name.trim(),
          active: form.active,
        };
        try {
          await updateIsland({ id: fuelIsland.fuelIslandId, body: payload }).unwrap();
          toast.success('Fuel island actualizada', { duration: 4000 });
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

  const HeaderIcon = isEditing ? Edit : isViewing ? Layers : Plus;
  const headerColor = isEditing ? 'green' : 'blue';

  const inputCls = (disabled: boolean) =>
    `w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  const sectionHeader = 'text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200 flex items-center gap-1';

  const currentTerminals = fuelIsland?.terminals ?? [];

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
                {isViewing ? 'Ver Fuel Island' : isEditing ? 'Editar Fuel Island' : 'Nueva Fuel Island'}
              </h3>
              <p className="text-2xs text-text-muted">
                {fuelIsland ? `${fuelIsland.siteId} · ${fuelIsland.name}` : 'Completa el formulario'}
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
            <h4 className={sectionHeader}><Building2 className="w-3 h-3" /> Identidad</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Site ID *</label>
                {isCreating ? (
                  <select
                    value={form.siteId}
                    onChange={(e) => update('siteId', e.target.value)}
                    required
                    className={inputCls(false)}
                  >
                    <option value="">Selecciona un sitio</option>
                    {sites.map((s: any) => (
                      <option key={s.site_id ?? s.siteId} value={s.site_id ?? s.siteId}>
                        {(s.site_id ?? s.siteId)}{s.name ? ` · ${s.name}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={form.siteId} disabled className={inputCls(true)} />
                )}
              </div>
              <div>
                <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  disabled={isViewing}
                  required
                  maxLength={40}
                  className={inputCls(isViewing)}
                  placeholder="ISLETA-A"
                />
              </div>
            </div>
          </div>

          {/* Terminal asignado (read-only — se edita desde la pantalla de terminales) */}
          {!isCreating && (
            <div>
              <h4 className={sectionHeader}><Monitor className="w-3 h-3" /> Terminal asignado</h4>
              {currentTerminals.length === 0 ? (
                <p className="text-xs text-text-muted">Ningún terminal apunta a esta isleta.</p>
              ) : (
                <div className="space-y-1">
                  {currentTerminals.map((t) => (
                    <div
                      key={`${t.siteId}-${t.terminalId}`}
                      className="flex items-center gap-2 px-2 h-7 rounded-sm border bg-blue-50/50 border-blue-100 text-xs text-blue-900"
                    >
                      <Monitor className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span className="font-medium">#{t.terminalId}</span>
                      <span className="truncate flex-1">{t.name}</span>
                      <span className={`text-2xs ${t.active ? 'text-green-700' : 'text-text-muted'}`}>
                        {t.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-1 text-2xs text-text-muted flex items-start gap-1">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                Para asignar o cambiar el terminal de esta isleta, ir a <strong className="mx-0.5">Terminales</strong> y
                editar el campo <em>Fuel Island</em> del terminal correspondiente.
              </p>
            </div>
          )}

          {/* Dispensers (solo create) */}
          {isCreating && (
            <div>
              <h4 className={sectionHeader}>
                <Fuel className="w-3 h-3" /> Dispensers a vincular
                <span className="ml-auto font-normal normal-case tracking-normal text-text-muted">
                  {form.dispenserIds.length} seleccionado(s)
                </span>
              </h4>
              {!form.siteId ? (
                <p className="text-xs text-text-muted py-2">Selecciona un sitio para ver los dispensers disponibles.</p>
              ) : loadingUnassigned ? (
                <p className="text-xs text-text-muted py-2">
                  <RefreshCw className="w-3 h-3 animate-spin inline mr-1" /> Cargando dispensers...
                </p>
              ) : unassigned.length === 0 ? (
                <p className="text-xs text-text-muted py-2">No hay dispensers sin asignar en este sitio.</p>
              ) : (
                <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto border border-gray-200 rounded-sm p-2 bg-gray-50">
                  {unassigned.map((d) => {
                    const checked = form.dispenserIds.includes(d.dispenserId);
                    return (
                      <label
                        key={d.dispenserId}
                        className={`flex items-center gap-2 px-2 h-7 rounded-sm border cursor-pointer text-xs ${
                          checked
                            ? 'bg-orange-50 border-orange-300 text-orange-800'
                            : 'bg-white border-gray-200 text-text-secondary hover:bg-row-hover'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDispenser(d.dispenserId)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <Fuel className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        <span className="truncate">
                          #{d.pumpNumber}{d.name ? ` · ${d.name}` : ''}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Dispensers actuales (view/edit) */}
          {!isCreating && fuelIsland && (fuelIsland.dispensers?.length ?? 0) > 0 && (
            <div>
              <h4 className={sectionHeader}>
                <Fuel className="w-3 h-3" /> Dispensers actuales
                <span className="ml-auto font-normal normal-case tracking-normal text-text-muted">
                  {fuelIsland.dispensers!.length}
                </span>
              </h4>
              <div className="flex flex-wrap gap-1">
                {fuelIsland.dispensers!.map((d) => (
                  <span
                    key={d.dispenserId}
                    className="inline-flex items-center h-5 px-2 text-2xs rounded-sm border bg-orange-50 border-orange-200 text-orange-700 gap-1"
                  >
                    <Fuel className="w-2.5 h-2.5" />
                    #{d.pumpNumber}{d.name ? ` · ${d.name}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Estado */}
          {!isCreating && (
            <div>
              <label className="flex items-center justify-between px-2 h-7 bg-gray-50 border border-gray-200 rounded-sm cursor-pointer">
                <span className="text-xs text-text-primary">Activa</span>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => update('active', e.target.checked)}
                  disabled={isViewing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
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
              {loading
                ? (<><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</>)
                : (<><Save className="w-3 h-3" /> Guardar</>)}
            </CompactButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default FuelIslandModal;
