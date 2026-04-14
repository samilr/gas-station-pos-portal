import React, { useState, useEffect, useCallback } from 'react';
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
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

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
      setError(err instanceof Error ? err.message : 'Error de conexion');
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
      <div className="bg-white rounded-sm border border-table-border p-4 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar>
        <CompactButton variant="icon" onClick={loadData}>
          <RefreshCw className="w-3.5 h-3.5" />
        </CompactButton>
      </Toolbar>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-2 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-red-700 text-xs">{error}</p>
        </div>
      )}

      {/* Grid de tanques */}
      {tanks.length === 0 ? (
        <div className="bg-white rounded-sm border border-table-border p-4 text-center text-gray-500">
          <Droplets className="w-6 h-6 mx-auto mb-1 opacity-30" />
          <p className="text-xs">No se encontraron tanques configurados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
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
              <div
                key={tankId}
                className={`bg-white rounded-sm p-2 border ${
                  hasAlarm && m ? 'border-red-300' : 'border-table-border'
                }`}
              >
                {/* Header del tanque */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{tankName}</h3>
                    <p className="text-[10px] text-gray-500">{getGradeName(tankFuelGradeId)}</p>
                  </div>
                  {hasAlarm && m && (
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                  )}
                </div>

                {/* Visualizacion del tanque */}
                <div className="flex items-end gap-2 mb-2">
                  <div className="relative w-12 h-24 bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                    <div
                      style={{ height: `${percent}%` }}
                      className={`absolute bottom-0 left-0 right-0 ${levelColor} transition-all duration-1000`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700 bg-white/70 px-0.5 rounded">
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div>
                      <p className="text-[10px] text-gray-500">Volumen</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {m ? `${productVolume.toFixed(0)} G.` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Capacidad</p>
                      <p className="text-xs text-gray-600">{tankCapacity.toLocaleString()} G.</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Altura</p>
                      <p className="text-xs text-gray-600">
                        {m ? `${productHeight.toFixed(1)} mm` : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datos adicionales */}
                {m && (
                  <div className="grid grid-cols-2 gap-1 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] text-gray-600">{temperature.toFixed(1)}C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] text-gray-600">Agua: {waterHeight.toFixed(1)}mm</span>
                    </div>
                    {alarms.length > 0 && (
                      <div className="col-span-2 mt-0.5 flex flex-wrap gap-1">
                        {alarms.map((alarm: string, i: number) => (
                          <StatusDot key={i} color="red" label={alarm} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!m && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 text-center">Sonda sin datos</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="flex items-center flex-wrap gap-3 px-2 py-1 text-xs text-text-muted">
        <StatusDot color="blue" label="Normal" />
        <StatusDot color="orange" label="Bajo" />
        <StatusDot color="red" label="Critico" />
        <span className="ml-auto text-2xs opacity-75">Actualizacion cada 10s</span>
      </div>
    </div>
  );
};

export default TanksSection;
