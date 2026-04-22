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

const formatPrice = (v: number) =>
  new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

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
    setSubtitle('Workbench · Isletas, Bombas y Mangueras');
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

  const unassignedForSite = useMemo(() => {
    if (!selectedSite) return [];
    const assignedIds = new Set<number>();
    fuelIslands.forEach((i) => {
      if (i.siteId === selectedSite) i.dispensers?.forEach((d) => assignedIds.add(d.dispenserId));
    });
    return allDispensers.filter((d) => d.siteId === selectedSite && !assignedIds.has(d.dispenserId));
  }, [allDispensers, fuelIslands, selectedSite]);

  const summary = useMemo(() => ({
    islands: siteIslands.length,
    dispensers: selectedSite
      ? allDispensers.filter((d) => d.siteId === selectedSite).length
      : 0,
    unassigned: unassignedForSite.length,
  }), [siteIslands, allDispensers, selectedSite, unassignedForSite]);

  const refreshNozzles = async () => {
    if (selectedDispenserId == null) return;
    const fresh = await nozzleService.list({ dispenserId: selectedDispenserId });
    if (fresh.successful) setNozzles(fresh.data);
  };

  const refreshAll = () => {
    refreshIslands();
    refreshDispensers();
    refreshNozzles();
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
        refreshNozzles();
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
        refreshNozzles();
      } else toast.error(res.error || 'Error al eliminar');
    } catch { toast.error('Error de conexión'); }
    finally { setDeletingNozzle(false); }
  };

  // ─────────────────────────────── UI helpers ───────────────────────────────

  const ColumnHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    count?: number;
    onCreate?: () => void;
    createDisabled?: boolean;
    createLabel?: string;
  }> = ({ icon, title, subtitle, count, onCreate, createDisabled, createLabel = 'Nueva' }) => (
    <div className="px-2 h-10 border-b border-gray-200 bg-table-header flex items-center gap-2 flex-shrink-0">
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {icon}
        <div className="min-w-0">
          <div className="text-2xs font-semibold uppercase tracking-wide text-text-primary flex items-center gap-1">
            {title}
            {count != null && <span className="font-normal normal-case tracking-normal text-text-muted">({count})</span>}
          </div>
          {subtitle && <div className="text-2xs text-text-muted truncate leading-tight">{subtitle}</div>}
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
    <div className="px-2 py-1.5 border-b border-gray-100 bg-white flex-shrink-0">
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

  const EmptyState: React.FC<{ icon: React.ReactNode; text: string; children?: React.ReactNode }> = ({
    icon, text, children,
  }) => (
    <div className="p-4 text-center text-2xs text-text-muted flex flex-col items-center gap-1">
      <div className="text-gray-300">{icon}</div>
      <span>{text}</span>
      {children}
    </div>
  );

  const connectionLabel = (d: Dispenser) => {
    if (d.connectionType === 'TCP') return d.ipAddress ? `${d.ipAddress}:${d.tcpPort ?? '?'}` : 'TCP';
    return d.serialPort ? `${d.connectionType} · ${d.serialPort}` : d.connectionType;
  };

  // ─────────────────────────────── Columnas ───────────────────────────────

  // Col 1 — Fuel Islands (lista)
  const col1 = (
    <div className="flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden min-h-0">
      <ColumnHeader
        icon={<Layers className="w-4 h-4 text-orange-500" />}
        title="Isletas"
        subtitle={selectedSite ? `Sucursal ${selectedSite}` : 'Selecciona una sucursal'}
        count={siteIslands.length}
        onCreate={selectedSite ? openCreateIsland : undefined}
        createDisabled={!selectedSite}
        createLabel="Nueva"
      />
      <SearchBox value={islandQuery} onChange={setIslandQuery} placeholder="Buscar isleta..." />
      <div className="flex-1 overflow-y-auto">
        {!selectedSite ? (
          <EmptyState icon={<Layers className="w-6 h-6" />} text="Elige una sucursal para empezar" />
        ) : loadingIslands && siteIslands.length === 0 ? (
          <div className="p-4 text-center"><RefreshCw className="w-4 h-4 animate-spin inline text-text-muted" /></div>
        ) : siteIslands.length === 0 ? (
          <EmptyState icon={<Layers className="w-6 h-6" />} text="Sin isletas registradas" />
        ) : (
          <ul className="divide-y divide-gray-100">
            {siteIslands.map((i) => {
              const selected = i.fuelIslandId === selectedIslandId;
              const terminal = i.terminals?.[0];
              const dispCount = i.dispensers?.length ?? 0;
              return (
                <li key={i.fuelIslandId}>
                  <div
                    onClick={() => {
                      setSelectedIslandId(selected ? null : i.fuelIslandId);
                      setSelectedDispenserId(null);
                    }}
                    className={`group flex items-center gap-2 px-2 h-11 cursor-pointer ${
                      selected ? 'bg-orange-50 border-l-2 border-l-orange-500' : 'hover:bg-row-hover border-l-2 border-l-transparent'
                    } ${!i.active ? 'opacity-60' : ''}`}
                  >
                    <Layers className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-orange-600' : 'text-orange-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-medium truncate ${selected ? 'text-orange-700' : 'text-text-primary'}`}>
                          {i.name}
                        </span>
                        <StatusDot color={i.active ? 'green' : 'gray'} label="" />
                      </div>
                      <div className="flex items-center gap-2 text-2xs text-text-muted">
                        <span className="inline-flex items-center gap-0.5">
                          <Fuel className="w-2.5 h-2.5" />
                          {dispCount} {dispCount === 1 ? 'bomba' : 'bombas'}
                        </span>
                        {terminal ? (
                          <span className="inline-flex items-center gap-0.5">
                            <Monitor className="w-2.5 h-2.5" />
                            T#{terminal.terminalId}
                          </span>
                        ) : (
                          <span className="italic">sin terminal</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); openAssignDispensers(i); }} title="Asignar bombas">
                        <Link2 className="w-3.5 h-3.5 text-orange-600" />
                      </CompactButton>
                      <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); openEditIsland(i); }} title="Editar">
                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                      </CompactButton>
                      <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); openDeleteIsland(i); }} title="Eliminar">
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </CompactButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  // Col 2 — Bombas (lista)
  const col2 = (
    <div className="flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden min-h-0">
      <ColumnHeader
        icon={<Fuel className="w-4 h-4 text-blue-500" />}
        title="Bombas"
        subtitle={
          selectedIsland
            ? selectedIsland.name
            : selectedSite ? 'Todas de la sucursal' : ''
        }
        count={filteredDispensers.length}
        onCreate={selectedSite ? openCreateDispenser : undefined}
        createDisabled={!selectedSite}
        createLabel="Nueva"
      />
      <SearchBox value={dispenserQuery} onChange={setDispenserQuery} placeholder="Buscar bomba..." />
      <div className="flex-1 overflow-y-auto">
        {!selectedSite ? (
          <EmptyState icon={<Fuel className="w-6 h-6" />} text="Selecciona una sucursal" />
        ) : filteredDispensers.length === 0 ? (
          <EmptyState
            icon={<Fuel className="w-6 h-6" />}
            text={selectedIsland ? 'Esta isleta no tiene bombas' : 'Sin bombas registradas'}
          >
            {selectedIsland && (
              <div className="mt-1">
                <CompactButton variant="ghost" onClick={() => openAssignDispensers(selectedIsland)}>
                  <Link2 className="w-3 h-3" /> Asignar bombas
                </CompactButton>
              </div>
            )}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredDispensers
              .slice()
              .sort((a, b) => a.pumpNumber - b.pumpNumber)
              .map((d) => {
                const selected = d.dispenserId === selectedDispenserId;
                const assignedIsland = fuelIslands.find((i) => i.dispensers?.some((dd) => dd.dispenserId === d.dispenserId));
                const unassigned = !assignedIsland;
                return (
                  <li key={d.dispenserId}>
                    <div
                      onClick={() => setSelectedDispenserId(selected ? null : d.dispenserId)}
                      className={`group flex items-center gap-2 px-2 h-11 cursor-pointer ${
                        selected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-row-hover border-l-2 border-l-transparent'
                      } ${!d.active ? 'opacity-60' : ''}`}
                    >
                      <div className={`w-9 h-7 rounded-sm flex flex-col items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-text-primary'
                      }`}>
                        <span className="text-2xs leading-none">#</span>
                        <span className="text-sm font-bold leading-none tabular-nums">{d.pumpNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {d.name || <span className="italic text-gray-400">sin nombre</span>}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleDispenserActive(d); }}
                            title={d.active ? 'Click para desactivar' : 'Click para activar'}
                          >
                            <StatusDot color={d.active ? 'green' : 'gray'} label="" />
                          </button>
                          {unassigned && (
                            <span className="text-2xs px-1 bg-amber-100 text-amber-700 rounded-sm flex-shrink-0" title="No asignada a isleta">
                              sin isleta
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-2xs text-text-muted">
                          <span className="inline-flex items-center gap-0.5 truncate">
                            {d.connectionType === 'TCP'
                              ? <Network className="w-2.5 h-2.5" />
                              : <Cable className="w-2.5 h-2.5" />}
                            <span className="truncate">{connectionLabel(d)}</span>
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <Droplet className="w-2.5 h-2.5" />
                            {d.nozzlesCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); openEditDispenser(d); }} title="Editar">
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                        </CompactButton>
                        {assignedIsland && (
                          <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); unassignDispenser(assignedIsland, d); }} title="Desasignar de isleta">
                            <Link2 className="w-3.5 h-3.5 text-orange-600" />
                          </CompactButton>
                        )}
                        <CompactButton variant="icon" onClick={(e: any) => { e.stopPropagation(); openDeleteDispenser(d); }} title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </CompactButton>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );

  // Col 3 — Mangueras (lista)
  const col3 = (
    <div className="flex flex-col bg-white border border-gray-200 rounded-sm overflow-hidden min-h-0">
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
        createLabel="Nueva"
      />
      <SearchBox value={nozzleQuery} onChange={setNozzleQuery} placeholder="Buscar manguera..." />
      <div className="flex-1 overflow-y-auto">
        {!selectedDispenser ? (
          <EmptyState icon={<Droplet className="w-6 h-6" />} text="Selecciona una bomba" />
        ) : loadingNozzles ? (
          <div className="p-4 text-center"><RefreshCw className="w-4 h-4 animate-spin inline text-text-muted" /></div>
        ) : nozzleError ? (
          <div className="m-2 bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">{nozzleError}</div>
        ) : filteredNozzles.length === 0 ? (
          <EmptyState icon={<Droplet className="w-6 h-6" />} text="Sin mangueras registradas">
            <div className="mt-1">
              <CompactButton variant="primary" onClick={openCreateNozzle}>
                <Plus className="w-3 h-3" /> Crear primera
              </CompactButton>
            </div>
          </EmptyState>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredNozzles
              .slice()
              .sort((a, b) => a.nozzleNumber - b.nozzleNumber)
              .map((n) => (
                <li key={n.nozzleId}>
                  <div className={`group flex items-center gap-2 px-2 h-11 hover:bg-row-hover ${!n.active ? 'opacity-60' : ''}`}>
                    <div className="w-9 h-7 rounded-sm flex flex-col items-center justify-center flex-shrink-0 bg-orange-100 text-orange-700">
                      <span className="text-2xs leading-none">#</span>
                      <span className="text-sm font-bold leading-none tabular-nums">{n.nozzleNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {n.productName || <span className="font-mono text-text-muted">{n.productId}</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleNozzleActive(n)}
                          title={n.active ? 'Click para desactivar' : 'Click para activar'}
                        >
                          <StatusDot color={n.active ? 'green' : 'gray'} label="" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-2xs text-text-muted">
                        <span className="tabular-nums">{formatPrice(n.price)} <span className="text-text-muted">DOP/L</span></span>
                        {n.tankNumber != null ? (
                          <span className="inline-flex items-center gap-0.5">
                            <Container className="w-2.5 h-2.5" />
                            T#{n.tankNumber}
                          </span>
                        ) : (
                          <span className="italic">sin tanque</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CompactButton variant="icon" onClick={() => openEditNozzle(n)} title="Editar">
                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                      </CompactButton>
                      <CompactButton variant="icon" onClick={() => setConfirmDeleteNozzle(n)} title="Eliminar">
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </CompactButton>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
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
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <Layers className="w-3 h-3 text-orange-500" />
                Isletas <strong className="text-text-primary">{summary.islands}</strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <Fuel className="w-3 h-3 text-blue-500" />
                Bombas <strong className="text-text-primary">{summary.dispensers}</strong>
              </span>
              {summary.unassigned > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-700">
                  <AlertCircle className="w-3 h-3" />
                  Sin isleta <strong>{summary.unassigned}</strong>
                </span>
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

      {/* 3 columnas iguales */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 min-h-0">
        {col1}
        {col2}
        {col3}
      </div>

      {/* Breadcrumb */}
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
