import React, { useEffect, useState } from 'react';
import { CreditCard, X, RefreshCw, Ban, RotateCcw, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CardPayment } from '../../../services/cardPaymentService';
import {
  useGetCardPaymentByIdQuery,
  useVoidCardPaymentMutation,
  useRefundCardPaymentMutation,
  useLinkCardPaymentTransMutation,
} from '../../../store/api/cardPaymentsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cardPaymentId: string | null;
  onChanged: () => void;
}

const Field: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <div className="text-2xs uppercase tracking-wide text-text-muted">{label}</div>
    <div className={`text-sm text-text-primary ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</div>
  </div>
);

const CardPaymentDetailModal: React.FC<Props> = ({ isOpen, onClose, cardPaymentId, onChanged }) => {
  const [acting, setActing] = useState<null | 'void' | 'refund' | 'link'>(null);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [linkTransNumber, setLinkTransNumber] = useState<string>('');
  const [linkLine, setLinkLine] = useState<string>('1');

  const { data: cp, isLoading: loading } = useGetCardPaymentByIdQuery(cardPaymentId ?? '', {
    skip: !isOpen || !cardPaymentId,
  });
  const [voidPayment] = useVoidCardPaymentMutation();
  const [refundPayment] = useRefundCardPaymentMutation();
  const [linkPayment] = useLinkCardPaymentTransMutation();

  if (!isOpen) return null;

  const handleVoid = async () => {
    if (!cp) return;
    setActing('void');
    try {
      await voidPayment(cp.cardPaymentId).unwrap();
      toast.success('Pago anulado');
      onChanged();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al anular') ?? 'Error al anular');
    } finally {
      setActing(null);
    }
  };

  const handleRefund = async () => {
    if (!cp) return;
    const amountCents = Math.round(parseFloat(refundAmount || '0') * 100);
    if (!amountCents || amountCents <= 0) { toast.error('Monto inválido'); return; }
    setActing('refund');
    try {
      await refundPayment({ id: cp.cardPaymentId, body: { amountCents } }).unwrap();
      toast.success('Devolución procesada');
      onChanged();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error en devolución') ?? 'Error en devolución');
    } finally {
      setActing(null);
    }
  };

  const handleLinkTrans = async () => {
    if (!cp) return;
    if (!linkTransNumber) { toast.error('Ingresa el transNumber'); return; }
    setActing('link');
    try {
      await linkPayment({
        id: cp.cardPaymentId,
        body: { transNumber: linkTransNumber, transPaymLine: parseInt(linkLine, 10) || 1 },
      }).unwrap();
      toast.success('Pago enlazado a transacción');
      onChanged();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al enlazar') ?? 'Error al enlazar');
    } finally {
      setActing(null);
    }
  };

  const amountDop = (cents: number) => (cents / 100).toLocaleString('es-DO', { minimumFractionDigits: 2 });

  const canVoid = cp && (cp.status === 'Approved' || cp.status === 'LinkedToTrans');
  const canRefund = cp && cp.status === 'LinkedToTrans';
  const canLink = cp && cp.status === 'Approved' && !cp.transNumber;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm w-full max-w-3xl shadow-xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Detalle de pago con tarjeta</h3>
              <p className="text-2xs text-text-muted font-mono">{cardPaymentId}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <div className="text-center text-xs text-text-muted"><RefreshCw className="w-4 h-4 animate-spin inline mr-1" /> Cargando...</div>}
          {cp && (
            <>
              <div className="grid grid-cols-4 gap-3">
                <Field label="Estado" value={<span className="font-medium">{cp.status}</span>} />
                <Field label="Operación" value={cp.operation} />
                <Field label="Aprobado" value={cp.approved ? 'Sí' : 'No'} />
                <Field label="Autorización" value={cp.authorizationNumber} mono />
                <Field label="Referencia" value={cp.reference} mono />
                <Field label="Host / Batch" value={`${cp.host ?? '—'} / ${cp.batch ?? '—'}`} mono />
                <Field label="Producto" value={cp.cardProduct} />
                <Field label="PAN" value={cp.maskedPan} mono />
                <Field label="Site / Terminal" value={`${cp.siteId} · T${cp.terminalId}`} />
                <Field label="Trans Number" value={cp.transNumber} mono />
                <Field label="POS Trans" value={cp.posTransNumber} mono />
                <Field label="Trans Paym Line" value={cp.transPaymLine} />
                <Field label="Monto" value={`RD$ ${amountDop(cp.amountCents)}`} mono />
                <Field label="Tax" value={`RD$ ${amountDop(cp.taxCents)}`} mono />
                <Field label="Otros" value={`RD$ ${amountDop(cp.otherTaxesCents)}`} mono />
                <Field label="Creado" value={new Date(cp.createdAt).toLocaleString('es-DO')} />
              </div>

              {cp.message && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-sm text-xs text-yellow-700">
                  {cp.message}
                </div>
              )}

              <details className="border border-gray-200 rounded-sm">
                <summary className="text-xs font-medium px-2 py-1 cursor-pointer bg-gray-50">Raw Request</summary>
                <pre className="text-2xs p-2 overflow-x-auto max-h-48">{cp.rawRequest || '—'}</pre>
              </details>
              <details className="border border-gray-200 rounded-sm">
                <summary className="text-xs font-medium px-2 py-1 cursor-pointer bg-gray-50">Raw Response</summary>
                <pre className="text-2xs p-2 overflow-x-auto max-h-48">{cp.rawResponse || '—'}</pre>
              </details>

              <div className="border-t border-gray-200 pt-3 space-y-3">
                <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary">Acciones</h4>

                {canVoid && (
                  <div className="flex items-center gap-2">
                    <CompactButton variant="danger" onClick={handleVoid} disabled={acting !== null}>
                      {acting === 'void' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                      Anular (Void)
                    </CompactButton>
                    <span className="text-2xs text-text-muted">Solo si el lote está abierto</span>
                  </div>
                )}

                {canRefund && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-text-secondary">Monto RD$:</label>
                    <input type="number" step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)}
                      className="h-7 w-32 px-2 text-sm border border-gray-300 rounded-sm" placeholder="0.00" />
                    <CompactButton variant="primary" onClick={handleRefund} disabled={acting !== null}>
                      {acting === 'refund' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                      Devolución
                    </CompactButton>
                  </div>
                )}

                {canLink && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-xs text-text-secondary">Trans #:</label>
                    <input type="text" value={linkTransNumber} onChange={(e) => setLinkTransNumber(e.target.value)}
                      className="h-7 w-40 px-2 text-sm border border-gray-300 rounded-sm" placeholder="POS000124" />
                    <label className="text-xs text-text-secondary">Línea:</label>
                    <input type="number" value={linkLine} onChange={(e) => setLinkLine(e.target.value)}
                      className="h-7 w-16 px-2 text-sm border border-gray-300 rounded-sm" min={1} />
                    <CompactButton variant="primary" onClick={handleLinkTrans} disabled={acting !== null}>
                      {acting === 'link' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                      Enlazar
                    </CompactButton>
                  </div>
                )}

                {!canVoid && !canRefund && !canLink && (
                  <div className="text-xs text-text-muted">No hay acciones disponibles para el estado actual.</div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton variant="ghost" onClick={onClose}>Cerrar</CompactButton>
        </div>
      </div>
    </div>
  );
};

export default CardPaymentDetailModal;
