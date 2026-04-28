import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  RefreshCw,
  Sliders,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton } from '../../ui';
import { SiteAutocomplete } from '../../ui/autocompletes';
import Toolbar from '../../ui/Toolbar';
import { useSelectedSiteId } from '../../../hooks/useSelectedSite';
import { useListDispensersConfigQuery } from '../../../store/api/dispensersConfigApi';
import {
  DEFAULT_PARAM_14_ADDRESS_CONST,
  bulkSetAuthorizeWithoutPreset,
  getAutomaticOperation,
  getParam14Address,
  setAuthorizeWithoutPreset,
  setAutomaticOperation,
  setParam14Address,
  setSiteRequiresAuthorization,
} from '../../../services/ptsConfigService';

// ============================================================
// Tipos internos
// ============================================================

type TriState = boolean | null | 'mixed';

interface PumpState {
  pumpNumber: number;
  port: number | null;
  address: number | null;
  autoAuthorize: boolean | null;            // 2.1
  autoCloseTransaction: boolean | null;     // 2.2
  authorizeWithoutPreset: boolean | null;   // 1.4
  lastResult?: 'ok' | 'fail';
  lastMessage?: string | null;
}

interface ParameterDefinition {
  id: string;                 // "1.4", "2.1", …
  label: string;
  description: string;
  /** Campo de `PumpState` que refleja el valor actual de este parámetro. */
  stateKey: keyof Pick<PumpState, 'autoAuthorize' | 'autoCloseTransaction' | 'authorizeWithoutPreset'>;
  /** true si el firmware no tiene getter y el valor visible es solo lo último aplicado desde la UI. */
  readOnlyAfterApply?: boolean;
}

interface ParameterSection {
  number: string;             // "1", "2", …
  title: string;
  parameters: ParameterDefinition[];
}

// ============================================================
// Registro de secciones / parámetros (extensible)
// ============================================================

const SECTIONS: ParameterSection[] = [
  {
    number: '1',
    title: 'AUTHORIZATION SETTINGS',
    parameters: [
      {
        id: '1.4',
        label: 'Authorize with no preset',
        description:
          'Permite autorizar la bomba sin preset de monto o volumen. El cajero podrá arrancar sin capturar un total primero.',
        stateKey: 'authorizeWithoutPreset',
        readOnlyAfterApply: true,
      },
    ],
  },
  {
    number: '2',
    title: 'PUMP OPERATION SETTINGS',
    parameters: [
      {
        id: '2.1',
        label: 'Automatically authorize pump on nozzle up',
        description:
          'El controller autoriza la bomba automáticamente al levantar la pistola. La autorización es a tanque lleno; el preset puede entrarse desde el teclado de la dispensadora.',
        stateKey: 'autoAuthorize',
      },
      {
        id: '2.2',
        label: 'Automatically close transaction',
        description:
          'Las transacciones cierran automáticamente al colgar la pistola — no requiere cerrar manualmente desde el POS.',
        stateKey: 'autoCloseTransaction',
      },
    ],
  },
];

// ============================================================
// Switch reusable
// ============================================================

interface SwitchProps {
  value: TriState;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  busy?: boolean;
  title?: string;
}

const Switch: React.FC<SwitchProps> = ({ value, onChange, disabled, busy, title }) => {
  const on = value === true;
  const mixed = value === 'mixed';
  const unknown = value == null;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      title={title}
      disabled={disabled || busy}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${on ? 'bg-teal-500' : mixed ? 'bg-amber-400' : unknown ? 'bg-gray-200' : 'bg-gray-300'}
      `}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
          ${on ? 'translate-x-4' : mixed ? 'translate-x-2' : 'translate-x-0.5'}
        `}
      />
      {busy && (
        <span className="absolute inset-0 flex items-center justify-center">
          <RefreshCw className="w-3 h-3 animate-spin text-white" />
        </span>
      )}
    </button>
  );
};

// ============================================================
// Componente principal
// ============================================================

