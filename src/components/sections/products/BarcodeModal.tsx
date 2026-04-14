import React, { useState } from 'react';
import { X, Save, Barcode, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { barcodeService } from '../../../services/barcodeService';
import { IBarcode } from '../../../types/barcode';
import { CompactButton } from '../../ui';

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

  const inputCls = 'w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <Barcode className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{isEdit ? 'Editar Barcode' : 'Nuevo Barcode'}</h3>
              <p className="text-2xs text-text-muted">{isEdit ? 'Modificar código' : 'Registrar nuevo código'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Barcode ID</label>
            <input value={form.barcodeId} onChange={e => setForm(f => ({ ...f, barcodeId: e.target.value }))} disabled={isEdit} required className={inputCls} />
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Producto ID</label>
            <input value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} required className={inputCls} />
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Variante</label>
            <input value={form.variantName} onChange={e => setForm(f => ({ ...f, variantName: e.target.value }))} className={inputCls} placeholder="Opcional" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>Cancelar</CompactButton>
          <CompactButton type="submit" variant="primary" disabled={saving}>
            {saving ? <><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</> : <><Save className="w-3 h-3" /> Guardar</>}
          </CompactButton>
        </div>
      </form>
    </div>
  );
};

export default BarcodeModal;
