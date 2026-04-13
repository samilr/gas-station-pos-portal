import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, RefreshCw, Fuel, Gauge, Radio, MonitorSpeaker } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getPumpsConfig,
  getNozzlesConfig,
  getFuelGradesConfig,
  getProbesConfig,
  getReadersConfig,
  getPriceBoardsConfig,
  prop,
} from '../../../services/dispenserService';
import { useHeader } from '../../../context/HeaderContext';

type Tab = 'pumps' | 'nozzles' | 'fuel-grades' | 'probes' | 'readers' | 'price-boards';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'pumps', label: 'Bombas', icon: Fuel },
  { key: 'nozzles', label: 'Pistolas', icon: Gauge },
  { key: 'fuel-grades', label: 'Grados', icon: Fuel },
  { key: 'probes', label: 'Sondas', icon: Wrench },
  { key: 'readers', label: 'Lectores', icon: Radio },
  { key: 'price-boards', label: 'Paneles', icon: MonitorSpeaker },
];

// Helper para convertir arrays o valores a string seguro
const safeJoin = (val: any): string => {
  if (Array.isArray(val)) return val.join(', ');
  if (val != null) return String(val);
  return '-';
};

const safeStr = (val: any): string => (val != null ? String(val) : '-');

const safeBool = (val: any): string => val ? 'Sí' : 'No';

const safeFixed = (val: any, digits: number): string => {
  const n = Number(val);
  return isNaN(n) ? '-' : n.toFixed(digits);
};

const HardwareSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('pumps');
  const { setSubtitle } = useHeader();

  useEffect(() => {
    setSubtitle('Configuración de hardware del controlador PTS');
    return () => { setSubtitle(''); };
  }, [setSubtitle]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Configuración de Hardware</h1>
        <p className="text-gray-600 text-sm">Bombas, pistolas, grados de combustible, sondas, lectores y paneles de precios</p>

        <div className="flex gap-1 mt-4 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {activeTab === 'pumps' && <PumpsTab />}
          {activeTab === 'nozzles' && <NozzlesTab />}
          {activeTab === 'fuel-grades' && <FuelGradesTab />}
          {activeTab === 'probes' && <ProbesTab />}
          {activeTab === 'readers' && <ReadersTab />}
          {activeTab === 'price-boards' && <PriceBoardsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// Tab: Bombas
// ============================================================
const PumpsTab: React.FC = () => {
  const [ports, setPorts] = useState<any[]>([]);
  const [pumps, setPumps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPumpsConfig();
      if (data) {
        setPorts(data.Ports || []);
        setPumps(data.Pumps || []);
      }
    } catch { toast.error('Error al cargar configuración de bombas'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Puertos Serie</h3>
          <button onClick={load} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <TableWrapper
          headers={['ID', 'Protocolo', 'Baud Rate']}
          rows={ports.map((raw) => [
            safeStr(prop(raw, 'Id')),
            safeStr(prop(raw, 'Protocol')),
            safeStr(prop(raw, 'BaudRate')),
          ])}
        />
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Bombas ({pumps.length})</h3>
        </div>
        <TableWrapper
          headers={['ID', 'Dirección', 'Puerto', 'Grados', 'Lock por Defecto', 'Auth Requerida']}
          rows={pumps.map((raw) => [
            safeStr(prop(raw, 'Id')),
            safeStr(prop(raw, 'Address')),
            safeStr(prop(raw, 'Port')),
            safeJoin(prop(raw, 'FuelGradeIds')),
            safeBool(prop(raw, 'LockByDefault')),
            safeBool(prop(raw, 'AuthorizationRequired')),
          ])}
        />
      </div>
    </div>
  );
};

// ============================================================
// Tab: Pistolas
// ============================================================
const NozzlesTab: React.FC = () => {
  const [nozzles, setNozzles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNozzlesConfig().then(setNozzles).catch(() => toast.error('Error')).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Configuración de Pistolas ({nozzles.length} bombas)</h3>
      </div>
      <TableWrapper
        headers={['Bomba', 'Grados de Combustible', 'Tanques']}
        rows={nozzles.map((raw) => [
          `Bomba ${safeStr(prop(raw, 'PumpId'))}`,
          safeJoin(prop(raw, 'FuelGradeIds')),
          safeJoin(prop(raw, 'TankIds')),
        ])}
      />
    </div>
  );
};

// ============================================================
// Tab: Grados de Combustible
// ============================================================
const FuelGradesTab: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFuelGradesConfig().then(setGrades).catch(() => toast.error('Error')).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Grados de Combustible</h3>
      </div>
      <TableWrapper
        headers={['ID', 'Nombre', 'Precio (RD$)', 'Coef. Expansión']}
        rows={grades.map((raw) => [
          safeStr(prop(raw, 'Id')),
          safeStr(prop(raw, 'Name')),
          safeFixed(prop(raw, 'Price'), 2),
          safeFixed(prop(raw, 'ExpansionCoefficient'), 5),
        ])}
      />
    </div>
  );
};

// ============================================================
// Tab: Sondas
// ============================================================
const ProbesTab: React.FC = () => {
  const [probes, setProbes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProbesConfig().then(setProbes).catch(() => toast.error('Error')).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Sondas ATG</h3>
      </div>
      <TableWrapper
        headers={['ID', 'Tanque', 'Protocolo', 'Puerto', 'Dirección', 'Habilitada']}
        rows={probes.map((raw) => [
          safeStr(prop(raw, 'Id')),
          safeStr(prop(raw, 'TankId')),
          safeStr(prop(raw, 'Protocol')),
          safeStr(prop(raw, 'Port')),
          safeStr(prop(raw, 'Address')),
          safeBool(prop(raw, 'Enabled')),
        ])}
      />
    </div>
  );
};

// ============================================================
// Tab: Lectores RFID
// ============================================================
const ReadersTab: React.FC = () => {
  const [readers, setReaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReadersConfig().then(setReaders).catch(() => toast.error('Error')).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Lectores RFID</h3>
      </div>
      <TableWrapper
        headers={['ID', 'Protocolo', 'Puerto', 'Dirección', 'Bombas', 'Habilitado']}
        rows={readers.map((raw) => [
          safeStr(prop(raw, 'Id')),
          safeStr(prop(raw, 'Protocol')),
          safeStr(prop(raw, 'Port')),
          safeStr(prop(raw, 'Address')),
          safeJoin(prop(raw, 'PumpIds')),
          safeBool(prop(raw, 'Enabled')),
        ])}
      />
    </div>
  );
};

// ============================================================
// Tab: Paneles de Precios
// ============================================================
const PriceBoardsTab: React.FC = () => {
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPriceBoardsConfig().then(setBoards).catch(() => toast.error('Error')).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Paneles de Precios Digitales</h3>
      </div>
      <TableWrapper
        headers={['ID', 'Protocolo', 'Puerto', 'Dirección', 'Grado', 'Habilitado']}
        rows={boards.map((raw) => [
          safeStr(prop(raw, 'Id')),
          safeStr(prop(raw, 'Protocol')),
          safeStr(prop(raw, 'Port')),
          safeStr(prop(raw, 'Address')),
          safeStr(prop(raw, 'FuelGradeId')),
          safeBool(prop(raw, 'Enabled')),
        ])}
      />
    </div>
  );
};

// ============================================================
// Componentes auxiliares
// ============================================================

const TableWrapper: React.FC<{ headers: string[]; rows: string[][] }> = ({ headers, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          {headers.map((h) => (
            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} className="px-6 py-8 text-center text-gray-400 text-sm">Sin datos</td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-6 py-3 text-sm text-gray-700 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-8 flex items-center justify-center">
    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default HardwareSection;
