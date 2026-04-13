import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { paymentService } from '../../../services/paymentService';
import { IPayment } from '../../../types/payment';
import PaymentModal from './PaymentModal';

const paymentTypeLabels: Record<number, string> = {
  1: 'Efectivo', 2: 'Tarjeta Crédito', 3: 'Tarjeta Débito',
  4: 'Transferencia', 5: 'Cheque', 6: 'Tickets', 7: 'Gift Card', 8: 'Otro'
};

const PaymentsSection: React.FC = () => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ show: boolean; payment: IPayment | null }>({ show: false, payment: null });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await paymentService.getPayments();
    setPayments(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm(`¿Eliminar método de pago "${id}"?`)) return;
    const r = await paymentService.deletePayment(id);
    if (r.successful) { toast.success('Método de pago eliminado'); load(); } else toast.error(r.error || 'Error');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Métodos de Pago</h1>
              <p className="text-sm text-gray-500">{payments.length} métodos configurados</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal({ show: true, payment: null })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
              <Plus className="w-4 h-4" />Nuevo
            </button>
            <button onClick={load} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-28" />)
        ) : payments.map((p, i) => (
          <motion.div key={p.paymentId} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{p.name.trim()}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{p.paymentId.trim()}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setModal({ show: true, payment: p })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(p.paymentId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">{paymentTypeLabels[p.paymentType] || `Tipo ${p.paymentType}`}</span>
              <span className={`px-2 py-1 rounded-full ${p.paymentActive || p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.paymentActive || p.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </motion.div>
        ))}
        {!loading && payments.length === 0 && <p className="text-sm text-gray-400 col-span-3 text-center py-10">Sin métodos de pago</p>}
      </div>

      {modal.show && <PaymentModal payment={modal.payment} onClose={() => setModal({ show: false, payment: null })} onSaved={() => { setModal({ show: false, payment: null }); load(); }} />}
    </div>
  );
};

export default PaymentsSection;
