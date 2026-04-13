import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

type Tab = 'global' | 'per-pump' | 'scheduler';

const PUMP_COUNT = 18;

const PricesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('global');
  const { setSubtitle } = useHeader();

  useEffect(() => {
    setSubtitle('Gestión de precios de combustible');
    return () => { setSubtitle(''); };
  }, [setSubtitle]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Precios de Combustible</h1>
        <p className="text-gray-600 text-sm">Administre precios globales, por bomba, y programe cambios de precio</p>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-gray-100 p-1 rounded-lg w-fit">
          {([
            { key: 'global', label: 'Precios Globales', icon: DollarSign },
            { key: 'per-pump', label: 'Por Bomba', icon: Fuel },
            { key: 'scheduler', label: 'Programador', icon: Clock },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'global' && (
          <motion.div key="global" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <GlobalPricesTab />
          </motion.div>
        )}
        {activeTab === 'per-pump' && (
          <motion.div key="per-pump" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <PerPumpPricesTab />
          </motion.div>
        )}
        {activeTab === 'scheduler' && (
          <motion.div key="scheduler" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SchedulerTab />
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Precios Globales por Grado</h2>
          <p className="text-sm text-gray-500">Estos precios aplican a todas las bombas que no tengan precio individual</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
          {hasChanges && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </motion.button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Combustible</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Actual (RD$/L)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nuevo Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diferencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {grades.map((grade) => {
              const currentPrice = prices.find((p) => p.FuelGradeId === grade.Id)?.Price || grade.Price;
              const newPrice = parseFloat(editPrices[grade.Id] || '0');
              const diff = newPrice - currentPrice;

              return (
                <tr key={grade.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{grade.Id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{grade.Name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">RD$ {currentPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPrices[grade.Id] || ''}
                      onChange={(e) => handlePriceChange(grade.Id, e.target.value)}
                      className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm">
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
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Precios por Bomba</h2>
            <p className="text-sm text-gray-500">Precios individuales de cada pistola</p>
          </div>
          <select
            value={selectedPump}
            onChange={(e) => setSelectedPump(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: PUMP_COUNT }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>Bomba {n}</option>
            ))}
          </select>
        </div>
        {hasChanges && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </motion.button>
        )}
      </div>

      {loading ? (
        <LoadingCard />
      ) : pumpPrices?.NozzlePrices?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pistola</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Combustible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nuevo Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pumpPrices.NozzlePrices.map((np) => (
                <tr key={np.Nozzle} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{np.Nozzle}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{np.FuelGradeName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">RD$ {np.Price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPrices[np.Nozzle] || ''}
                      onChange={(e) => handlePriceChange(np.Nozzle, e.target.value)}
                      className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center text-gray-500">
          <Fuel className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No se encontraron precios para esta bomba</p>
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
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Programador de Cambios de Precio</h2>
          <p className="text-sm text-gray-500">Configure cambios de precio automáticos por fecha y hora</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addSchedule}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
          {hasChanges && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </motion.button>
          )}
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hay cambios de precio programados</p>
          <button onClick={addSchedule} className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
            Agregar el primero
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Combustible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nuevo Precio (RD$)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora de Aplicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schedules.map((schedule, idx) => (
                <tr key={schedule.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button onClick={() => updateSchedule(idx, 'Enabled', !schedule.Enabled)}>
                      {schedule.Enabled ? (
                        <ToggleRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={schedule.FuelGradeId}
                      onChange={(e) => updateSchedule(idx, 'FuelGradeId', Number(e.target.value))}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {grades.map((g) => (
                        <option key={g.Id} value={g.Id}>{g.Name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={schedule.Price}
                      onChange={(e) => updateSchedule(idx, 'Price', parseFloat(e.target.value) || 0)}
                      className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="datetime-local"
                      value={schedule.DateTime?.slice(0, 16) || ''}
                      onChange={(e) => updateSchedule(idx, 'DateTime', e.target.value + ':00')}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => removeSchedule(idx)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-start gap-2 text-sm text-gray-500">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>Los cambios de precio programados se aplicarán automáticamente a la fecha y hora indicada. Active el toggle para habilitar cada programación.</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Componente de carga
// ============================================================

const LoadingCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-12 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-500 text-sm">Cargando datos...</p>
    </div>
  </div>
);

export default PricesSection;
