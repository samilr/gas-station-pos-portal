import React, { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, Edit2, Trash2, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { shiftService } from '../../../services/shiftService';
import { IShift } from '../../../types/shift';
import { CompactButton } from '../../ui';
import Toolbar from '../../ui/Toolbar';
import ShiftModal from './ShiftModal';

const formatHour = (h: string | null): string => {
  if (!h || h.length < 4) return '—';
  return `${h.slice(0, 2)}:${h.slice(2, 4)}`;
};

const ShiftsSection: React.FC = () => {
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ show: boolean; shift: IShift | null }>({
    show: false,
    shift: null,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await shiftService.listShifts();
    setLoading(false);
    if (res.successful) {
      const arr = Array.isArray(res.data) ? res.data : [];
      setShifts([...arr].sort((a, b) => a.shiftNumber - b.shiftNumber));
    } else {
      toast.error(res.error || 'No se pudieron cargar los turnos');
      setShifts([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (shift: IShift) => {
    if (
      !confirm(
        `¿Eliminar el turno ${shift.shiftNumber} (${formatHour(shift.entryHour)} a ${formatHour(
          shift.departureHour
        )})?\n\nLa API no valida uso en tablas dependientes (period_staft, fuel_pump_shift, trans). Asegurate de que ningún registro lo referencie.`
      )
    )
      return;

    const res = await shiftService.deleteShift(shift.shiftNumber);
    if (res.successful) {
      toast.success('Turno eliminado');
      load();
    } else {
      toast.error(res.error || 'No se pudo eliminar el turno');
    }
  };

  const wrappingCount = shifts.filter((s) => s.wrapsMidnight).length;

  return (
    <div className="space-y-1">
      <Toolbar
        chips={[
          { label: 'Turnos', value: shifts.length, color: 'blue' },
          {
            label: 'Cruzan medianoche',
            value: wrappingCount,
            color: wrappingCount > 0 ? 'purple' : 'gray',
          },
        ]}
      >
        <CompactButton variant="primary" onClick={() => setModal({ show: true, shift: null })}>
          <Plus className="w-3.5 h-3.5" />
          Nuevo turno
        </CompactButton>
        <CompactButton variant="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </Toolbar>

      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-32 items-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  <th className="px-2 text-left text-xs font-medium text-gray-500">#</th>
                  <th className="px-2 text-left text-xs font-medium text-gray-500">Entrada</th>
                  <th className="px-2 text-left text-xs font-medium text-gray-500">Salida</th>
                  <th className="px-2 text-left text-xs font-medium text-gray-500">Tipo</th>
                  <th className="px-2 text-right text-xs font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr
                    key={s.shiftNumber}
                    className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover transition-colors"
                  >
                    <td className="px-2 text-sm whitespace-nowrap font-mono font-medium text-gray-900">
                      {s.shiftNumber}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap font-mono text-gray-700">
                      {formatHour(s.entryHour)}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap font-mono text-gray-700">
                      {formatHour(s.departureHour)}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      {s.wrapsMidnight ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium bg-purple-100 text-purple-700">
                          <Moon className="w-3 h-3" />
                          Cruza medianoche
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium bg-amber-50 text-amber-700">
                          <Sun className="w-3 h-3" />
                          Diurno
                        </span>
                      )}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModal({ show: true, shift: s })}
                          className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-2 py-6 text-center text-sm text-gray-400">
                      Sin turnos definidos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.show && (
        <ShiftModal
          shift={modal.shift}
          onClose={() => setModal({ show: false, shift: null })}
          onSaved={() => {
            setModal({ show: false, shift: null });
            load();
          }}
        />
      )}
    </div>
  );
};

export default ShiftsSection;
