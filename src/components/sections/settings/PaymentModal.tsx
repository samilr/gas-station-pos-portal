import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentService } from '../../../services/paymentService';
import { IPayment } from '../../../types/payment';

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
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = isEdit
      ? await paymentService.updatePayment(form.paymentId, { name: form.name, sequence: form.sequence, paymentType: form.paymentType, currencyId: form.currencyId, active: form.active })
      : await paymentService.createPayment(form);
    setSaving(false);
    if (res.successful) { toast.success(isEdit ? 'Actualizado' : 'Creado'); onSaved(); }
    else toast.error(res.error || 'Error al guardar');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">Payment ID</label>
              <input value={form.paymentId} onChange={e => setForm(f => ({ ...f, paymentId: e.target.value }))} disabled={isEdit} required className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50" /></div>
            <div><label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">Nombre</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">Tipo</label>
              <select value={form.paymentType} onChange={e => setForm(f => ({ ...f, paymentType: Number(e.target.value) }))} className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                {PAYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select></div>
            <div><label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">Moneda</label>
              <input value={form.currencyId} onChange={e => setForm(f => ({ ...f, currencyId: e.target.value }))} className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">Secuencia</label>
            <input type="number" value={form.sequence} onChange={e => setForm(f => ({ ...f, sequence: Number(e.target.value) }))} className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />Activo
          </label>
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

export default PaymentModal;