const PtsConfigSection: React.FC = () => {
  const { setSubtitle } = useHeader();

  const [pumps, setPumps] = useState<PumpState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selección para operaciones bulk
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(true); // arranca con "todas" para que los toggles sean accionables

  // Inflight por parámetro
  const [paramBusy, setParamBusy] = useState<Record<string, boolean>>({});

  // Modo avanzado (override del address del 1.4)
  const [advancedMode, setAdvancedMode] = useState(false);
  const [param14Address, setParam14AddressLocal] = useState<number>(DEFAULT_PARAM_14_ADDRESS_CONST);

  // Site activo — manda tanto para descubrir bombas como para el toggle bulk
  const globalSiteId = useSelectedSiteId();
  const [siteForAuth, setSiteForAuth] = useState<string>('');
  const effectiveSiteId = siteForAuth || globalSiteId || '';

  // Catálogo BD de dispensadoras del site — fuente de verdad de las bombas
  // y de su `requiresAuthorization`. NO pega al PTS para descubrirlas.
  const {
    data: siteDispensers,
    refetch: refetchSiteDispensers,
    isFetching: siteDispensersFetching,
  } = useListDispensersConfigQuery(
    effectiveSiteId ? { siteId: effectiveSiteId } : undefined,
    { skip: !effectiveSiteId },
  );

  const activeSiteDispensers = useMemo(
    () => (siteDispensers ?? []).filter((d) => d.active),
    [siteDispensers],
  );
  const pumpCount = activeSiteDispensers.length;
  const activeDispenserCount = pumpCount;

  const [requireAuthBusy, setRequireAuthBusy] = useState(false);

  // Estado agregado del toggle: derivado de los dispensers activos del site.
  // El backend solo aplica el bulk a las activas, así que las inactivas no
  // pesan para decidir si está en pre-pago o post-pago.
  const requireAuthAggregate = useMemo<TriState>(() => {
    if (activeSiteDispensers.length === 0) return null;
    const allOn = activeSiteDispensers.every((d) => d.requiresAuthorization === true);
    const allOff = activeSiteDispensers.every((d) => d.requiresAuthorization === false);
    if (allOn) return true;
    if (allOff) return false;
    return 'mixed';
  }, [activeSiteDispensers]);

  useEffect(() => {
    setSubtitle('Parámetros del firmware PTS-2 (preset y arranque automático)');
    return () => setSubtitle('');
  }, [setSubtitle]);

  useEffect(() => {
    setParam14AddressLocal(getParam14Address());
  }, []);

  // --------------- Carga inicial ---------------
  // Las bombas vienen del catálogo BD (RTK Query las recarga sola al cambiar
  // el siteId). Cuando llega data nueva del catálogo, este effect consulta el
  // estado actual del 2.1/2.2 por bomba al PTS — esos endpoints
  // (`dispensers/{pump}/automatic-operation`) están cacheados read-through TTL 60s.
  //
  // Identidad estable de `activeSiteDispensers`: como viene de un `useMemo`
  // con `siteDispensers` (estable mientras RTK Query no traiga data nueva),
  // este effect solo se dispara al cambiar el site o tras refetch manual.

  useEffect(() => {
    if (activeSiteDispensers.length === 0) {
      setPumps([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all(
      activeSiteDispensers.map((d) => getAutomaticOperation(d.pumpNumber).catch(() => null)),
    )
      .then((statuses) => {
        if (cancelled) return;
        const nextPumps: PumpState[] = activeSiteDispensers.map((d, i) => {
          const s = statuses[i];
          return {
            pumpNumber: d.pumpNumber,
            port: d.ptsPort,
            address: d.busAddress,
            autoAuthorize: s?.autoAuthorize ?? null,
            autoCloseTransaction:
              s?.autoCloseTransaction == null ? (s?.autoAuthorize ?? null) : s.autoCloseTransaction,
            // El PTS no expone un getter directo del 1.4; queda null hasta que se aplique.
            authorizeWithoutPreset: null,
          };
        });
        setPumps(nextPumps);
        setLoading(false);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message || 'Error al consultar estado del PTS');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSiteDispensers]);

  // Botón "Actualizar" — refetch del catálogo. El effect de arriba se
  // re-dispara con la data nueva y reconsulta el PTS.
  const refresh = useCallback(() => {
    if (effectiveSiteId) refetchSiteDispensers();
  }, [effectiveSiteId, refetchSiteDispensers]);

  // --------------- Selección ---------------

  const toggleSelected = (pumpNumber: number) => {
    setSelectAll(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pumpNumber)) next.delete(pumpNumber);
      else next.add(pumpNumber);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectAll(false);
      setSelected(new Set());
    } else {
      setSelectAll(true);
      setSelected(new Set());
    }
  };

  const effectiveSelection = useMemo<number[]>(() => {
    if (selectAll) return pumps.map((p) => p.pumpNumber);
    return Array.from(selected).sort((a, b) => a - b);
  }, [pumps, selected, selectAll]);

  // --------------- Valor agregado por parámetro (para el switch de la sección) ---------------

  const aggregateValue = (param: ParameterDefinition): TriState => {
    const values = effectiveSelection
      .map((n) => pumps.find((p) => p.pumpNumber === n)?.[param.stateKey])
      .filter((v) => v !== undefined) as (boolean | null)[];
    if (values.length === 0) return null;
    const knownValues = values.filter((v) => v !== null) as boolean[];
    if (knownValues.length === 0) return null;
    const allOn = knownValues.every((v) => v === true);
    const allOff = knownValues.every((v) => v === false);
    if (allOn) return true;
    if (allOff) return false;
    return 'mixed';
  };

  const enabledCount = (param: ParameterDefinition): string => {
    const total = effectiveSelection.length;
    if (total === 0) return '0/0';
    const on = effectiveSelection.reduce((acc, n) => {
      const v = pumps.find((p) => p.pumpNumber === n)?.[param.stateKey];
      return v === true ? acc + 1 : acc;
    }, 0);
    return `${on}/${total}`;
  };

  // --------------- Aplicar cambios ---------------

  const updatePumpStates = (
    pumpNumbers: number[],
    patch: Partial<Pick<PumpState, 'autoAuthorize' | 'autoCloseTransaction' | 'authorizeWithoutPreset'>>,
    results?: Map<number, { ok: boolean; message: string | null }>
  ) => {
    setPumps((prev) =>
      prev.map((p) => {
        if (!pumpNumbers.includes(p.pumpNumber)) return p;
        const r = results?.get(p.pumpNumber);
        return {
          ...p,
          ...(r?.ok === false ? {} : patch),
          ...(r && { lastResult: r.ok ? 'ok' : 'fail', lastMessage: r.message }),
        };
      })
    );
  };

  const summarize = (label: string, okCount: number, total: number) => {
    if (okCount === total) toast.success(`${label}: ${okCount}/${total} bombas actualizadas`);
    else toast.error(`${label}: ${okCount} ok, ${total - okCount} fallidas. Revisa la tabla.`);
  };

  // 2.1 y 2.2 → per-pump (preserva el valor del otro param)
  const applyAutomaticOperationParam = async (
    param: '2.1' | '2.2',
    newValue: boolean,
    targets: number[]
  ) => {
    const results = new Map<number, { ok: boolean; message: string | null }>();
    await Promise.all(
      targets.map(async (n) => {
        const current = pumps.find((p) => p.pumpNumber === n);
        if (!current) return;
        const state = param === '2.1' ? newValue : (current.autoAuthorize ?? false);
        const autoClose = param === '2.2' ? newValue : (current.autoCloseTransaction ?? state);
        try {
          await setAutomaticOperation(n, state, autoClose);
          results.set(n, { ok: true, message: null });
        } catch (err: any) {
          results.set(n, { ok: false, message: err?.message || 'Error' });
        }
      })
    );
    const patch = param === '2.1' ? { autoAuthorize: newValue } : { autoCloseTransaction: newValue };
    updatePumpStates(targets, patch, results);
    const okCount = Array.from(results.values()).filter((r) => r.ok).length;
    summarize(`Parámetro ${param}`, okCount, targets.length);
  };

  // 1.4 → endpoint bulk (sin dependencias cruzadas)
  const applyAuthorizeWithoutPreset = async (newValue: boolean, targets: number[]) => {
    try {
      const { results } = await bulkSetAuthorizeWithoutPreset(
        targets.length === pumpCount ? null : targets,
        newValue,
        param14Address,
        pumpCount
      );
      const byPump = new Map(results.map((r) => [r.pumpNumber, { ok: r.ok, message: r.message }]));
      updatePumpStates(targets, { authorizeWithoutPreset: newValue }, byPump);
      const okCount = results.filter((r) => r.ok).length;
      summarize('Parámetro 1.4', okCount, results.length);
    } catch (err: any) {
      toast.error(err?.message || 'Error al aplicar 1.4');
    }
  };

  // Individual fallback — si se quisiera aplicar 1.4 por bomba:
  const applyAuthorizeWithoutPresetIndividual = async (newValue: boolean, targets: number[]) => {
    const results = new Map<number, { ok: boolean; message: string | null }>();
    await Promise.all(
      targets.map(async (n) => {
        try {
          await setAuthorizeWithoutPreset(n, newValue, param14Address);
          results.set(n, { ok: true, message: null });
        } catch (err: any) {
          results.set(n, { ok: false, message: err?.message || 'Error' });
        }
      })
    );
    updatePumpStates(targets, { authorizeWithoutPreset: newValue }, results);
    const okCount = Array.from(results.values()).filter((r) => r.ok).length;
    summarize('Parámetro 1.4 (individual)', okCount, targets.length);
  };

  const handleToggleRequireAuthorization = async (next: boolean) => {
    if (!effectiveSiteId) {
      toast.error('Selecciona una sucursal primero');
      return;
    }
    if (activeDispenserCount === 0) {
      toast.error('La sucursal no tiene dispensadoras activas');
      return;
    }
    setRequireAuthBusy(true);
    try {
      const res = await setSiteRequiresAuthorization(effectiveSiteId, next);
      toast.success(
        `Modo ${next ? 'pre-pago' : 'post-pago'} aplicado · PTS: ${res.affectedPumps.length} bombas · BD: ${res.dispensersUpdated} dispensadoras`,
      );
      // Refetch para que el agregado refleje el cambio inmediatamente.
      await refetchSiteDispensers();
    } catch (err: any) {
      toast.error(err?.message || 'Error al cambiar el modo de cobro');
    } finally {
      setRequireAuthBusy(false);
    }
  };

  const handleToggleParameter = async (param: ParameterDefinition, newValue: boolean) => {
    if (effectiveSelection.length === 0) {
      toast.error('Selecciona al menos una bomba');
      return;
    }
    setParamBusy((m) => ({ ...m, [param.id]: true }));
    try {
      if (param.id === '2.1' || param.id === '2.2') {
        await applyAutomaticOperationParam(param.id, newValue, effectiveSelection);
      } else if (param.id === '1.4') {
        // Si hay menos del total, igual podemos usar bulk con pumps = effectiveSelection
        if (effectiveSelection.length > 1) {
          await applyAuthorizeWithoutPreset(newValue, effectiveSelection);
        } else {
          await applyAuthorizeWithoutPresetIndividual(newValue, effectiveSelection);
        }
      }
    } finally {
      setParamBusy((m) => ({ ...m, [param.id]: false }));
    }
  };

  // --------------- Modo avanzado ---------------

  const handleParam14AddressChange = (v: string) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return;
    setParam14AddressLocal(n);
    setParam14Address(n);
  };

  const resetParam14Address = () => {
    setParam14Address(null);
    setParam14AddressLocal(DEFAULT_PARAM_14_ADDRESS_CONST);
    toast.success(`Address restaurado a ${DEFAULT_PARAM_14_ADDRESS_CONST}`);
  };

  // --------------- Render helpers ---------------

  const renderTriCell = (v: boolean | null) => {
    if (v === null) return <span className="text-text-muted">—</span>;
    return v ? (
      <span className="inline-flex items-center gap-1 text-teal-700">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
        ON
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        OFF
      </span>
    );
  };

  const totals = {
    pumps: pumps.length,
    selected: effectiveSelection.length,
  };

  // --------------- Render ---------------

  return (
    <div className="space-y-3">
      <Toolbar
        chips={[
          { label: 'Bombas', value: totals.pumps, color: 'blue' },
          { label: 'Seleccionadas', value: totals.selected, color: 'purple' },
        ]}
      >
        <CompactButton
          variant="ghost"
          onClick={() => setAdvancedMode((v) => !v)}
          title="Mostrar/ocultar opciones avanzadas"
        >
          <Sliders className="w-3 h-3" />
          Modo avanzado
          {advancedMode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </CompactButton>
        <CompactButton variant="ghost" onClick={refresh} disabled={loading}>
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
      </Toolbar>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {advancedMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 text-xs flex flex-wrap items-center gap-2">
          <Sliders className="w-3 h-3 text-amber-700" />
          <span className="font-medium text-amber-900">Address del parámetro 1.4:</span>
          <input
            type="number"
            min={1}
            max={255}
            value={param14Address}
            onChange={(e) => handleParam14AddressChange(e.target.value)}
            className="h-7 w-20 px-2 border border-amber-300 rounded-sm text-sm"
          />
          <span className="text-text-muted">
            (default {DEFAULT_PARAM_14_ADDRESS_CONST}; se persiste en este navegador)
          </span>
          {param14Address !== DEFAULT_PARAM_14_ADDRESS_CONST && (
            <CompactButton variant="ghost" onClick={resetParam14Address}>
              Restaurar
            </CompactButton>
          )}
        </div>
      )}

      {/* ============== Modo de cobro del site (toggle bulk pre-pago) ============== */}
      <div className="bg-white rounded-sm border border-table-border overflow-hidden">
        <div className="h-9 px-3 flex items-center gap-2 bg-teal-50/60 border-b border-teal-200">
          <CreditCard className="w-3.5 h-3.5 text-teal-700" />
          <span className="text-sm font-semibold text-teal-900">Modo de cobro del site</span>
        </div>
        <div className="px-3 py-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-text-muted">Sucursal:</label>
            <div className="w-64">
              <SiteAutocomplete
                value={effectiveSiteId}
                onChange={(v) => setSiteForAuth(v ?? '')}
                placeholder="Selecciona una sucursal"
                allowClear
              />
            </div>
            {effectiveSiteId && (
              <span className="text-xs text-text-muted">
                {siteDispensersFetching
                  ? 'Cargando dispensadoras…'
                  : `${activeDispenserCount} dispensadora(s) activa(s)`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-4 pt-2 border-t border-gray-100">
            <div>
              <div className="font-semibold text-sm text-text-primary">
                Modo de cobro de las bombas
              </div>
              <div className="text-xs text-text-muted leading-snug mt-0.5">
                Aplica a TODAS las bombas activas del site. Ejecuta primero el bulk al PTS
                Controller (param 1.4) y luego actualiza la BD — si el PTS rechaza, la BD no se toca.
                POS Android usa este flag para ramificar entre flujo de pre-autorización
                Hotel/RentCar y la venta tradicional post-pago.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={
                  requireAuthAggregate === true
                    ? 'pre'
                    : requireAuthAggregate === false
                      ? 'post'
                      : requireAuthAggregate === 'mixed'
                        ? 'mixed'
                        : ''
                }
                disabled={!effectiveSiteId || activeDispenserCount === 0 || requireAuthBusy}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'pre' || v === 'post') {
                    handleToggleRequireAuthorization(v === 'pre');
                  }
                }}
                title={
                  !effectiveSiteId
                    ? 'Selecciona una sucursal'
                    : activeDispenserCount === 0
                      ? 'La sucursal no tiene dispensadoras activas'
                      : requireAuthAggregate === 'mixed'
                        ? 'Bombas con valores mezclados — selecciona un modo para uniformar'
                        : undefined
                }
                className={`h-8 px-2 text-sm border rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  requireAuthAggregate === true
                    ? 'border-teal-300 bg-teal-50 text-teal-900 font-medium'
                    : requireAuthAggregate === false
                      ? 'border-gray-300 bg-white text-text-primary'
                      : 'border-amber-300 bg-amber-50 text-amber-900'
                } ${(!effectiveSiteId || activeDispenserCount === 0 || requireAuthBusy) ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {requireAuthAggregate === null && (
                  <option value="" disabled>—</option>
                )}
                {requireAuthAggregate === 'mixed' && (
                  <option value="mixed" disabled>— Mixto —</option>
                )}
                <option value="post">Post-pago</option>
                <option value="pre">Pre-pago (CheckIn/CheckOut)</option>
              </select>
              {requireAuthBusy && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-text-muted" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============== TOP: Tabla de bombas (selección + estado actual) ============== */}
      <div className="bg-white rounded-sm border border-table-border overflow-hidden">
        <div className="h-8 px-3 flex items-center justify-between bg-table-header border-b border-table-border">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Bombas</span>
          <span className="text-xs text-text-muted">
            {effectiveSelection.length === 0
              ? 'Selecciona al menos una bomba para poder cambiar parámetros'
              : selectAll
                ? `Se aplicará a las ${pumpCount} bombas`
                : `Se aplicará a: ${effectiveSelection.join(', ')}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide border-b border-table-border">
                <th className="w-10 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    title="Seleccionar todas"
                  />
                </th>
                <th className="text-left px-2 font-medium text-gray-500 w-20"># Bomba</th>
                <th className="text-left px-2 font-medium text-gray-500 w-16">Port</th>
                <th className="text-left px-2 font-medium text-gray-500 w-20">Address</th>
                <th className="text-center px-2 font-medium text-gray-500">2.1 Auto-auth</th>
                <th className="text-center px-2 font-medium text-gray-500">2.2 Auto-close</th>
                <th className="text-center px-2 font-medium text-gray-500">1.4 Sin preset</th>
                <th className="text-center px-2 font-medium text-gray-500">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-2 py-6 text-center text-text-muted text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-1" />
                    Cargando bombas y consultando estado actual al PTS...
                  </td>
                </tr>
              )}
              {!loading && pumps.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-2 py-6 text-center text-text-muted text-xs">
                    {!effectiveSiteId
                      ? 'Selecciona una sucursal para ver sus bombas.'
                      : 'No hay dispensadoras activas en esta sucursal.'}
                  </td>
                </tr>
              )}
              {!loading &&
                pumps.map((p) => {
                  const isSelected = selectAll || selected.has(p.pumpNumber);
                  return (
                    <tr
                      key={p.pumpNumber}
                      className={`h-8 border-b border-table-border ${isSelected ? 'bg-blue-50/40' : 'hover:bg-row-hover'}`}
                    >
                      <td className="px-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelected(p.pumpNumber)}
                          disabled={selectAll}
                        />
                      </td>
                      <td className="px-2 text-sm font-medium">#{p.pumpNumber}</td>
                      <td className="px-2 text-xs font-mono text-text-secondary">
                        {p.port ?? <span className="text-text-muted">—</span>}
                      </td>
                      <td className="px-2 text-xs font-mono text-text-secondary">
                        {p.address ?? <span className="text-text-muted">—</span>}
                      </td>
                      <td className="px-2 text-center text-xs">{renderTriCell(p.autoAuthorize)}</td>
                      <td className="px-2 text-center text-xs">
                        {renderTriCell(p.autoCloseTransaction)}
                      </td>
                      <td className="px-2 text-center text-xs">
                        {renderTriCell(p.authorizeWithoutPreset)}
                      </td>
                      <td className="px-2 text-center text-xs">
                        {p.lastResult === 'ok' && (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            OK
                          </span>
                        )}
                        {p.lastResult === 'fail' && (
                          <span
                            className="inline-flex items-center gap-1 text-red-600"
                            title={p.lastMessage || ''}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Falló
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============== BOTTOM: Tabla de parámetros agrupados por sección ============== */}
      {SECTIONS.map((section) => (
        <div
          key={section.number}
          className="bg-white rounded-sm border border-table-border overflow-hidden"
        >
          <div className="h-9 px-3 flex items-center bg-teal-50/60 border-b border-teal-200">
            <span className="text-sm font-semibold text-teal-900">
              {section.number}. {section.title}
            </span>
          </div>
          <div>
            {section.parameters.map((param, idx) => {
              const agg = aggregateValue(param);
              const busy = !!paramBusy[param.id];
              const hasSelection = effectiveSelection.length > 0;
              return (
                <div
                  key={param.id}
                  className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-3 py-2 ${idx > 0 ? 'border-t border-table-border' : ''}`}
                >
                  <div>
                    <div className="font-semibold text-sm text-text-primary">
                      {param.id}. {param.label}
                    </div>
                    <div className="text-xs text-text-muted leading-snug mt-0.5">
                      {param.description}
                      {param.readOnlyAfterApply && (
                        <span className="ml-1 italic">
                          (el firmware no expone el valor actual — la columna refleja lo último aplicado desde esta UI)
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="text-xs font-mono text-text-muted w-12 text-right"
                    title="Bombas con parámetro activado / seleccionadas"
                  >
                    {enabledCount(param)}
                  </div>
                  <div>
                    <Switch
                      value={agg}
                      busy={busy}
                      disabled={!hasSelection || loading}
                      onChange={(next) => handleToggleParameter(param, next)}
                      title={
                        !hasSelection
                          ? 'Selecciona al menos una bomba'
                          : agg === 'mixed'
                            ? 'Valores mezclados entre las bombas seleccionadas — click para uniformar'
                            : undefined
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PtsConfigSection;
