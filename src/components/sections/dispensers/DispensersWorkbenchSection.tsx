import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus, RefreshCw, Edit, Trash2, Fuel, Layers, Monitor, Droplet,
  Network, Cable, Link2, AlertCircle, Container, ChevronRight, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import useFuelIslands from '../../../hooks/useFuelIslands';
import useDispensersConfig from '../../../hooks/useDispensersConfig';
import fuelIslandService, { FuelIsland } from '../../../services/fuelIslandService';
import dispensersConfigService, { Dispenser } from '../../../services/dispensersConfigService';
import nozzleService, { Nozzle } from '../../../services/nozzleService';
import { SiteAutocomplete } from '../../ui/autocompletes';
import FuelIslandModal from './FuelIslandModal';
import DeleteFuelIslandDialog from './DeleteFuelIslandDialog';
import AssignDispensersModal from './AssignDispensersModal';
import DispenserConfigModal from './DispenserConfigModal';
import DeleteDispenserConfigDialog from './DeleteDispenserConfigDialog';
import NozzleFormModal from './NozzleFormModal';
import { DispenserIllustration, FuelGradePanel } from './illustrations';

// Ilustración SVG de una bomba/isleta con animaciones sutiles
const FuelPumpIllustration: React.FC<{ active: boolean; pumpCount: number; highlighted: boolean }> = ({
  active, pumpCount, highlighted,
}) => {
  const canopyFill = highlighted ? '#ea580c' : '#fb923c';
  const bodyFill = '#ffffff';
  const bodyStroke = highlighted ? '#c2410c' : '#9ca3af';
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Techo / canopy */}
      <rect x="4" y="4" width="56" height="5" rx="1" fill={canopyFill} />
      <rect x="8" y="9" width="3" height="4" fill="#6b7280" />
      <rect x="53" y="9" width="3" height="4" fill="#6b7280" />

      {/* Cuerpo de la bomba */}
      <rect x="18" y="14" width="28" height="38" rx="1.5" fill={bodyFill} stroke={bodyStroke} strokeWidth="0.8" />

      {/* Display "digital" */}
      <rect x="21" y="17" width="22" height="11" rx="0.5" fill="#0f172a" />
      <text x="32" y="22.5" fill="#22d3ee" fontSize="3.5" fontFamily="ui-monospace, monospace" fontWeight="bold" textAnchor="middle">
        {String(pumpCount).padStart(2, '0')}
      </text>
      <text x="32" y="26.5" fill="#64748b" fontSize="2.5" fontFamily="ui-monospace, monospace" textAnchor="middle">
        PUMPS
      </text>

      {/* Mangueras colgantes (hasta 4, color-coded) */}
      {pumpCount > 0 && (
        <>
          {/* Manguera izquierda (verde/regular) */}
          <path d="M 21 32 Q 17 34 17 40 L 17 48" stroke="#111827" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <rect x="15" y="47" width="4" height="5" rx="0.5" fill="#16a34a" />
        </>
      )}
      {pumpCount > 1 && (
        <>
          {/* Manguera centro-izq (rojo/premium) */}
          <path d="M 27 32 Q 25 34 25 40 L 25 47" stroke="#111827" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <rect x="23" y="46" width="4" height="5" rx="0.5" fill="#dc2626" />
        </>
      )}
      {pumpCount > 2 && (
        <>
          {/* Manguera centro-der (ámbar/diesel) */}
          <path d="M 37 32 Q 39 34 39 40 L 39 47" stroke="#111827" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <rect x="37" y="46" width="4" height="5" rx="0.5" fill="#f59e0b" />
        </>
      )}
      {pumpCount > 3 && (
        <>
          {/* Manguera derecha (azul/glp) */}
          <path d="M 43 32 Q 47 34 47 40 L 47 48" stroke="#111827" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <rect x="45" y="47" width="4" height="5" rx="0.5" fill="#3b82f6" />
        </>
      )}

      {/* LED status — pulsante cuando está activa */}
      <circle cx="32" cy="36" r="1.6" fill={active ? '#22c55e' : '#9ca3af'}>
        {active && (
          <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Base / piso */}
      <rect x="14" y="52" width="36" height="4" rx="0.5" fill="#6b7280" />
      <rect x="10" y="56" width="44" height="4" rx="0.5" fill="#d1d5db" opacity="0.6" />
    </svg>
  );
};


