import React, { useState } from 'react';
import { X, Save, CreditCard, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentService } from '../../../services/paymentService';
import { IPayment } from '../../../types/payment';
import { CompactButton } from '../../ui';

interface Props { payment: IPayment | null; onClose: () => void; onSaved: () => void; }

const PAYMENT_TYPES = [
  { value: 1, label: 'Efectivo' }, { value: 2, label: 'Tarjeta Crédito' },
  { value: 3, label: 'Tarjeta Débito' }, { value: 4, label: 'Transferencia' },
  { value: 5, label: 'Cheque' }, { value: 6, label: 'Tickets' },
  { value: 7, label: 'Gift Card' }, { value: 8, label: 'Otro' },
];

const PaymentModal: React.FC<Props> = ({ payment, onClose, onSaved }) => {
  const isEdit = !!payment;
  const [form, setForm] = useState({
    paymentId: payment?.paymentId?.trim() || '',
    name: payment?.name?.trim() || '',
    sequence: payment?.sequence ?? 0,
    paymentType: payment?.paymentType ?? 1,
    image: payment?.image || '',
    currencyId: payment?.currencyId || 'DOP',
    active: payment?.paymentActive ?? payment?.active ?? true,
    isPrepaid: payment?.isPrepaid ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = isEdit
      ? await paymentService.updatePayment(form.paymentId, { name: form.name, sequence: form.sequence, paymentType: form.paymentType, currencyId: form.currencyId, active: form.active, isPrepaid: form.isPrepaid })
      : await paymentService.createPayment(form);
    setSaving(false);
    if (res.successful) { toast.success(isEdit ? 'Actualizado' : 'Creado'); onSaved(); }
    else toast.error(res.error || 'Error al guardar');
  };

  const inputCls = 'w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{isEdit ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}</h3>
              <p className="text-2xs text-text-muted">{isEdit ? 'Modificar configuración' : 'Registrar método'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Payment ID</label>
              <input value={form.paymentId} onChange={e => setForm(f => ({ ...f, paymentId: e.target.value }))} disabled={isEdit} required className={inputCls} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Nombre</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputCls} />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Tipo</label>
              <select value={form.paymentType} onChange={e => setForm(f => ({ ...f, paymentType: Number(e.target.value) }))} className={inputCls}>
                {PAYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Moneda</label>
              <input value={form.currencyId} onChange={e => setForm(f => ({ ...f, currencyId: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Secuencia</label>
            <input type="number" value={form.sequence} onChange={e => setForm(f => ({ ...f, sequence: Number(e.target.value) }))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-100">
            <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Activo
            </label>
            <label className="flex items-start gap-2 text-sm text-text-primary cursor-pointer">
              <input type="checkbox" checked={form.isPrepaid} onChange={e => setForm(f => ({ ...f, isPrepaid: e.target.checked }))}
                className="mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="flex flex-col">
                <span>Prepagado <span className="ml-1 inline-flex px-1 py-0.5 rounded text-2xs font-medium bg-purple-100 text-purple-700">Shell Card / Tickets</span></span>
                <span className="text-2xs text-text-muted">Las trans con este método se marcan como internas y no se reportan a DGII.</span>
              </span>
            </label>
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

export default PaymentModal;
