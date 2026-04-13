import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Download, Fuel, Droplets, Truck, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getPumpTransactionsReport,
  getTankMeasurementsReport,
  getInTankDeliveriesReport,
  prop,
} from '../../../services/dispenserService';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import type { ReportDateFilter } from '../../../types/dispenser';
import { useHeader } from '../../../context/HeaderContext';

type ReportType = 'pump-transactions' | 'tank-measurements' | 'in-tank-deliveries';

const REPORT_TYPES: { key: ReportType; label: string; icon: React.ElementType }[] = [
  { key: 'pump-transactions', label: 'Transacciones de Bomba', icon: Fuel },
  { key: 'tank-measurements', label: 'Mediciones de Tanque', icon: Droplets },
  { key: 'in-tank-deliveries', label: 'Entregas en Tanque', icon: Truck },
];

const ReportsSection: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('pump-transactions');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const [pumpTransactions, setPumpTransactions] = useState<PumpTransactionReport[]>([]);
  const [tankMeasurements, setTankMeasurements] = useState<TankMeasurementReport[]>([]);
  const [deliveries, setDeliveries] = useState<InTankDeliveryReport[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const { setSubtitle } = useHeader();
  React.useEffect(() => {
    setSubtitle('Reportes del controlador PTS');
    return () => { setSubtitle(''); };
  }, [setSubtitle]);

  const buildFilter = (): ReportDateFilter | undefined => {
    if (!startDate && !endDate) return undefined;
    return {
      StartDateTime: startDate ? `${startDate}T00:00:00` : '',
      EndDateTime: endDate ? `${endDate}T23:59:59` : '',
    };
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    const filter = buildFilter();

    try {
      switch (reportType) {
        case 'pump-transactions': {
          const data = await getPumpTransactionsReport(filter);
          setPumpTransactions(data);
          break;
        }
        case 'tank-measurements': {
          const data = await getTankMeasurementsReport(filter);
          setTankMeasurements(data);
          break;
        }
        case 'in-tank-deliveries': {
          const data = await getInTankDeliveriesReport(filter);
          setDeliveries(data);
          break;
        }
      }
    } catch {
      toast.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    let csv = '';
    let filename = '';

    if (reportType === 'pump-transactions') {
      csv = 'Bomba,Pistola,Combustible,Volumen,Precio,Monto,Transaccion,Fecha,Tag\n';
      csv += pumpTransactions.map((r: any) =>
        `${prop(r,'Pump')},${prop(r,'Nozzle')},"${prop(r,'FuelGradeName')}",${prop(r,'Volume')},${prop(r,'Price')},${prop(r,'Amount')},${prop(r,'Transaction')},"${prop(r,'DateTime')}","${prop(r,'Tag') || ''}"`
      ).join('\n');
      filename = 'transacciones_bomba.csv';
    } else if (reportType === 'tank-measurements') {
      csv = 'Sonda,Fecha,Altura Producto,Volumen,Altura Agua,Temperatura\n';
      csv += tankMeasurements.map((r: any) =>
        `${prop(r,'Probe')},"${prop(r,'DateTime')}",${prop(r,'ProductHeight')},${prop(r,'ProductVolume')},${prop(r,'WaterHeight')},${prop(r,'Temperature')}`
      ).join('\n');
      filename = 'mediciones_tanque.csv';
    } else {
      csv = 'Tanque,Fecha,Vol. Inicio,Vol. Final,Vol. Entregado,Combustible\n';
      csv += deliveries.map((r: any) =>
        `${prop(r,'Tank')},"${prop(r,'DateTime')}",${prop(r,'StartVolume')},${prop(r,'EndVolume')},${prop(r,'DeliveredVolume')},"${prop(r,'FuelGradeName')}"`
      ).join('\n');
      filename = 'entregas_tanque.csv';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte exportado');
  };

  const hasResults = reportType === 'pump-transactions' ? pumpTransactions.length > 0
    : reportType === 'tank-measurements' ? tankMeasurements.length > 0
    : deliveries.length > 0;

  const formatDate = (dt: string) => {
    try { return new Date(dt).toLocaleString('es-DO'); } catch { return dt; }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reportes PTS</h1>
        <p className="text-gray-600 text-sm">Reportes de transacciones, mediciones de tanque y entregas</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tipo de reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
            <select
              value={reportType}
              onChange={(e) => { setReportType(e.target.value as ReportType); setHasSearched(false); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {REPORT_TYPES.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones */}
          <div className="flex items-end gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Generar
            </motion.button>
            {hasResults && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resultados */}
      <AnimatePresence mode="wait">
        {hasSearched && (
          <motion.div
            key={reportType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !hasResults ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No se encontraron resultados para este período</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {reportType === 'pump-transactions' && (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Bomba', 'Pistola', 'Combustible', 'Volumen (G.)', 'Precio', 'Monto', 'Trans.', 'Fecha', 'Tag'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pumpTransactions.map((raw: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{prop(raw, 'Pump')}</td>
                          <td className="px-4 py-3 text-sm">{prop(raw, 'Nozzle')}</td>
                          <td className="px-4 py-3 text-sm">{mapFuelProductName(prop(raw, 'FuelGradeName'))}</td>
                          <td className="px-4 py-3 text-sm">{Number(prop(raw, 'Volume') || 0).toFixed(3)}</td>
                          <td className="px-4 py-3 text-sm">{formatCurrency(prop(raw, 'Price') || 0)}</td>
                          <td className="px-4 py-3 text-sm font-medium">{formatCurrency(prop(raw, 'Amount') || 0)}</td>
                          <td className="px-4 py-3 text-sm">{prop(raw, 'Transaction')}</td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(prop(raw, 'DateTime') || '')}</td>
                          <td className="px-4 py-3 text-sm font-mono">{prop(raw, 'Tag') || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {reportType === 'tank-measurements' && (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Sonda', 'Fecha', 'Altura (mm)', 'Volumen (G.)', 'Agua (mm)', 'Temp (°C)'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tankMeasurements.map((raw: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{prop(raw, 'Probe')}</td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(prop(raw, 'DateTime') || '')}</td>
                          <td className="px-4 py-3 text-sm">{Number(prop(raw, 'ProductHeight') || 0).toFixed(1)}</td>
                          <td className="px-4 py-3 text-sm">{Number(prop(raw, 'ProductVolume') || 0).toFixed(1)}</td>
                          <td className="px-4 py-3 text-sm">{Number(prop(raw, 'WaterHeight') || 0).toFixed(1)}</td>
                          <td className="px-4 py-3 text-sm">{Number(prop(raw, 'Temperature') || 0).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {reportType === 'in-tank-deliveries' && (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Tanque', 'Fecha', 'Vol. Inicio (G.)', 'Vol. Final (G.)', 'Entregado (G.)', 'Combustible'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {deliveries.map((raw: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{prop(raw, 'Tank')}</td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(prop(raw, 'DateTime') || '')}</td>
                          <td className="px-4 py-3 text-sm">{Number(prop(raw, 'StartVolume') || 0).toFixed(1)}</td>
                          <td className="px-4 py-3 text-sm">{Number(prop(raw, 'EndVolume') || 0).toFixed(1)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-700">{Number(prop(raw, 'DeliveredVolume') || 0).toFixed(1)}</td>
                          <td className="px-4 py-3 text-sm">{mapFuelProductName(prop(raw, 'FuelGradeName'))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {hasResults && (
              <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
                {reportType === 'pump-transactions' && `${pumpTransactions.length} transacciones encontradas`}
                {reportType === 'tank-measurements' && `${tankMeasurements.length} mediciones encontradas`}
                {reportType === 'in-tank-deliveries' && `${deliveries.length} entregas encontradas`}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsSection;
