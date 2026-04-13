import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { barcodeService } from '../../../services/barcodeService';
import { IBarcode } from '../../../types/barcode';

interface Props { barcode: IBarcode | null; onClose: () => void; onSaved: () => void; }

const BarcodeModal: React.FC<Props> = ({ barcode, onClose, onSaved }) => {
  const isEdit = !!barcode;
  const [form, setForm] = useState({ barcodeId: barcode?.barcodeId || '', productId: barcode?.productId || '', variantName: barcode?.variantName || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = isEdit
      ? await barcodeService.updateBarcode(form.barcodeId, { productId: form.productId, variantName: form.variantName || null })
      : await barcodeService.createBarcode({ ...form, variantName: form.variantName || null });
    setSaving(false);
    if (res.successful) { toast.success(isEdit ? 'Barcode actualizado' : 'Barcode creado'); onSaved(); }
    else toast.error(res.error || 'Error al guardar');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Editar Barcode' : 'Nuevo Barcode'}</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div><label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">Barcode ID</label>
            <input value={form.barcodeId} onChange={e => setForm(f => ({ ...f, barcodeId: e.target.value }))} disabled={isEdit} required className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50" /></div>
          <div><label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">Producto ID</label>
            <input value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} required className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div><label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">Variante</label>
            <input value={form.variantName} onChange={e => setForm(f => ({ ...f, variantName: e.target.value }))} className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Opcional" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="h-7 px-3 text-sm rounded-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 h-7 px-3 text-sm rounded-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60">
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BarcodeModal;
