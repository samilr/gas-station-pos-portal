import React, { useEffect, useState } from 'react';
import {
  Lock,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BatchCloseResult } from '../../../services/cardPaymentService';
import { useBatchCloseCardPaymentsMutation } from '../../../store/api/cardPaymentsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';
import { SiteAutocomplete, TerminalAutocomplete } from '../../ui/autocompletes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultSiteId?: string | null;
  defaultTerminalId?: number | null;
  onSuccess?: () => void;
}

const BatchCloseDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultSiteId,
  defaultTerminalId,
  onSuccess,
}) => {
  const [siteId, setSiteId] = useState<string>('');
  const [terminalId, setTerminalId] = useState<number | null>(null);
  const [result, setResult] = useState<BatchCloseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const [batchClose, { isLoading }] = useBatchCloseCardPaymentsMutation();

  useEffect(() => {
    if (isOpen) {
      setSiteId(defaultSiteId ?? '');
      setTerminalId(defaultTerminalId ?? null);
      setResult(null);
      setErrorMsg(null);
      setShowRaw(false);
    }
  }, [isOpen, defaultSiteId, defaultTerminalId]);

  const canSubmit = !!siteId && terminalId !== null && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId || terminalId === null) {
      toast.error('Selecciona site y terminal');
      return;
    }
    setResult(null);
    setErrorMsg(null);
    setShowRaw(false);
    try {
      const res = await batchClose({ siteId, terminalId }).unwrap();
      setResult(res);
      if (res.success) toast.success('Lote cerrado');
      else toast.error('El datáfono rechazó el cierre');
      onSuccess?.();
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al cerrar lote') ?? 'Error al cerrar lote';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-100 rounded-sm flex items-center justify-center">
              <Lock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Cerrar lote</h3>
              <p className="text-2xs text-text-muted">
                Liquida el lote del datáfono y emite el cierre del día
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
          <div className="flex items-start gap-2 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-sm text-2xs text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Una vez cerrado, los cobros aprobados no pueden reversarse con void — hay que usar
              devolución (refund).
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Sucursal *
              </label>
              <SiteAutocomplete
                value={siteId}
                onChange={(v) => {
                  setSiteId(v ?? '');
                  setTerminalId(null);
                }}
                required
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Terminal *
              </label>
              <TerminalAutocomplete
                value={terminalId}
                onChange={(v) => setTerminalId(v)}
                siteId={siteId || null}
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 px-2 py-1.5 bg-red-50 border border-red-200 rounded-sm text-xs text-red-700">
              <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div
              className={`border rounded-sm ${
                result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-inherit">
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.success ? 'Lote cerrado' : 'No se pudo cerrar'}
                </span>
                {result.providerStatus && (
                  <span className="text-2xs text-text-muted ml-auto">
                    Proveedor: {result.providerStatus}
                  </span>
                )}
              </div>
              <div className="px-3 py-2 space-y-1.5">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
                  <span className="text-text-muted">Cierre</span>
                  <span className="text-text-primary">
                    {result.closureQuantity !== null ? result.closureQuantity : '—'}
                  </span>
                  <span className="text-text-muted">CardPayment ID</span>
                  <span className="text-text-primary font-mono">
                    {result.cardPaymentId
                      ? `${result.cardPaymentId.slice(0, 8)}...`
                      : '—'}
                  </span>
                </div>
                {result.messages && result.messages.length > 0 && (
                  <div className="pt-1 border-t border-inherit">
                    <p className="text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                      Mensajes
                    </p>
                    <ul className="text-xs text-text-primary list-disc list-inside space-y-0.5">
                      {result.messages.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.rawResponse && (
                  <div className="pt-1 border-t border-inherit">
                    <button
                      type="button"
                      onClick={() => setShowRaw((v) => !v)}
                      className="flex items-center gap-1 text-2xs text-text-secondary hover:text-text-primary"
                    >
                      {showRaw ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {showRaw ? 'Ocultar' : 'Ver'} raw response
                    </button>
                    {showRaw && (
                      <pre className="mt-1 bg-white border border-gray-200 rounded-sm p-2 text-2xs font-mono whitespace-pre-wrap break-all max-h-40 overflow-auto">
                        {result.rawResponse}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>
            {result ? 'Cerrar' : 'Cancelar'}
          </CompactButton>
          {!result && (
            <CompactButton type="submit" variant="primary" disabled={!canSubmit}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" /> Cerrando...
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" /> Cerrar lote
                </>
              )}
            </CompactButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default BatchCloseDialog;
