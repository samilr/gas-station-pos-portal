import React, { useState, useEffect, useCallback } from 'react';
import { Barcode, Plus, Edit2, Trash2, RefreshCw, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { barcodeService } from '../../../services/barcodeService';
import { IBarcode } from '../../../types/barcode';
import BarcodeModal from './BarcodeModal';

const BarcodesSection: React.FC = () => {
  const [barcodes, setBarcodes] = useState<IBarcode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ show: boolean; barcode: IBarcode | null }>({ show: false, barcode: null });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await barcodeService.getBarcodes();
    setBarcodes(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm(`¿Eliminar barcode ${id}?`)) return;
    const r = await barcodeService.deleteBarcode(id);
    if (r.successful) { toast.success('Eliminado'); load(); } else toast.error(r.error || 'Error');
  };

  const filtered = barcodes.filter(b =>
    b.barcodeId.toLowerCase().includes(search.toLowerCase()) ||
    b.productId.toLowerCase().includes(search.toLowerCase()) ||
    (b.variantName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Barcode className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Barcodes</h1>
              <p className="text-sm text-gray-500">{barcodes.length} códigos de barras</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal({ show: true, barcode: null })}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm"><Plus className="w-4 h-4" />Nuevo</button>
            <button onClick={load} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input placeholder="Buscar barcode, producto o variante..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? <div className="flex justify-center h-40 items-center"><div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full" /></div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                {['Barcode ID', 'Producto ID', 'Variante', 'Acciones'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((b, i) => (
                  <motion.tr key={b.barcodeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{b.barcodeId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.productId}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{b.variantName || '—'}</td>
                    <td className="px-6 py-4"><div className="flex gap-2">
                      <button onClick={() => setModal({ show: true, barcode: b })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(b.barcodeId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">Sin barcodes</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {modal.show && <BarcodeModal barcode={modal.barcode} onClose={() => setModal({ show: false, barcode: null })} onSaved={() => { setModal({ show: false, barcode: null }); load(); }} />}
    </div>
  );
};

export default BarcodesSection;
