import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentService } from '../../../services/paymentService';
import { IPayment } from '../../../types/payment';
import PaymentModal from './PaymentModal';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

const paymentTypeLabels: Record<number, string> = {
  1: 'Efectivo', 2: 'Tarjeta Credito', 3: 'Tarjeta Debito',
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
    if (!confirm(`¿Eliminar metodo de pago "${id}"?`)) return;
    const r = await paymentService.deletePayment(id);
    if (r.successful) { toast.success('Metodo de pago eliminado'); load(); } else toast.error(r.error || 'Error');
  };

  return (
    <div className="space-y-1">
      <Toolbar
        chips={[
          { label: "Metodos", value: payments.length, color: "blue" },
        ]}
      >
        <CompactButton variant="primary" onClick={() => setModal({ show: true, payment: null })}>
          <Plus className="w-3.5 h-3.5" />Nuevo
        </CompactButton>
        <CompactButton variant="icon" onClick={load}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </CompactButton>
      </Toolbar>

      {/* Table view instead of cards for compact density */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                  {['ID', 'Nombre', 'Tipo', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="px-2 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.paymentId} className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover transition-colors">
                    <td className="px-2 text-sm whitespace-nowrap font-mono text-gray-400">{p.paymentId.trim()}</td>
                    <td className="px-2 text-sm whitespace-nowrap font-medium text-gray-900">{p.name.trim()}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-500">{paymentTypeLabels[p.paymentType] || `Tipo ${p.paymentType}`}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <StatusDot
                        color={(p.paymentActive || p.active) ? 'green' : 'gray'}
                        label={(p.paymentActive || p.active) ? 'Activo' : 'Inactivo'}
                      />
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ show: true, payment: p })} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.paymentId)} className="p-0.5 text-red-600 hover:bg-red-50 rounded-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={5} className="px-2 py-6 text-center text-sm text-gray-400">Sin metodos de pago</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.show && <PaymentModal payment={modal.payment} onClose={() => setModal({ show: false, payment: null })} onSaved={() => { setModal({ show: false, payment: null }); load(); }} />}
    </div>
  );
};

export default PaymentsSection;
