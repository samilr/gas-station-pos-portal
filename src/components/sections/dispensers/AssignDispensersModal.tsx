import React, { useEffect, useMemo, useState } from 'react';
import { Link2, Save, X, RefreshCw, Fuel, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { FuelIsland } from '../../../services/fuelIslandService';
import { Dispenser } from '../../../services/dispensersConfigService';
import {
  useGetUnassignedDispensersQuery,
  useAssignDispensersToIslandMutation,
} from '../../../store/api/fuelIslandsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fuelIsland: FuelIsland | null;
  allIslands: FuelIsland[];
  onSuccess: () => void;
}

interface DispenserOption {
  dispenser: Dispenser;
  currentIsland: FuelIsland | null;
}

const AssignDispensersModal: React.FC<Props> = ({ isOpen, onClose, fuelIsland, allIslands, onSuccess }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const [assignDispensers] = useAssignDispensersToIslandMutation();
  const { data: unassignedData, isFetching: loadingList } = useGetUnassignedDispensersQuery(
    fuelIsland?.siteId,
    { skip: !isOpen || !fuelIsland }
  );
  const unassigned: Dispenser[] = unassignedData ?? [];

  useEffect(() => {
    if (!isOpen || !fuelIsland) return;
    setSelectedIds([]);
  }, [isOpen, fuelIsland]);

  // Dispensers de otras isletas del mismo sitio (para poder moverlos)
  const otherIslandsDispensers: DispenserOption[] = useMemo(() => {
    if (!fuelIsland) return [];
    const res: DispenserOption[] = [];
    allIslands.forEach((isl) => {
      if (isl.fuelIslandId === fuelIsland.fuelIslandId) return;
      if (isl.siteId !== fuelIsland.siteId) return;
      (isl.dispensers ?? []).forEach((d) => {
        res.push({ dispenser: d, currentIsland: isl });
      });
    });
    return res;
  }, [allIslands, fuelIsland]);

  const unassignedOptions: DispenserOption[] = useMemo(
    () => unassigned.map((d) => ({ dispenser: d, currentIsland: null })),
    [unassigned],
  );

  const allOptions: DispenserOption[] = useMemo(
    () => [...unassignedOptions, ...otherIslandsDispensers],
    [unassignedOptions, otherIslandsDispensers],
  );

  const toggle = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    if (!fuelIsland || selectedIds.length === 0) {
      toast.error('Selecciona al menos un dispenser');
      return;
    }
    setSaving(true);
    try {
      await assignDispensers({ id: fuelIsland.fuelIslandId, dispenserIds: selectedIds }).unwrap();
      toast.success(`${selectedIds.length} dispenser(s) asignado(s) a ${fuelIsland.name}`, { duration: 4000 });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al asignar dispensers') ?? 'Error al asignar dispensers');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !fuelIsland) return null;

  const willMoveCount = selectedIds.filter((id) =>
    otherIslandsDispensers.some((o) => o.dispenser.dispenserId === id),
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm w-full max-w-2xl shadow-xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-100 rounded-sm flex items-center justify-center">
              <Link2 className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Asignar Dispensers</h3>
              <p className="text-2xs text-text-muted">
                {fuelIsland.siteId} · {fuelIsland.name}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingList && (
            <p className="text-xs text-text-muted py-2">
              <RefreshCw className="w-3 h-3 animate-spin inline mr-1" /> Cargando dispensers...
            </p>
          )}

          {!loadingList && allOptions.length === 0 && (
            <p className="text-xs text-text-muted py-4 text-center">
              <Fuel className="w-5 h-5 mx-auto mb-1 text-text-muted" />
              No hay dispensers disponibles en el sitio {fuelIsland.siteId}.
            </p>
          )}

          {!loadingList && unassignedOptions.length > 0 && (
            <div>
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200 flex items-center gap-1">
                <Fuel className="w-3 h-3" /> Sin asignar
                <span className="ml-auto font-normal normal-case tracking-normal text-text-muted">
                  {unassignedOptions.length}
                </span>
              </h4>
              <div className="grid grid-cols-2 gap-1">
                {unassignedOptions.map(({ dispenser: d }) => {
                  const checked = selectedIds.includes(d.dispenserId);
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
                        onChange={() => toggle(d.dispenserId)}
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
            </div>
          )}

          {!loadingList && otherIslandsDispensers.length > 0 && (
            <div>
              <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" /> En otras isletas
                <span className="ml-auto font-normal normal-case tracking-normal text-text-muted">
                  se moverán
                </span>
              </h4>
              <div className="grid grid-cols-1 gap-1">
                {otherIslandsDispensers.map(({ dispenser: d, currentIsland }) => {
                  const checked = selectedIds.includes(d.dispenserId);
                  return (
                    <label
                      key={d.dispenserId}
                      className={`flex items-center gap-2 px-2 h-7 rounded-sm border cursor-pointer text-xs ${
                        checked
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-white border-gray-200 text-text-secondary hover:bg-row-hover'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(d.dispenserId)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <Fuel className="w-3 h-3 text-orange-500 flex-shrink-0" />
                      <span className="truncate flex-1">
                        #{d.pumpNumber}{d.name ? ` · ${d.name}` : ''}
                      </span>
                      <span className="text-2xs text-amber-700 whitespace-nowrap">
                        actualmente en {currentIsland?.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {willMoveCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-2 text-2xs text-amber-800 flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>
                Se moverán <strong>{willMoveCount}</strong> dispenser(s) desde otras isletas. Las isletas de origen
                podrán quedar con menos dispensers.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <span className="text-2xs text-text-muted">
            {selectedIds.length} dispenser(s) seleccionado(s)
          </span>
          <div className="flex items-center gap-2">
            <CompactButton type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </CompactButton>
            <CompactButton
              type="button"
              variant="primary"
              onClick={handleSave}
              disabled={saving || selectedIds.length === 0}
            >
              {saving
                ? (<><RefreshCw className="w-3 h-3 animate-spin" /> Asignando...</>)
                : (<><Save className="w-3 h-3" /> Asignar</>)}
            </CompactButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignDispensersModal;
