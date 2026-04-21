import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Droplets, Thermometer, AlertTriangle, Container } from 'lucide-react';
import {
  getTanksConfig,
  getProbeMeasurements,
  getFuelGradesConfig,
  p,
} from '../../../services/dispenserService';

const POLLING_INTERVAL = 10000;

// SVG de tanque horizontal (capsule) tipo UST con fill animado
const TankSVG: React.FC<{
  percent: number;
  levelKind: 'normal' | 'low' | 'critical' | 'high' | 'no-data';
  hasWater: boolean;
  waterPercent: number;
  lowMarkPercent?: number | null;
  highMarkPercent?: number | null;
}> = ({ percent, levelKind, hasWater, waterPercent, lowMarkPercent, highMarkPercent }) => {
  const colors: Record<string, { main: string; top: string; shadow: string }> = {
    normal:   { main: '#3b82f6', top: '#60a5fa', shadow: '#1d4ed8' },
    low:      { main: '#f97316', top: '#fb923c', shadow: '#c2410c' },
    high:     { main: '#eab308', top: '#facc15', shadow: '#a16207' },
    critical: { main: '#dc2626', top: '#ef4444', shadow: '#991b1b' },
    'no-data': { main: '#9ca3af', top: '#d1d5db', shadow: '#6b7280' },
  };
  const c = colors[levelKind];

  // Capsule body: x=10..90 (width 80), y=10..40 (height 30). rx = 15
  const bodyX = 10;
  const bodyY = 10;
  const bodyW = 80;
  const bodyH = 30;
  const radius = bodyH / 2;

  // Nivel de fuel (desde abajo de la capsule)
  const fuelHeight = (percent / 100) * bodyH;
  const fuelY = bodyY + bodyH - fuelHeight;
  const waterH = hasWater ? Math.min(3, (waterPercent / 100) * bodyH) : 0;

  const lowY = lowMarkPercent != null ? bodyY + bodyH - (lowMarkPercent / 100) * bodyH : null;
  const highY = highMarkPercent != null ? bodyY + bodyH - (highMarkPercent / 100) * bodyH : null;

  const uid = React.useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 100 52" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Gradiente metálico horizontal del cuerpo */}
        <linearGradient id={`body-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="15%" stopColor="#f1f5f9" />
          <stop offset="40%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        {/* Gradiente del fuel (con profundidad arriba-abajo) */}
        <linearGradient id={`fuel-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.top} />
          <stop offset="50%" stopColor={c.main} />
          <stop offset="100%" stopColor={c.shadow} />
        </linearGradient>
        {/* Clip de la capsule */}
        <clipPath id={`clip-${uid}`}>
          <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx={radius} ry={radius} />
        </clipPath>
      </defs>

      {/* Sombra en el piso */}
      <ellipse cx="50" cy="50.5" rx="38" ry="1" fill="#000" opacity="0.2" />

      {/* Soportes (patas / bases) */}
      <path d="M 18,39 L 20,47 L 28,47 L 30,39 Z" fill="#64748b" stroke="#475569" strokeWidth="0.3" />
      <path d="M 70,39 L 72,47 L 80,47 L 82,39 Z" fill="#64748b" stroke="#475569" strokeWidth="0.3" />
      {/* Base horizontal conectando patas */}
      <rect x="16" y="47" width="68" height="1.5" rx="0.3" fill="#475569" />

      {/* Tubería de llenado (vertical arriba) */}
      <rect x="26" y="3" width="3" height="8" fill="#6b7280" />
      <rect x="24.5" y="2" width="6" height="1.5" fill="#94a3b8" />
      {/* Válvula */}
      <circle cx="27.5" cy="6" r="1.2" fill="#cbd5e1" stroke="#475569" strokeWidth="0.3" />

      {/* Sonda / gauge arriba */}
      <rect x="47" y="5" width="2" height="6" fill="#6b7280" />
      <rect x="45" y="2" width="6" height="3.5" rx="0.5" fill="#1e293b" stroke="#475569" strokeWidth="0.3" />
      <circle cx="48" cy="3.8" r="0.7" fill={percent > 0 ? '#22c55e' : '#6b7280'}>
        {percent > 0 && <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />}
      </circle>

      {/* Ventilación del otro lado */}
      <rect x="70" y="4" width="2" height="7" fill="#6b7280" />
      <circle cx="71" cy="3.5" r="1.3" fill="#94a3b8" stroke="#475569" strokeWidth="0.3" />

      {/* Cuerpo (capsule) con gradiente metálico */}
      <rect
        x={bodyX} y={bodyY} width={bodyW} height={bodyH}
        rx={radius} ry={radius}
        fill={`url(#body-${uid})`}
        stroke="#475569" strokeWidth="0.6"
      />

      {/* Fuel fill (clipado a la capsule) */}
      <g clipPath={`url(#clip-${uid})`}>
        {/* Capa principal del fuel */}
        <rect x={bodyX} y={fuelY} width={bodyW} height={fuelHeight} fill={`url(#fuel-${uid})`} />

        {/* Capa de agua al fondo */}
        {hasWater && waterH > 0 && (
          <rect x={bodyX} y={bodyY + bodyH - waterH} width={bodyW} height={waterH} fill="#1e293b" opacity="0.9" />
        )}

        {/* Onda animada sobre el fuel */}
        {percent > 0 && percent < 100 && (
          <g>
            <path
              d={`M ${bodyX - 5} ${fuelY} Q ${bodyX + 12} ${fuelY - 1.3} ${bodyX + 25} ${fuelY} T ${bodyX + 52} ${fuelY} T ${bodyX + 80} ${fuelY} T ${bodyX + 100} ${fuelY} L ${bodyX + 100} ${fuelY + 1.5} Q ${bodyX + 80} ${fuelY + 0.5} ${bodyX + 52} ${fuelY + 1.5} T ${bodyX - 5} ${fuelY + 1.5} Z`}
              fill={c.top}
              opacity="0.85"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="-6 0;6 0;-6 0"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        )}

        {/* Highlight reflejo superior */}
        <ellipse cx={bodyX + bodyW / 2} cy={bodyY + 2} rx={bodyW / 3} ry="1.2" fill="#fff" opacity="0.35" />
      </g>

      {/* Marcadores de alarma (dashed, dentro del cuerpo) */}
      {lowY != null && (
        <line
          x1={bodyX + 2} y1={lowY} x2={bodyX + bodyW - 2} y2={lowY}
          stroke="#f97316" strokeWidth="0.5" strokeDasharray="1.5 1" opacity="0.85"
        />
      )}
      {highY != null && (
        <line
          x1={bodyX + 2} y1={highY} x2={bodyX + bodyW - 2} y2={highY}
          stroke="#eab308" strokeWidth="0.5" strokeDasharray="1.5 1" opacity="0.85"
        />
      )}

      {/* Línea de costura / detalles de manufactura */}
      <line x1={bodyX + bodyW / 2} y1={bodyY} x2={bodyX + bodyW / 2} y2={bodyY + bodyH} stroke="#475569" strokeWidth="0.25" opacity="0.5" strokeDasharray="0.8 0.8" />

      {/* Etiqueta/placa con % */}
      <rect x="43" y="22" width="14" height="7" rx="1" fill="#0f172a" opacity="0.8" />
      <text
        x="50" y="27.5" textAnchor="middle"
        fontSize="5.2" fontFamily="ui-monospace, monospace"
        fontWeight="bold" fill={c.top} letterSpacing="0.3"
      >
        {percent.toFixed(0)}%
      </text>
    </svg>
  );
};

