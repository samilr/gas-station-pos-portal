import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ReadCardResult } from '../../../services/cardPaymentService';
import { useReadCardMutation } from '../../../store/api/cardPaymentsApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';
import { SiteAutocomplete, TerminalAutocomplete } from '../../ui/autocompletes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultSiteId?: string | null;
  defaultTerminalId?: number | null;
}

const ReadCardDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultSiteId,
  defaultTerminalId,
}) => {
  const [siteId, setSiteId] = useState<string>('');
  const [terminalId, setTerminalId] = useState<number | null>(null);
  const [result, setResult] = useState<ReadCardResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const [readCard, { isLoading }] = useReadCardMutation();

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
      const res = await readCard({ siteId, terminalId }).unwrap();
      setResult(res);
      if (res.read) toast.success('Tarjeta leída');
      else toast('No se detectó tarjeta');
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al leer tarjeta') ?? 'Error al leer tarjeta';
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
            <div className="w-7 h-7 bg-indigo-100 rounded-sm flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Leer tarjeta</h3>
              <p className="text-2xs text-text-muted">
                Lee BIN + producto + PAN enmascarado del datáfono sin cobrar
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
                result.read ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-inherit">
                {result.read ? (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-text-muted" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    result.read ? 'text-indigo-800' : 'text-text-secondary'
                  }`}
                >
                  {result.read ? 'Tarjeta leída' : 'Sin tarjeta detectada'}
                </span>
              </div>
              {result.read && (
                <div className="px-3 py-2">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
                    <DetailRow label="Producto" value={result.cardProduct} />
                    <DetailRow label="BIN" value={result.bin} mono />
                    <DetailRow label="PAN" value={result.maskedPan} mono />
                    <DetailRow label="Tarjetahabiente" value={result.holderName} />
                  </div>
                </div>
              )}
              {result.messages && result.messages.length > 0 && (
                <div className="px-3 py-2 border-t border-inherit">
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
              {(result.rawRequest || result.rawResponse) && (
                <div className="px-3 py-2 border-t border-inherit">
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
                    {showRaw ? 'Ocultar' : 'Ver'} raw request/response
                  </button>
                  {showRaw && (
                    <div className="mt-1 space-y-1">
                      {result.rawRequest && (
                        <pre className="bg-white border border-gray-200 rounded-sm p-2 text-2xs font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto">
                          <span className="text-text-muted">REQUEST</span>
                          {'\n'}
                          {result.rawRequest}
                        </pre>
                      )}
                      {result.rawResponse && (
                        <pre className="bg-white border border-gray-200 rounded-sm p-2 text-2xs font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto">
                          <span className="text-text-muted">RESPONSE</span>
                          {'\n'}
                          {result.rawResponse}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </CompactButton>
          <CompactButton type="submit" variant="primary" disabled={!canSubmit}>
            {isLoading ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" /> Leyendo...
              </>
            ) : (
              <>
                <CreditCard className="w-3 h-3" /> Leer
              </>
            )}
          </CompactButton>
        </div>
      </form>
    </div>
  );
};

const DetailRow: React.FC<{
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}> = ({ label, value, mono }) => (
  <>
    <span className="text-text-muted">{label}</span>
    <span className={`text-text-primary ${mono ? 'font-mono' : ''}`}>
      {value === null || value === undefined || value === '' ? '—' : String(value)}
    </span>
  </>
);

export default ReadCardDialog;
