import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getTanksConfig,
  getProbeMeasurements,
  getFuelGradesConfig,
  p,
} from '../../../services/dispenserService';
import type {
  TankConfig,
  ProbeMeasurementsData,
  FuelGradeConfig,
} from '../../../types/dispenser';
import { useHeader } from '../../../context/HeaderContext';

const POLLING_INTERVAL = 10000;

const TanksSection: React.FC = () => {
  const [tanks, setTanks] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<Map<number, any>>(new Map());
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setSubtitle } = useHeader();

  useEffect(() => {
    setSubtitle('Monitoreo de niveles de tanques de combustible');
    return () => { setSubtitle(''); };
  }, [setSubtitle]);

  const fetchingRef = React.useRef(false);

  const loadData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setError(null);
      const [tanksData, gradesData] = await Promise.all([
        getTanksConfig(),
        getFuelGradesConfig(),
      ]);
      setTanks(tanksData);
      setGrades(gradesData);

      const measureMap = new Map<number, any>();
      await Promise.all(
        tanksData.map(async (tank: any) => {
          const t = p(tank);
          const tankId = t.Id;
          if (!tankId) return;
          try {
            const m = await getProbeMeasurements(tankId);
            if (m) measureMap.set(tankId, m);
          } catch {
            // Sonda no disponible
          }
        })
      );
      setMeasurements(measureMap);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  const getGradeName = (gradeId: number) => {
    const grade = grades.find((g: any) => (p(g).Id) === gradeId);
    return grade ? p(grade).Name : `Grado ${gradeId}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Cargando datos de tanques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tanques y Sondas</h1>
            <p className="text-gray-600 text-sm mt-1">Niveles de combustible en tiempo real</p>
          </div>
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Grid de tanques */}
      {tanks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          <Droplets className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No se encontraron tanques configurados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tanks.map((rawTank: any, idx: number) => {
            const tank = p(rawTank);
            const tankId = tank.Id || idx + 1;
            const tankName = tank.Name || `Tanque ${tankId}`;
            const tankCapacity = tank.Capacity || 0;
            const tankFuelGradeId = tank.FuelGradeId || 0;
            const critLow = tank.CriticalLowProductAlarmHeight || 0;
            const low = tank.LowProductAlarmHeight || 0;
            const high = tank.HighProductAlarmHeight || 99999;
            const critHigh = tank.CriticalHighProductAlarmHeight || 99999;

            const rawM = measurements.get(tankId);
            const m = rawM ? p(rawM) : null;

            const productVolume = m ? (m.ProductVolume || 0) : 0;
            const productHeight = m ? (m.ProductHeight || 0) : 0;
            const temperature = m ? (m.Temperature || 0) : 0;
            const waterHeight = m ? (m.WaterHeight || 0) : 0;
            const alarms: string[] = m ? (m.Alarms || []) : [];

            const percent = tankCapacity > 0
              ? Math.min(100, Math.max(0, (productVolume / tankCapacity) * 100))
              : 0;

            const hasAlarm =
              productHeight <= critLow ||
              productHeight <= low ||
              productHeight >= critHigh ||
              productHeight >= high ||
              alarms.length > 0;

            let levelColor = 'bg-blue-500';
            if (!m) levelColor = 'bg-gray-300';
            else if (productHeight <= critLow || productHeight >= critHigh) levelColor = 'bg-red-500';
            else if (productHeight <= low) levelColor = 'bg-orange-500';
            else if (productHeight >= high) levelColor = 'bg-yellow-500';

            return (
              <motion.div
                key={tankId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-lg shadow-sm p-5 border-2 ${
                  hasAlarm && m ? 'border-red-300' : 'border-transparent'
                }`}
              >
                {/* Header del tanque */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{tankName}</h3>
                    <p className="text-xs text-gray-500">{getGradeName(tankFuelGradeId)}</p>
                  </div>
                  {hasAlarm && m && (
                    <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                  )}
                </div>

                {/* Visualización del tanque */}
                <div className="flex items-end gap-4 mb-4">
                  <div className="relative w-16 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${percent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`absolute bottom-0 left-0 right-0 ${levelColor} rounded-b-md`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700 bg-white/70 px-1 rounded">
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Volumen</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {m ? `${productVolume.toFixed(0)} G.` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Capacidad</p>
                      <p className="text-sm text-gray-600">{tankCapacity.toLocaleString()} G.</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Altura</p>
                      <p className="text-sm text-gray-600">
                        {m ? `${productHeight.toFixed(1)} mm` : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datos adicionales */}
                {m && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs text-gray-600">{temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-gray-600">Agua: {waterHeight.toFixed(1)}mm</span>
                    </div>
                    {alarms.length > 0 && (
                      <div className="col-span-2 mt-1">
                        {alarms.map((alarm: string, i: number) => (
                          <span key={i} className="inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded mr-1 mb-1">
                            {alarm}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!m && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">Sonda sin datos</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Indicadores de nivel:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="font-semibold text-blue-600">Azul:</span> Nivel normal</li>
              <li><span className="font-semibold text-orange-600">Naranja:</span> Nivel bajo</li>
              <li><span className="font-semibold text-red-600">Rojo:</span> Nivel crítico (bajo o alto)</li>
            </ul>
            <p className="mt-2 text-xs opacity-75">Los datos se actualizan cada 10 segundos</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TanksSection;