const TanksSidebar: React.FC = () => {
  const [tanks, setTanks] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<Map<number, any>>(new Map());
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

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

  return (
    <div className="bg-white rounded-sm border border-table-border flex flex-col overflow-hidden sticky top-2 h-[calc(100vh-160px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Container className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-wide text-text-primary">
            Tanques
          </span>
          <span className="text-2xs text-text-muted">({tanks.length})</span>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40"
          title="Actualizar"
        >
          <RefreshCw className={`w-3 h-3 ${loading && tanks.length === 0 ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-1 space-y-1 min-h-0">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-2xs text-red-700">
            {error}
          </div>
        )}

        {loading && tanks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          </div>
        ) : tanks.length === 0 ? (
          <div className="text-center py-8 text-2xs text-gray-500">
            <Droplets className="w-5 h-5 mx-auto mb-1 opacity-30" />
            Sin tanques configurados
          </div>
        ) : (
          tanks.map((rawTank: any, idx: number) => {
            const tank = p(rawTank);
            const tankId = tank.Id || idx + 1;
            const tankName = tank.Name || `Tanque ${tankId}`;
            const tankCapacity = tank.Capacity || 0;
            const tankHeightMm = tank.TankHeight || 0;
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
              (m && (productHeight <= critLow || productHeight >= critHigh || alarms.length > 0));

            let levelKind: 'normal' | 'low' | 'critical' | 'high' | 'no-data' = 'normal';
            let levelTextColor = 'text-blue-700';
            if (!m) { levelKind = 'no-data'; levelTextColor = 'text-gray-500'; }
            else if (productHeight <= critLow || productHeight >= critHigh) { levelKind = 'critical'; levelTextColor = 'text-red-700'; }
            else if (productHeight <= low) { levelKind = 'low'; levelTextColor = 'text-orange-700'; }
            else if (productHeight >= high) { levelKind = 'high'; levelTextColor = 'text-yellow-700'; }

            // Calcular % para marcadores de alarma sobre la altura total del tanque
            const lowMarkPercent = tankHeightMm > 0 && low > 0 ? (low / tankHeightMm) * 100 : null;
            const highMarkPercent = tankHeightMm > 0 && high < 99999 ? (high / tankHeightMm) * 100 : null;
            const waterPercentOfTank = tankHeightMm > 0 ? (waterHeight / tankHeightMm) * 100 : 0;

            return (
              <div
                key={tankId}
                className={`rounded-sm border p-1.5 bg-white ${hasAlarm ? 'border-red-300 shadow-sm shadow-red-100' : 'border-gray-200'}`}
              >
                {/* Header compacto */}
                <div className="flex items-center justify-between mb-1 gap-1">
                  <div className="min-w-0 flex items-center gap-1.5">
                    <h4 className="text-xs font-semibold text-text-primary truncate">{tankName}</h4>
                    <span className="text-[9px] text-text-muted truncate">· {getGradeName(tankFuelGradeId)}</span>
                  </div>
                  {hasAlarm && <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse flex-shrink-0" />}
                </div>

                {/* Layout horizontal: SVG izquierda + datos derecha */}
                <div className="flex items-center gap-2">
                  <div className="w-20 flex-shrink-0">
                    <TankSVG
                      percent={percent}
                      levelKind={levelKind}
                      hasWater={waterHeight > 0}
                      waterPercent={waterPercentOfTank}
                      lowMarkPercent={lowMarkPercent}
                      highMarkPercent={highMarkPercent}
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-sm font-bold tabular-nums ${levelTextColor}`}>
                        {percent.toFixed(0)}%
                      </span>
                      <span className="text-[9px] text-text-muted tabular-nums truncate">
                        {m ? `${productVolume.toFixed(0)}/${tankCapacity.toLocaleString()}G` : '-/-'}
                      </span>
                    </div>

                    {m ? (
                      <>
                        <div className="flex items-center gap-2 text-[9px] text-text-muted">
                          <span className="flex items-center gap-0.5">
                            <Thermometer className="w-2.5 h-2.5 text-orange-500" />
                            {temperature.toFixed(1)}°
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Droplets className="w-2.5 h-2.5 text-blue-400" />
                            {waterHeight.toFixed(1)}mm
                          </span>
                        </div>
                        {alarms.length > 0 && (
                          <div className="flex flex-wrap gap-0.5">
                            {alarms.slice(0, 2).map((alarm: string, i: number) => (
                              <span key={i} className="inline-flex items-center px-0.5 text-[8px] bg-red-100 text-red-700 rounded-sm truncate max-w-full">
                                {alarm}
                              </span>
                            ))}
                            {alarms.length > 2 && (
                              <span className="text-[8px] text-red-600">+{alarms.length - 2}</span>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-[9px] text-gray-400 italic">Sin datos</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-2 py-1 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-[10px] text-text-muted flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Normal</span>
          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Bajo</span>
          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Crítico</span>
        </div>
        <span className="opacity-75">10s</span>
      </div>
    </div>
  );
};

export default TanksSidebar;
