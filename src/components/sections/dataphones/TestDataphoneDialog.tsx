import React, { useEffect, useMemo, useState } from 'react';
import {
  Zap,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Dataphone, TestDataphoneResult } from '../../../services/dataphoneService';
import { useTestDataphoneConnectionMutation } from '../../../store/api/dataphonesApi';
import { getErrorMessage } from '../../../store/api/baseApi';
import { CompactButton } from '../../ui';
import { TerminalAutocomplete } from '../../ui/autocompletes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dataphone: Dataphone | null;
}

const TestDataphoneDialog: React.FC<Props> = ({ isOpen, onClose, dataphone }) => {
  const [terminalId, setTerminalId] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('1.00');
  const [result, setResult] = useState<TestDataphoneResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const [testDataphone, { isLoading }] = useTestDataphoneConnectionMutation();

  useEffect(() => {
    if (isOpen) {
      setTerminalId(null);
      setAmount('1.00');
      setResult(null);
      setErrorMsg(null);
      setShowRaw(false);
    }
  }, [isOpen]);

  const amountCents = useMemo(() => {
    const n = parseFloat(amount.replace(',', '.'));
    if (Number.isNaN(n) || n <= 0) return null;
    return Math.round(n * 100);
  }, [amount]);

  const canSubmit = !!dataphone && terminalId !== null && amountCents !== null && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataphone || terminalId === null || amountCents === null) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    setResult(null);
    setErrorMsg(null);
    setShowRaw(false);
    try {
      const res = await testDataphone({
        id: dataphone.dataphoneId,
        body: { siteId: dataphone.siteId, terminalId, amountCents },
      }).unwrap();
      setResult(res);
      if (res.approved) {
        toast.success('Dataphone respondió aprobado');
      } else {
        toast.error('Dataphone respondió rechazado');
      }
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al probar dataphone') ?? 'Error al probar dataphone';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  if (!isOpen || !dataphone) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-sm flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Probar Dataphone</h3>
              <p className="text-2xs text-text-muted">
                #{dataphone.dataphoneId} · {dataphone.name} · {dataphone.siteId}
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
              Envía una <strong>venta real</strong> al dataphone. Con stub deshabilitado, cobra la
              tarjeta presentada en el POS. Para revertir, anula el cobro antes del cierre de lote.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Terminal *
              </label>
              <TerminalAutocomplete
                value={terminalId}
                onChange={(v) => setTerminalId(v)}
                siteId={dataphone.siteId}
                required
              />
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Monto (RD$) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
                required
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="1.00"
              />
              <p className="text-2xs text-text-muted mt-0.5">
                {amountCents !== null ? `${amountCents} centavos` : 'Monto inválido'}
              </p>
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
                result.approved ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b border-inherit">
                {result.approved ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    result.approved ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.approved ? 'Aprobado' : 'Rechazado'}
                </span>
                {result.authorizationNumber && (
                  <span className="text-2xs font-mono text-text-muted ml-auto">
                    AUTH {result.authorizationNumber}
                  </span>
                )}
              </div>
              <div className="px-3 py-2 space-y-1.5">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
                  <DetailRow label="Producto" value={result.cardProduct} />
                  <DetailRow label="PAN" value={result.maskedPan} mono />
                  <DetailRow label="Tarjetahabiente" value={result.holderName} />
                  <DetailRow label="Fecha" value={formatDate(result.transactionDateTime)} />
                  <DetailRow label="Host" value={result.host} />
                  <DetailRow label="Lote" value={result.batch} />
                  <DetailRow label="Ref." value={result.reference} mono />
                  <DetailRow label="Retrieval" value={result.retrievalReference} mono />
                  <DetailRow label="Terminal (gw)" value={result.terminalId} mono />
                  <DetailRow label="Merchant" value={result.merchantId} mono />
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
                {(result.rawRequest || result.rawResponse) && (
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
                <RefreshCw className="w-3 h-3 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" /> Enviar prueba
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

const formatDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
};

export default TestDataphoneDialog;
