import React, { useEffect, useState } from 'react';
import { Ban, X, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { CardPayment, VoidCardPaymentResult } from '../../../services/cardPaymentService';
import { useVoidCardPaymentMutation } from '../../../store/api/cardPaymentsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cardPayment: CardPayment | null;
  onSuccess?: () => void;
}

const amountDop = (cents: number) =>
  (cents / 100).toLocaleString('es-DO', { minimumFractionDigits: 2 });

const VoidCardPaymentDialog: React.FC<Props> = ({ isOpen, onClose, cardPayment, onSuccess }) => {
  const [result, setResult] = useState<VoidCardPaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [voidPayment, { isLoading }] = useVoidCardPaymentMutation();

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setErrorMsg(null);
    }
  }, [isOpen, cardPayment?.cardPaymentId]);

  const handleVoid = async () => {
    if (!cardPayment) return;
    setResult(null);
    setErrorMsg(null);
    try {
      const res = await voidPayment(cardPayment.cardPaymentId).unwrap();
      setResult(res);
      toast.success('Cobro reversado');
      onSuccess?.();
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al reversar cobro') ?? 'Error al reversar cobro';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  if (!isOpen || !cardPayment) return null;

  const canVoid = cardPayment.status === 'Approved';
  const done = result !== null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm w-full max-w-md shadow-xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-100 rounded-sm flex items-center justify-center">
              <Ban className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Reversar cobro</h3>
              <p className="text-2xs text-text-muted font-mono">
                {cardPayment.cardPaymentId.slice(0, 8)}...
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="border border-gray-200 rounded-sm">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-3 py-2 text-2xs">
              <span className="text-text-muted">Site / Terminal</span>
              <span className="text-text-primary">
                {cardPayment.siteId} · T{cardPayment.terminalId}
              </span>
              <span className="text-text-muted">Monto</span>
              <span className="text-text-primary font-mono">
                RD$ {amountDop(cardPayment.amountCents)}
              </span>
              <span className="text-text-muted">Tarjeta</span>
              <span className="text-text-primary font-mono">
                {cardPayment.cardProduct ?? '—'} {cardPayment.maskedPan ?? ''}
              </span>
              <span className="text-text-muted">Autorización</span>
              <span className="text-text-primary font-mono">
                {cardPayment.authorizationNumber ?? '—'}
              </span>
              <span className="text-text-muted">Estado actual</span>
              <span className="text-text-primary">{cardPayment.status}</span>
            </div>
          </div>

          {!canVoid && !done && (
            <div className="flex items-start gap-2 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                Solo se puede reversar un cobro en estado <strong>Approved</strong>. Este cobro
                está en <strong>{cardPayment.status}</strong>.
              </span>
            </div>
          )}

          {canVoid && !done && (
            <div className="flex items-start gap-2 px-2 py-1.5 bg-red-50 border border-red-200 rounded-sm text-xs text-red-700">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                Enviará un <strong>void</strong> al datáfono. Solo funciona si el lote sigue
                abierto. Esta acción no se puede deshacer.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 px-2 py-1.5 bg-red-50 border border-red-200 rounded-sm text-xs text-red-700">
              <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div
              className={`border rounded-sm ${
                result.status === 'Voided'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-inherit">
                {result.status === 'Voided' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    result.status === 'Voided' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.status}
                </span>
                {result.providerStatus && (
                  <span className="text-2xs text-text-muted ml-auto">
                    Proveedor: {result.providerStatus}
                  </span>
                )}
              </div>
              {result.messages && result.messages.length > 0 && (
                <ul className="px-3 py-2 text-xs text-text-primary list-disc list-inside space-y-0.5">
                  {result.messages.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton variant="ghost" onClick={onClose}>
            {done ? 'Cerrar' : 'Cancelar'}
          </CompactButton>
          {!done && (
            <CompactButton variant="danger" onClick={handleVoid} disabled={!canVoid || isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" /> Reversando...
                </>
              ) : (
                <>
                  <Ban className="w-3 h-3" /> Confirmar reverso
                </>
              )}
            </CompactButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoidCardPaymentDialog;
