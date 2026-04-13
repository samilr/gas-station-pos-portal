import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Save, RefreshCw, AlertCircle, Clock, Plus, Trash2, ToggleLeft, ToggleRight, Fuel,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getGlobalFuelPrices,
  updateGlobalFuelPrices,
  getFuelGradesConfig,
  getPumpPrices,
  updatePumpPrices,
  getPricesScheduler,
  updatePricesScheduler,
} from '../../../services/dispenserService';
import type {
  FuelGradePrice,
  FuelGradeConfig,
  PumpPricesData,
  NozzlePriceUpdate,
  PriceSchedule,
} from '../../../types/dispenser';
import { useHeader } from '../../../context/HeaderContext';
import { CompactButton } from '../../ui';
import Toolbar from '../../ui/Toolbar';

type Tab = 'global' | 'per-pump' | 'scheduler';

const PUMP_COUNT = 18;

const PricesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('global');
  const { setSubtitle } = useHeader();

  useEffect(() => {
    setSubtitle('Gestion de precios de combustible');
    return () => { setSubtitle(''); };
  }, [setSubtitle]);

  return (
    <div className="space-y-1">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-0.5 rounded-sm w-fit">
        {([
          { key: 'global', label: 'Precios Globales', icon: DollarSign },
          { key: 'per-pump', label: 'Por Bomba', icon: Fuel },
          { key: 'scheduler', label: 'Programador', icon: Clock },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 h-7 px-3 text-xs font-medium rounded-sm transition-colors ${
              activeTab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'global' && <GlobalPricesTab />}
      {activeTab === 'per-pump' && <PerPumpPricesTab />}
      {activeTab === 'scheduler' && <SchedulerTab />}
    </div>
  );
};

// ============================================================
// Tab: Precios Globales
// ============================================================

const GlobalPricesTab: React.FC = () => {
  const [grades, setGrades] = useState<FuelGradeConfig[]>([]);
  const [prices, setPrices] = useState<FuelGradePrice[]>([]);
  const [editPrices, setEditPrices] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesData, pricesData] = await Promise.all([
        getFuelGradesConfig(),
        getGlobalFuelPrices(),
      ]);
      setGrades(gradesData);
      setPrices(pricesData);
      const edits: Record<number, string> = {};
      pricesData.forEach((p) => { edits[p.FuelGradeId] = p.Price.toFixed(2); });
      setEditPrices(edits);
      setHasChanges(false);
    } catch (err) {
      toast.error('Error al cargar precios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePriceChange = (gradeId: number, value: string) => {
    setEditPrices((prev) => ({ ...prev, [gradeId]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newPrices: FuelGradePrice[] = Object.entries(editPrices).map(([id, price]) => ({
        FuelGradeId: Number(id),
        Price: parseFloat(price),
      }));
      await updateGlobalFuelPrices(newPrices);
      toast.success('Precios globales actualizados');
      setHasChanges(false);
      load();
    } catch (err) {
      toast.error('Error al guardar precios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingCard />;

  return (
    <div className="bg-white rounded-sm shadow-sm">
      <Toolbar>
        <span className="text-xs text-gray-500">Precios Globales por Grado</span>
        <div className="flex-1" />
        <CompactButton variant="icon" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" />
        </CompactButton>
        {hasChanges && (
          <CompactButton variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar
          </CompactButton>
        )}
      </Toolbar>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="h-8 text-xs uppercase tracking-wide bg-table-header">
              <th className="px-2 text-left font-medium text-gray-500">ID</th>
              <th className="px-2 text-left font-medium text-gray-500">Combustible</th>
              <th className="px-2 text-left font-medium text-gray-500">Precio Actual (RD$/L)</th>
              <th className="px-2 text-left font-medium text-gray-500">Nuevo Precio</th>
              <th className="px-2 text-left font-medium text-gray-500">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => {
              const currentPrice = prices.find((p) => p.FuelGradeId === grade.Id)?.Price || grade.Price;
              const newPrice = parseFloat(editPrices[grade.Id] || '0');
              const diff = newPrice - currentPrice;

              return (
                <tr key={grade.Id} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
                  <td className="px-2 text-sm whitespace-nowrap font-medium text-gray-900">{grade.Id}</td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-900">{grade.Name}</td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-600">RD$ {currentPrice.toFixed(2)}</td>
                  <td className="px-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPrices[grade.Id] || ''}
                      onChange={(e) => handlePriceChange(grade.Id, e.target.value)}
                      className="w-28 h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    {diff !== 0 && (
                      <span className={diff > 0 ? 'text-red-600' : 'text-green-600'}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(2)}
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
  );
};

// ============================================================
// Tab: Precios por Bomba
// ============================================================

const PerPumpPricesTab: React.FC = () => {
  const [selectedPump, setSelectedPump] = useState<number>(1);
  const [pumpPrices, setPumpPrices] = useState<PumpPricesData | null>(null);
  const [editPrices, setEditPrices] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const loadPumpPrices = useCallback(async (pump: number) => {
    setLoading(true);
    try {
      const data = await getPumpPrices(pump);
      setPumpPrices(data);
      const edits: Record<number, string> = {};
      data?.NozzlePrices?.forEach((np) => { edits[np.Nozzle] = np.Price.toFixed(2); });
      setEditPrices(edits);
      setHasChanges(false);
    } catch {
      toast.error(`Error al cargar precios de bomba ${pump}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPumpPrices(selectedPump); }, [selectedPump, loadPumpPrices]);

  const handlePriceChange = (nozzle: number, value: string) => {
    setEditPrices((prev) => ({ ...prev, [nozzle]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!pumpPrices) return;
    setSaving(true);
    try {
      const updates: NozzlePriceUpdate[] = pumpPrices.NozzlePrices.map((np) => ({
        Nozzle: np.Nozzle,
        FuelGradeId: np.FuelGradeId,
        Price: parseFloat(editPrices[np.Nozzle] || String(np.Price)),
      }));
      await updatePumpPrices(selectedPump, updates);
      toast.success(`Precios de bomba ${selectedPump} actualizados`);
      setHasChanges(false);
      loadPumpPrices(selectedPump);
    } catch {
      toast.error('Error al guardar precios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm">
      <Toolbar>
        <span className="text-xs text-gray-500">Precios por Bomba</span>
        <select
          value={selectedPump}
          onChange={(e) => setSelectedPump(Number(e.target.value))}
          className="h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500"
        >
          {Array.from({ length: PUMP_COUNT }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>Bomba {n}</option>
          ))}
        </select>
        <div className="flex-1" />
        {hasChanges && (
          <CompactButton variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar
          </CompactButton>
        )}
      </Toolbar>

      {loading ? (
        <LoadingCard />
      ) : pumpPrices?.NozzlePrices?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header">
                <th className="px-2 text-left font-medium text-gray-500">Pistola</th>
                <th className="px-2 text-left font-medium text-gray-500">Combustible</th>
                <th className="px-2 text-left font-medium text-gray-500">Precio Actual</th>
                <th className="px-2 text-left font-medium text-gray-500">Nuevo Precio</th>
              </tr>
            </thead>
            <tbody>
              {pumpPrices.NozzlePrices.map((np) => (
                <tr key={np.Nozzle} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
                  <td className="px-2 text-sm whitespace-nowrap font-medium text-gray-900">#{np.Nozzle}</td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-900">{np.FuelGradeName}</td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-600">RD$ {np.Price.toFixed(2)}</td>
                  <td className="px-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPrices[np.Nozzle] || ''}
                      onChange={(e) => handlePriceChange(np.Nozzle, e.target.value)}
                      className="w-28 h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <Fuel className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No se encontraron precios para esta bomba</p>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Tab: Programador de Precios
// ============================================================

const SchedulerTab: React.FC = () => {
  const [schedules, setSchedules] = useState<PriceSchedule[]>([]);
  const [grades, setGrades] = useState<FuelGradeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [schedulesData, gradesData] = await Promise.all([
        getPricesScheduler(),
        getFuelGradesConfig(),
      ]);
      setSchedules(schedulesData);
      setGrades(gradesData);
      setHasChanges(false);
    } catch {
      toast.error('Error al cargar programador');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateSchedule = (index: number, field: keyof PriceSchedule, value: any) => {
    setSchedules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setHasChanges(true);
  };

  const addSchedule = () => {
    const maxId = schedules.reduce((max, s) => Math.max(max, s.Id), 0);
    setSchedules((prev) => [
      ...prev,
      {
        Id: maxId + 1,
        Enabled: false,
        FuelGradeId: grades[0]?.Id || 1,
        Price: 0,
        DateTime: new Date().toISOString().slice(0, 16),
      },
    ]);
    setHasChanges(true);
  };

  const removeSchedule = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePricesScheduler(schedules);
      toast.success('Programador de precios actualizado');
      setHasChanges(false);
    } catch {
      toast.error('Error al guardar programador');
    } finally {
      setSaving(false);
    }
  };

  const getGradeName = (id: number) => grades.find((g) => g.Id === id)?.Name || `Grado ${id}`;

  if (loading) return <LoadingCard />;

  return (
    <div className="bg-white rounded-sm shadow-sm">
      <Toolbar>
        <span className="text-xs text-gray-500">Programador de Cambios de Precio</span>
        <div className="flex-1" />
        <CompactButton variant="ghost" onClick={addSchedule}>
          <Plus className="w-3.5 h-3.5" />
          Agregar
        </CompactButton>
        {hasChanges && (
          <CompactButton variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar
          </CompactButton>
        )}
      </Toolbar>

      {schedules.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay cambios de precio programados</p>
          <button onClick={addSchedule} className="mt-2 text-blue-600 hover:text-blue-700 text-xs font-medium">
            Agregar el primero
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header">
                <th className="px-2 text-left font-medium text-gray-500">Activo</th>
                <th className="px-2 text-left font-medium text-gray-500">Combustible</th>
                <th className="px-2 text-left font-medium text-gray-500">Nuevo Precio (RD$)</th>
                <th className="px-2 text-left font-medium text-gray-500">Fecha/Hora de Aplicacion</th>
                <th className="px-2 text-left font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule, idx) => (
                <tr key={schedule.Id} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
                  <td className="px-2">
                    <button onClick={() => updateSchedule(idx, 'Enabled', !schedule.Enabled)}>
                      {schedule.Enabled ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-2">
                    <select
                      value={schedule.FuelGradeId}
                      onChange={(e) => updateSchedule(idx, 'FuelGradeId', Number(e.target.value))}
                      className="h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500"
                    >
                      {grades.map((g) => (
                        <option key={g.Id} value={g.Id}>{g.Name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={schedule.Price}
                      onChange={(e) => updateSchedule(idx, 'Price', parseFloat(e.target.value) || 0)}
                      className="w-28 h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-2">
                    <input
                      type="datetime-local"
                      value={schedule.DateTime?.slice(0, 16) || ''}
                      onChange={(e) => updateSchedule(idx, 'DateTime', e.target.value + ':00')}
                      className="h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-2">
                    <CompactButton variant="icon" onClick={() => removeSchedule(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </CompactButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="p-2 border-t border-gray-200">
        <div className="flex items-start gap-1.5 text-xs text-gray-500">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>Los cambios de precio programados se aplicaran automaticamente a la fecha y hora indicada. Active el toggle para habilitar cada programacion.</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Componente de carga
// ============================================================

const LoadingCard: React.FC = () => (
  <div className="bg-white rounded-sm shadow-sm p-8 flex items-center justify-center">
    <div className="text-center">
      <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
      <p className="text-gray-500 text-xs">Cargando datos...</p>
    </div>
  </div>
);

export default PricesSection;