const DispensersWorkbenchSection: React.FC = () => {
  const { setSubtitle } = useHeader();
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  const { fuelIslands, loading: loadingIslands, error: errIslands, refresh: refreshIslands, setFilters } =
    useFuelIslands();
  const { dispensers: allDispensers, refresh: refreshDispensers } = useDispensersConfig();

  // Selecciones entre columnas
  const [selectedIslandId, setSelectedIslandId] = useState<number | null>(null);
  const [selectedDispenserId, setSelectedDispenserId] = useState<number | null>(null);

  // Búsquedas por columna
  const [islandQuery, setIslandQuery] = useState('');
  const [dispenserQuery, setDispenserQuery] = useState('');
  const [nozzleQuery, setNozzleQuery] = useState('');

  // Nozzles de la bomba seleccionada
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loadingNozzles, setLoadingNozzles] = useState(false);
  const [nozzleError, setNozzleError] = useState<string | null>(null);

  // Modales
  const [islandModalOpen, setIslandModalOpen] = useState(false);
  const [islandMode, setIslandMode] = useState<'create' | 'edit' | 'view'>('create');
  const [islandForModal, setIslandForModal] = useState<FuelIsland | null>(null);

  const [deleteIslandOpen, setDeleteIslandOpen] = useState(false);
  const [islandToDelete, setIslandToDelete] = useState<FuelIsland | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignIsland, setAssignIsland] = useState<FuelIsland | null>(null);

  const [dispModalOpen, setDispModalOpen] = useState(false);
  const [dispMode, setDispMode] = useState<'create' | 'edit' | 'view'>('create');
  const [dispForModal, setDispForModal] = useState<Dispenser | null>(null);

  const [deleteDispOpen, setDeleteDispOpen] = useState(false);
  const [dispToDelete, setDispToDelete] = useState<Dispenser | null>(null);

  const [nozzleFormOpen, setNozzleFormOpen] = useState(false);
  const [nozzleFormMode, setNozzleFormMode] = useState<'create' | 'edit'>('create');
  const [nozzleForModal, setNozzleForModal] = useState<Nozzle | null>(null);

  const [confirmDeleteNozzle, setConfirmDeleteNozzle] = useState<Nozzle | null>(null);
  const [deletingNozzle, setDeletingNozzle] = useState(false);

  useEffect(() => {
    setSubtitle('Workbench · Opción B');
    return () => setSubtitle('');
  }, [setSubtitle]);

  useEffect(() => {
    setFilters({ siteId: selectedSite ?? undefined });
    setSelectedIslandId(null);
    setSelectedDispenserId(null);
  }, [selectedSite, setFilters]);

  const siteIslands = useMemo(
    () => {
      const q = islandQuery.toLowerCase().trim();
      const bySite = selectedSite
        ? fuelIslands.filter((i) => i.siteId === selectedSite)
        : fuelIslands;
      if (!q) return bySite;
      return bySite.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.siteId.toLowerCase().includes(q) ||
        (i.terminals ?? []).some((t) => t.name.toLowerCase().includes(q) || String(t.terminalId).includes(q)),
      );
    },
    [fuelIslands, selectedSite, islandQuery],
  );

  const selectedIsland = useMemo(
    () => siteIslands.find((i) => i.fuelIslandId === selectedIslandId) ?? null,
    [siteIslands, selectedIslandId],
  );

  // Dispensers: los de la isleta seleccionada. Si no hay isleta seleccionada pero hay site, muestra todos los del site.
  const siteDispensers = useMemo(() => {
    if (!selectedSite) return [];
    if (selectedIsland) return selectedIsland.dispensers ?? [];
    return allDispensers.filter((d) => d.siteId === selectedSite);
  }, [allDispensers, selectedIsland, selectedSite]);

  const filteredDispensers = useMemo(() => {
    const q = dispenserQuery.toLowerCase().trim();
    if (!q) return siteDispensers;
    return siteDispensers.filter((d) =>
      String(d.pumpNumber).includes(q) ||
      (d.name?.toLowerCase().includes(q) ?? false) ||
      (d.brand?.toLowerCase().includes(q) ?? false) ||
      (d.ipAddress?.toLowerCase().includes(q) ?? false),
    );
  }, [siteDispensers, dispenserQuery]);

  const selectedDispenser = useMemo(
    () => filteredDispensers.find((d) => d.dispenserId === selectedDispenserId) ?? null,
    [filteredDispensers, selectedDispenserId],
  );

  // Cargar nozzles cuando cambia el dispenser seleccionado
  useEffect(() => {
    if (selectedDispenserId == null) {
      setNozzles([]);
      return;
    }
    let cancelled = false;
    setLoadingNozzles(true);
    setNozzleError(null);
    nozzleService.list({ dispenserId: selectedDispenserId })
      .then((res) => {
        if (cancelled) return;
        if (res.successful) setNozzles(res.data);
        else setNozzleError(res.error || 'Error al cargar mangueras');
      })
      .catch((err) => {
        if (!cancelled) setNozzleError(err instanceof Error ? err.message : 'Error de conexión');
      })
      .finally(() => { if (!cancelled) setLoadingNozzles(false); });
    return () => { cancelled = true; };
  }, [selectedDispenserId]);

  const filteredNozzles = useMemo(() => {
    const q = nozzleQuery.toLowerCase().trim();
    if (!q) return nozzles;
    return nozzles.filter((n) =>
      String(n.nozzleNumber).includes(q) ||
      (n.productName?.toLowerCase().includes(q) ?? false) ||
      n.productId.toLowerCase().includes(q),
    );
  }, [nozzles, nozzleQuery]);

  // Unassigned
  const unassignedForSite = useMemo(() => {
    if (!selectedSite) return [];
    const assignedIds = new Set<number>();
    fuelIslands.forEach((i) => {
      if (i.siteId === selectedSite) i.dispensers?.forEach((d) => assignedIds.add(d.dispenserId));
    });
    return allDispensers.filter((d) => d.siteId === selectedSite && !assignedIds.has(d.dispenserId));
  }, [allDispensers, fuelIslands, selectedSite]);

  // --- Totales ---
  const summary = useMemo(() => ({
    islands: siteIslands.length,
    dispensers: selectedSite
      ? allDispensers.filter((d) => d.siteId === selectedSite).length
      : 0,
    unassigned: unassignedForSite.length,
  }), [siteIslands, allDispensers, selectedSite, unassignedForSite]);

  const refreshAll = () => {
    refreshIslands();
    refreshDispensers();
    if (selectedDispenserId != null) {
      // force re-fetch nozzles
      setSelectedDispenserId((id) => id);
      const id = selectedDispenserId;
      nozzleService.list({ dispenserId: id }).then((res) => {
        if (res.successful) setNozzles(res.data);
      });
    }
  };

  // --- Acciones ---
  const openCreateIsland = () => { setIslandForModal(null); setIslandMode('create'); setIslandModalOpen(true); };
  const openEditIsland = (i: FuelIsland) => { setIslandForModal(i); setIslandMode('edit'); setIslandModalOpen(true); };
  const openDeleteIsland = (i: FuelIsland) => { setIslandToDelete(i); setDeleteIslandOpen(true); };
  const openAssignDispensers = (i: FuelIsland) => { setAssignIsland(i); setAssignOpen(true); };

  const openCreateDispenser = () => { setDispForModal(null); setDispMode('create'); setDispModalOpen(true); };
  const openEditDispenser = (d: Dispenser) => { setDispForModal(d); setDispMode('edit'); setDispModalOpen(true); };
  const openDeleteDispenser = (d: Dispenser) => { setDispToDelete(d); setDeleteDispOpen(true); };

  const toggleDispenserActive = async (d: Dispenser) => {
    try {
      const res = await dispensersConfigService.update(d.dispenserId, { active: !d.active });
      if (res.successful) {
        toast.success(`Bomba ${d.active ? 'desactivada' : 'activada'}`);
        refreshAll();
      } else toast.error(res.error || 'Error al cambiar estado');
    } catch { toast.error('Error de conexión'); }
  };

  const unassignDispenser = async (island: FuelIsland, d: Dispenser) => {
    const label = d.name || `Bomba #${d.pumpNumber}`;
    if (!window.confirm(`¿Remover ${label} de ${island.name}?`)) return;
    try {
      const res = await fuelIslandService.unassignDispenser(island.fuelIslandId, d.dispenserId);
      if (res.successful) {
        toast.success(`${label} removido de ${island.name}`);
        refreshAll();
      } else toast.error(res.error || 'Error al remover');
    } catch { toast.error('Error de conexión'); }
  };

  const openCreateNozzle = () => {
    if (!selectedDispenser) return;
    setNozzleForModal(null);
    setNozzleFormMode('create');
    setNozzleFormOpen(true);
  };
  const openEditNozzle = (n: Nozzle) => {
    setNozzleForModal(n);
    setNozzleFormMode('edit');
    setNozzleFormOpen(true);
  };

  const toggleNozzleActive = async (n: Nozzle) => {
    try {
      const res = await nozzleService.update(n.nozzleId, { active: !n.active });
      if (res.successful) {
        toast.success(`Manguera ${n.active ? 'desactivada' : 'activada'}`);
        if (selectedDispenserId != null) {
          const fresh = await nozzleService.list({ dispenserId: selectedDispenserId });
          if (fresh.successful) setNozzles(fresh.data);
        }
      } else toast.error(res.error || 'Error al cambiar estado');
    } catch { toast.error('Error de conexión'); }
  };

  const handleDeleteNozzle = async () => {
    if (!confirmDeleteNozzle) return;
    setDeletingNozzle(true);
    try {
      const res = await nozzleService.remove(confirmDeleteNozzle.nozzleId);
      if (res.successful) {
        toast.success(`Manguera #${confirmDeleteNozzle.nozzleNumber} eliminada`);
        setConfirmDeleteNozzle(null);
        if (selectedDispenserId != null) {
          const fresh = await nozzleService.list({ dispenserId: selectedDispenserId });
          if (fresh.successful) setNozzles(fresh.data);
        }
      } else toast.error(res.error || 'Error al eliminar');
    } catch { toast.error('Error de conexión'); }
    finally { setDeletingNozzle(false); }
  };

  const refreshNozzles = async () => {
    if (selectedDispenserId == null) return;
    const fresh = await nozzleService.list({ dispenserId: selectedDispenserId });
    if (fresh.successful) setNozzles(fresh.data);
  };

  // --- Sub-render helpers ---

  const ColumnHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    count?: number;
    onCreate?: () => void;
    createDisabled?: boolean;
    createLabel?: string;
  }> = ({ icon, title, subtitle, count, onCreate, createDisabled, createLabel = 'Nuevo' }) => (
    <div className="px-2.5 py-2 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {icon}
        <div className="min-w-0">
          <div className="text-xs font-bold text-text-primary flex items-center gap-1">
            {title}
            {count != null && <span className="text-2xs font-normal text-text-muted">({count})</span>}
          </div>
          {subtitle && <div className="text-2xs text-text-muted truncate">{subtitle}</div>}
        </div>
      </div>
      {onCreate && (
        <CompactButton variant="primary" onClick={onCreate} disabled={createDisabled}>
          <Plus className="w-3 h-3" /> {createLabel}
        </CompactButton>
      )}
    </div>
  );

  const SearchBox: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string }> = ({
    value, onChange, placeholder,
  }) => (
    <div className="px-2 py-1.5 border-b border-gray-100 bg-white">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-6 pl-7 pr-2 text-xs border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const connectionLabel = (d: Dispenser) => {
    if (d.connectionType === 'TCP') return d.ipAddress ? `${d.ipAddress}:${d.tcpPort ?? '?'}` : 'TCP';
    return d.serialPort ? `${d.connectionType} · ${d.serialPort}` : d.connectionType;
  };

  // ---------- Columna 1: Fuel Islands ----------
  const col1 = (
    <div className="flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden">
      <ColumnHeader
        icon={<Layers className="w-4 h-4 text-orange-500" />}
        title="Fuel Islands"
        subtitle={selectedSite ? `Sucursal ${selectedSite}` : 'Selecciona una sucursal'}
        count={siteIslands.length}
        onCreate={selectedSite ? openCreateIsland : undefined}
        createDisabled={!selectedSite}
        createLabel="Nueva isleta"
      />
      <SearchBox value={islandQuery} onChange={setIslandQuery} placeholder="Buscar isleta..." />
      <div className="flex-1 overflow-y-auto p-2">
        {!selectedSite ? (
          <div className="p-4 text-center text-2xs text-text-muted">
            <Layers className="w-8 h-8 mx-auto mb-1 text-gray-300" />
            Elige una sucursal arriba para empezar
          </div>
        ) : loadingIslands && siteIslands.length === 0 ? (
          <div className="p-4 text-center text-2xs text-text-muted">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
          </div>
        ) : siteIslands.length === 0 ? (
          <div className="p-4 text-center text-2xs text-text-muted">Sin isletas registradas</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {siteIslands.map((i) => {
              const selected = i.fuelIslandId === selectedIslandId;
              const terminal = i.terminals?.[0];
              const dispCount = i.dispensers?.length ?? 0;
              return (
                <button
                  key={i.fuelIslandId}
                  type="button"
                  onClick={() => {
                    setSelectedIslandId(i.fuelIslandId);
                    setSelectedDispenserId(null);
                  }}
                  className={`group relative text-left rounded-sm border transition-all flex flex-col aspect-[3/4] overflow-hidden ${
                    selected
                      ? 'border-orange-500 bg-gradient-to-b from-orange-50 to-white shadow-md ring-1 ring-orange-200'
                      : 'border-gray-300 bg-white hover:border-orange-400 hover:shadow-sm'
                  } ${!i.active ? 'opacity-60' : ''}`}
                >
                  {/* Cuerpo central — ilustración animada + nombre */}
                  <div className="flex-1 flex flex-col items-center justify-center px-2 py-1 text-center gap-0.5">
                    <div className="w-full aspect-square max-w-56">
                      <FuelPumpIllustration active={i.active} pumpCount={dispCount} highlighted={selected} />
                    </div>
                    <span className={`text-sm font-bold leading-tight break-words ${selected ? 'text-orange-700' : 'text-text-primary'}`}>
                      {i.name}
                    </span>
                  </div>

                  {/* Stats centrales */}
                  <div className="px-2 py-1.5 border-t border-gray-100 bg-gray-50/60 space-y-1">
                    <div className="flex items-center justify-center gap-1 text-2xs">
                      <Fuel className="w-2.5 h-2.5 text-blue-500" />
                      <span className="text-text-secondary">
                        <strong className="text-text-primary">{dispCount}</strong> {dispCount === 1 ? 'bomba' : 'bombas'}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-2xs">
                      <Monitor className="w-2.5 h-2.5 text-blue-500" />
                      {terminal ? (
                        <span className="text-text-secondary truncate max-w-full">T#{terminal.terminalId}</span>
                      ) : (
                        <span className="text-gray-400 italic">sin terminal</span>
                      )}
                    </div>
                  </div>

                  {/* "Base" de la isleta */}
                  <div className={`h-1 ${selected ? 'bg-orange-500' : 'bg-gray-300'}`} />

                  {/* Acciones flotantes */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-0.5 bg-white/95 rounded-sm p-0.5 shadow-sm border border-gray-200">
                    <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); openAssignDispensers(i); }} title="Asignar bombas">
                      <Link2 className="w-3 h-3 text-orange-600" />
                    </CompactButton>
                    <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); openEditIsland(i); }} title="Editar">
                      <Edit className="w-3 h-3 text-blue-600" />
                    </CompactButton>
                    <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); openDeleteIsland(i); }} title="Eliminar">
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </CompactButton>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ---------- Columna 2: Dispensers ----------
  const col2 = (
    <div className="flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden">
      <ColumnHeader
        icon={<Fuel className="w-4 h-4 text-blue-500" />}
        title="Bombas"
        subtitle={
          selectedIsland
            ? `${selectedIsland.name}`
            : selectedSite ? 'Mostrando todas de la sucursal' : ''
        }
        count={filteredDispensers.length}
        onCreate={selectedSite ? openCreateDispenser : undefined}
        createDisabled={!selectedSite}
        createLabel="Nueva bomba"
      />
      <SearchBox value={dispenserQuery} onChange={setDispenserQuery} placeholder="Buscar bomba..." />
      <div className="flex-1 overflow-y-auto p-2">
        {!selectedSite ? (
          <div className="p-4 text-center text-2xs text-text-muted">
            <Fuel className="w-8 h-8 mx-auto mb-1 text-gray-300" />
            Selecciona una sucursal
          </div>
        ) : filteredDispensers.length === 0 ? (
          <div className="p-4 text-center text-2xs text-text-muted">
            {selectedIsland ? 'Esta isleta no tiene bombas' : 'Sin bombas registradas'}
            {selectedIsland && (
              <div className="mt-2">
                <CompactButton variant="ghost" onClick={() => openAssignDispensers(selectedIsland)}>
                  <Link2 className="w-3 h-3" /> Asignar bombas
                </CompactButton>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredDispensers.map((d) => {
              const selected = d.dispenserId === selectedDispenserId;
              const assignedIslandObj = fuelIslands.find((i) => i.dispensers?.some((dd) => dd.dispenserId === d.dispenserId));
              const unassigned = !assignedIslandObj;
              return (
                <button
                  key={d.dispenserId}
                  type="button"
                  onClick={() => setSelectedDispenserId(d.dispenserId)}
                  className={`group relative text-left rounded-sm border transition-all flex flex-col aspect-[3/4] overflow-hidden ${
                    selected
                      ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-white shadow-md ring-1 ring-blue-200'
                      : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-sm'
                  } ${!d.active ? 'opacity-60' : ''}`}
                >
                  {/* "Display" superior — número de bomba + toggle status */}
                  <div className={`px-2 py-1.5 relative flex flex-col items-center justify-center ${
                    selected ? 'bg-gradient-to-b from-blue-500 to-blue-400' : 'bg-gradient-to-b from-gray-100 to-gray-50 border-b border-gray-200'
                  }`}>
                    <span className={`text-2xs uppercase tracking-wider leading-tight ${selected ? 'text-white/80' : 'text-text-muted'}`}>
                      Bomba
                    </span>
                    <span className={`text-lg font-extrabold leading-none tabular-nums ${selected ? 'text-white' : 'text-text-primary'}`}>
                      #{d.pumpNumber}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleDispenserActive(d); }}
                      title={d.active ? 'Click para desactivar' : 'Click para activar'}
                      className="absolute top-1 right-1"
                    >
                      <StatusDot color={d.active ? 'green' : 'gray'} label="" />
                    </button>
                  </div>

                  {/* Cuerpo central — ilustración SVG + nombre + status */}
                  <div className="flex-1 flex flex-col items-center justify-center px-2 py-1 text-center gap-0.5">
                    <div className="w-full aspect-square max-w-56">
                      <DispenserIllustration
                        active={d.active}
                        nozzleCount={d.nozzlesCount}
                        highlighted={selected}
                      />
                    </div>
                    <span className="text-2xs font-semibold leading-tight break-words text-text-primary line-clamp-2">
                      {d.name || <span className="italic text-gray-400">sin nombre</span>}
                    </span>
                    {unassigned && (
                      <span className="text-2xs px-1 bg-amber-100 text-amber-700 rounded-sm" title="No asignada a isleta">⚠ sin isleta</span>
                    )}
                  </div>

                  {/* Stats en la "base" */}
                  <div className="px-1.5 py-1 border-t border-gray-100 bg-gray-50/60 space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-2xs">
                      {d.connectionType === 'TCP'
                        ? <Network className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
                        : <Cable className="w-2.5 h-2.5 text-purple-500 flex-shrink-0" />}
                      <span className="text-text-secondary truncate">{connectionLabel(d)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-2xs">
                      <Droplet className="w-2.5 h-2.5 text-orange-500 flex-shrink-0" />
                      <span className="text-text-secondary">
                        <strong className="text-text-primary">{d.nozzlesCount}</strong> {d.nozzlesCount === 1 ? 'manguera' : 'mangueras'}
                      </span>
                    </div>
                  </div>

                  {/* "Base" */}
                  <div className={`h-1 ${selected ? 'bg-blue-500' : 'bg-gray-300'}`} />

                  {/* Acciones flotantes */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-0.5 bg-white/95 rounded-sm p-0.5 shadow-sm border border-gray-200">
                    <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); openEditDispenser(d); }} title="Editar">
                      <Edit className="w-3 h-3 text-blue-600" />
                    </CompactButton>
                    {assignedIslandObj && (
                      <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); unassignDispenser(assignedIslandObj, d); }} title="Desasignar">
                        <Link2 className="w-3 h-3 text-orange-600" />
                      </CompactButton>
                    )}
                    <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); openDeleteDispenser(d); }} title="Eliminar">
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </CompactButton>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ---------- Columna 3: Nozzles ----------
  const col3 = (
    <div className="flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden">
      <ColumnHeader
        icon={<Droplet className="w-4 h-4 text-orange-600" />}
        title="Mangueras"
        subtitle={
          selectedDispenser
            ? `Bomba #${selectedDispenser.pumpNumber}${selectedDispenser.name ? ' · ' + selectedDispenser.name : ''}`
            : 'Selecciona una bomba'
        }
        count={filteredNozzles.length}
        onCreate={openCreateNozzle}
        createDisabled={!selectedDispenser}
        createLabel="Nueva manguera"
      />
      <SearchBox value={nozzleQuery} onChange={setNozzleQuery} placeholder="Buscar manguera..." />
      <div className="flex-1 overflow-y-auto p-2">
        {!selectedDispenser ? (
          <div className="p-4 text-center text-2xs text-text-muted">
            <Droplet className="w-8 h-8 mx-auto mb-1 text-gray-300" />
            Selecciona una bomba
          </div>
        ) : loadingNozzles ? (
          <div className="p-4 text-center text-2xs text-text-muted">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
          </div>
        ) : nozzleError ? (
          <div className="m-2 bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">{nozzleError}</div>
        ) : filteredNozzles.length === 0 ? (
          <div className="p-4 text-center text-2xs text-text-muted">
            Sin mangueras registradas
            <div className="mt-2">
              <CompactButton variant="primary" onClick={openCreateNozzle}>
                <Plus className="w-3 h-3" /> Crear primera manguera
              </CompactButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredNozzles
              .slice()
              .sort((a, b) => a.nozzleNumber - b.nozzleNumber)
              .map((n) => {
                return (
                  <div
                    key={n.nozzleId}
                    className={`group relative rounded-sm border bg-white transition-all flex flex-col aspect-[1/2] overflow-hidden hover:shadow-md ${
                      n.active ? 'border-gray-300' : 'border-gray-200 opacity-60'
                    }`}
                  >
                    {/* Panel Shell/Gilbarco — incluye LCD del precio, brand, tipo de combustible */}
                    <div className="flex-1 flex items-stretch justify-center overflow-hidden">
                      <FuelGradePanel
                        productName={n.productName}
                        price={n.price}
                        nozzleNumber={n.nozzleNumber}
                      />
                    </div>

                    {/* Caption del producto real (productId) — debajo del panel */}
                    <div className="px-1 py-0.5 text-center border-t border-gray-200 bg-gray-50">
                      <span className="block text-[9px] font-mono text-gray-500 truncate" title={n.productName || n.productId}>
                        {n.productId}
                      </span>
                    </div>

                    {/* Footer — tanque + status */}
                    <div className="px-1 py-0.5 border-t border-gray-200 bg-gray-50 flex items-center justify-center gap-1">
                      {n.tankNumber != null ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-text-muted">
                          <Container className="w-2.5 h-2.5 text-blue-500" />T#{n.tankNumber}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">sin tanque</span>
                      )}
                      <button
                        onClick={() => toggleNozzleActive(n)}
                        title={n.active ? 'Click para desactivar' : 'Click para activar'}
                        className="ml-auto"
                      >
                        <StatusDot color={n.active ? 'green' : 'gray'} label="" />
                      </button>
                    </div>

                    {/* Acciones flotantes */}
                    <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5 bg-white/95 rounded-sm p-0.5 shadow-sm border border-gray-200">
                      <CompactButton variant="icon" onClick={() => openEditNozzle(n)} title="Editar">
                        <Edit className="w-3 h-3 text-blue-600" />
                      </CompactButton>
                      <CompactButton variant="icon" onClick={() => setConfirmDeleteNozzle(n)} title="Eliminar">
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </CompactButton>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-2">
      {/* Header: site + summary + actions */}
      <div className="bg-white border border-table-border rounded-sm flex-shrink-0">
        <div className="px-3 py-2 flex items-center gap-3 flex-wrap">
          <div className="min-w-[240px]">
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Sucursal</label>
            <SiteAutocomplete
              value={selectedSite}
              onChange={(v) => setSelectedSite(v)}
              placeholder="Selecciona una sucursal..."
            />
          </div>

          {selectedSite && (
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="flex flex-col items-center px-2">
                <span className="text-lg font-bold text-orange-600 leading-tight">{summary.islands}</span>
                <span className="text-2xs text-text-muted flex items-center gap-0.5"><Layers className="w-2.5 h-2.5" />Isletas</span>
              </div>
              <div className="flex flex-col items-center px-2 border-l border-gray-100">
                <span className="text-lg font-bold text-blue-600 leading-tight">{summary.dispensers}</span>
                <span className="text-2xs text-text-muted flex items-center gap-0.5"><Fuel className="w-2.5 h-2.5" />Bombas</span>
              </div>
              {summary.unassigned > 0 && (
                <div className="flex flex-col items-center px-2 border-l border-gray-100">
                  <span className="text-lg font-bold text-amber-600 leading-tight">{summary.unassigned}</span>
                  <span className="text-2xs text-text-muted flex items-center gap-0.5"><AlertCircle className="w-2.5 h-2.5" />Sin asignar</span>
                </div>
              )}
            </div>
          )}

          <div className="ml-auto">
            <CompactButton variant="ghost" onClick={refreshAll} disabled={loadingIslands}>
              <RefreshCw className={`w-3 h-3 ${loadingIslands ? 'animate-spin' : ''}`} /> Actualizar
            </CompactButton>
          </div>
        </div>
      </div>

      {errIslands && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700 flex-shrink-0">
          {errIslands}
        </div>
      )}

      {/* 2 columnas: Islands a la izquierda, Bombas+Mangueras apilados a la derecha */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 min-h-0">
        {col1}
        <div className="flex flex-col gap-2 min-h-0 [&>div]:flex-1 [&>div]:min-h-0">
          {col2}
          {col3}
        </div>
      </div>

      {/* Breadcrumb footer mostrando la ruta de selección */}
      {selectedSite && (
        <div className="text-2xs text-text-muted flex items-center gap-1 px-1 flex-shrink-0">
          <span className="font-medium text-text-primary">{selectedSite}</span>
          {selectedIsland && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="font-medium text-orange-600">{selectedIsland.name}</span>
            </>
          )}
          {selectedDispenser && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="font-medium text-blue-600">
                Bomba #{selectedDispenser.pumpNumber}{selectedDispenser.name ? ' · ' + selectedDispenser.name : ''}
              </span>
            </>
          )}
        </div>
      )}

      {/* Modales */}
      <FuelIslandModal
        isOpen={islandModalOpen}
        onClose={() => setIslandModalOpen(false)}
        fuelIsland={islandForModal}
        mode={islandMode}
        onSuccess={refreshAll}
      />
      <DeleteFuelIslandDialog
        isOpen={deleteIslandOpen}
        onClose={() => setDeleteIslandOpen(false)}
        fuelIsland={islandToDelete}
        onSuccess={() => { setSelectedIslandId(null); refreshAll(); }}
      />
      <AssignDispensersModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        fuelIsland={assignIsland}
        allIslands={fuelIslands}
        onSuccess={refreshAll}
      />
      <DispenserConfigModal
        isOpen={dispModalOpen}
        onClose={() => setDispModalOpen(false)}
        dispenser={dispForModal}
        mode={dispMode}
        onSuccess={refreshAll}
      />
      <DeleteDispenserConfigDialog
        isOpen={deleteDispOpen}
        onClose={() => setDeleteDispOpen(false)}
        dispenser={dispToDelete}
        onSuccess={() => { setSelectedDispenserId(null); refreshAll(); }}
      />
      {selectedDispenser && (
        <NozzleFormModal
          isOpen={nozzleFormOpen}
          onClose={() => setNozzleFormOpen(false)}
          dispenserId={selectedDispenser.dispenserId}
          nozzle={nozzleForModal}
          mode={nozzleFormMode}
          onSuccess={refreshNozzles}
        />
      )}

      {/* Confirm delete nozzle */}
      {confirmDeleteNozzle && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
          onClick={() => !deletingNozzle && setConfirmDeleteNozzle(null)}
        >
          <div className="bg-white rounded-sm w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-text-primary text-center mb-1">Eliminar Manguera</h3>
              <p className="text-sm text-text-secondary text-center mb-4">
                ¿Eliminar <strong>Manguera #{confirmDeleteNozzle.nozzleNumber}</strong>?
                <br />
                <span className="text-text-muted text-xs">
                  Producto: {confirmDeleteNozzle.productName || confirmDeleteNozzle.productId}
                </span>
                <br />
                <span className="font-medium text-red-600">Esta acción no se puede deshacer.</span>
              </p>
              <div className="flex gap-2">
                <CompactButton variant="ghost" onClick={() => setConfirmDeleteNozzle(null)} disabled={deletingNozzle} className="flex-1 justify-center">
                  Cancelar
                </CompactButton>
                <CompactButton variant="danger" onClick={handleDeleteNozzle} disabled={deletingNozzle} className="flex-1 justify-center">
                  {deletingNozzle ? (<><RefreshCw className="w-3 h-3 animate-spin" /> Eliminando...</>) : 'Eliminar'}
                </CompactButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispensersWorkbenchSection;
