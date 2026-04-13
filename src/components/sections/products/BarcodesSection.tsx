import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { barcodeService } from '../../../services/barcodeService';
import { IBarcode } from '../../../types/barcode';
import BarcodeModal from './BarcodeModal';
import { CompactButton } from '../../ui';
import Toolbar from '../../ui/Toolbar';

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
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar barcode, producto o variante..."
        chips={[
          { label: 'Total', value: barcodes.length, color: 'orange' },
        ]}
      >
        <CompactButton
          variant="primary"
          onClick={() => setModal({ show: true, barcode: null })}
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo
        </CompactButton>
        <CompactButton
          variant="ghost"
          onClick={load}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </Toolbar>

      {/* Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center h-40 items-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  {['Barcode ID', 'Producto ID', 'Variante', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-2 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.barcodeId} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover">
                    <td className="px-2 text-sm whitespace-nowrap font-mono text-gray-900">{b.barcodeId}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-600">{b.productId}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-500 text-ellipsis overflow-hidden">{b.variantName || '—'}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <CompactButton
                          variant="icon"
                          onClick={() => setModal({ show: true, barcode: b })}
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                        </CompactButton>
                        <CompactButton
                          variant="icon"
                          onClick={() => handleDelete(b.barcodeId)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </CompactButton>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-2 py-6 text-center text-xs text-gray-400">Sin barcodes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.show && <BarcodeModal barcode={modal.barcode} onClose={() => setModal({ show: false, barcode: null })} onSaved={() => { setModal({ show: false, barcode: null }); load(); }} />}
    </div>
  );
};

export default BarcodesSection;
