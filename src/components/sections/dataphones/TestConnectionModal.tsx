import React, { useEffect, useMemo, useState } from 'react';
import { Activity, X, RefreshCw, Zap, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import dataphoneService, { CardPaymentResult, Dataphone } from '../../../services/dataphoneService';
import dataphoneTerminalService, { DataphoneTerminal } from '../../../services/dataphoneTerminalService';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dataphone: Dataphone | null;
}

interface FormState {
  siteId: string;
  terminalId: number | '';
  amountCents: number | '';
}

const inputCls = 'w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500';

const TestConnectionModal: React.FC<Props> = ({ isOpen, onClose, dataphone }) => {
  const [mappings, setMappings] = useState<DataphoneTerminal[]>([]);
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [form, setForm] = useState<FormState>({ siteId: '', terminalId: '', amountCents: 100 });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CardPaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !dataphone) return;
    setResult(null);
    setErrorMsg(null);
    setForm({ siteId: '', terminalId: '', amountCents: 100 });
    setLoadingMappings(true);
    dataphoneTerminalService.list()
      .then((r) => {
        const active = (r.data || []).filter(
          (m) => m.dataphoneId === dataphone.dataphoneId && m.active,
        );
        setMappings(active);
        if (active.length === 1) {
          setForm((f) => ({ ...f, siteId: active[0].siteId, terminalId: active[0].terminalId }));
        } else if (active.length > 0) {
          setForm((f) => ({ ...f, siteId: active[0].siteId }));
        }
      })
      .finally(() => setLoadingMappings(false));
  }, [isOpen, dataphone]);

  const uniqueSites = useMemo(
    () => Array.from(new Set(mappings.map((m) => m.siteId))),
    [mappings],
  );
  const terminalsForSite = useMemo(
    () => mappings.filter((m) => m.siteId === form.siteId),
    [mappings, form.siteId],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSiteChange = (siteId: string) => {
    setForm((f) => ({ ...f, siteId, terminalId: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataphone) return;
    if (!form.siteId || form.terminalId === '') {
      toast.error('Selecciona site y terminal');
      return;
    }
    const amount = form.amountCents === '' ? 100 : Number(form.amountCents);
    if (amount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    setRunning(true);
    setResult(null);
    setErrorMsg(null);
    try {
      const res = await dataphoneService.testConnection(dataphone.dataphoneId, {
        siteId: form.siteId,
        terminalId: Number(form.terminalId),
        amountCents: amount,
      });
      if (res.successful && res.data) {
        setResult(res.data);
        const firstMsg = res.data.messages?.[0];
        if (res.data.approved) {
          toast.success(firstMsg || 'Transacción aprobada');
        } else {
          toast.error(firstMsg || 'Transacción rechazada por el dataphone');
        }
      } else {
        setErrorMsg(res.error || 'Error desconocido');
        toast.error(res.error || 'Error al probar conexión');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de conexión';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  };

  if (!isOpen || !dataphone) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-sm w-full max-w-2xl shadow-xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-sm flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Probar conexión con dataphone</h3>
              <p className="text-2xs text-text-muted">
                DP#{dataphone.dataphoneId} · {dataphone.name} · {dataphone.siteId}
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
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-2 text-2xs text-amber-800 leading-relaxed">
            <strong>Atención:</strong> Esta es una venta real. Con <code>CardNet:UseStub=false</code> cobra la tarjeta
            presentada en el POS y liquida en el próximo cierre de lote. Para revertir usa el endpoint de void o no
            corras sin stub.
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Site ID *</label>
              {mappings.length > 0 ? (
                <select
                  value={form.siteId}
                  onChange={(e) => handleSiteChange(e.target.value)}
                  required
                  className={inputCls}
                >
                  <option value="">— Selecciona —</option>
                  {uniqueSites.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.siteId}
                  onChange={(e) => update('siteId', e.target.value)}
                  required
                  className={inputCls}
                  placeholder="CO-0017"
                />
              )}
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Terminal ID *</label>
              {terminalsForSite.length > 0 ? (
                <select
                  value={form.terminalId}
                  onChange={(e) => update('terminalId', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  required
                  className={inputCls}
                >
                  <option value="">— Selecciona —</option>
                  {terminalsForSite.map((m) => (
                    <option key={m.terminalId} value={m.terminalId}>T{m.terminalId}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={form.terminalId}
                  onChange={(e) => update('terminalId', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  required
                  min={1}
                  className={inputCls}
                  placeholder="2"
                />
              )}
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                Monto (centavos)
              </label>
              <input
                type="number"
                value={form.amountCents}
                onChange={(e) => update('amountCents', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                min={1}
                className={inputCls}
                placeholder="100"
              />
              <p className="text-2xs text-text-muted mt-0.5">
                {form.amountCents === '' ? 'Default 100 = RD$1.00' : `= RD$${(Number(form.amountCents) / 100).toFixed(2)}`}
              </p>
            </div>
          </div>

          {loadingMappings && (
            <p className="text-2xs text-text-muted">
              <RefreshCw className="w-3 h-3 animate-spin inline mr-1" />
              Cargando mapeos de terminal...
            </p>
          )}
          {!loadingMappings && mappings.length === 0 && (
            <p className="text-2xs text-text-muted">
              Sin mapeos activos para este dataphone. Ingresa siteId y terminalId manualmente.
            </p>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-2 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {result && (
            <div
              className={`border rounded-sm p-3 text-xs ${
                result.approved
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-2 mb-3">
                {result.approved ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-semibold ${
                      result.approved ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {result.approved ? 'Aprobada' : 'Rechazada'}
                  </div>
                  {result.messages && result.messages.length > 0 && (
                    <div
                      className={`mt-1 text-sm font-medium break-words ${
                        result.approved ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {result.messages.map((m, i) => (
                        <div key={i}>{m}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {result.approved && (
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
                  <Field label="Autorización" value={result.authorizationNumber} />
                  <Field label="Tarjeta" value={result.maskedPan} />
                  <Field label="Titular" value={result.holderName} />
                  <Field label="Producto" value={result.cardProduct} />
                  <Field label="Referencia" value={result.reference} />
                  <Field label="Retrieval Ref." value={result.retrievalReference} />
                  <Field label="Host" value={result.host} />
                  <Field label="Batch" value={result.batch} />
                  <Field label="Terminal" value={result.terminalId} />
                  <Field label="Merchant" value={result.merchantId} />
                  <Field label="Fecha/Hora" value={result.transactionDateTime} />
                </div>
              )}

              {(result.rawRequest || result.rawResponse) && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-2xs uppercase tracking-wide text-text-muted">
                    Raw request / response
                  </summary>
                  <div className="mt-1 space-y-2">
                    {result.rawRequest && (
                      <pre className="bg-white border border-gray-200 rounded-sm p-2 text-2xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                        {result.rawRequest}
                      </pre>
                    )}
                    {result.rawResponse && (
                      <pre className="bg-white border border-gray-200 rounded-sm p-2 text-2xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                        {result.rawResponse}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </CompactButton>
          <CompactButton type="submit" variant="primary" disabled={running}>
            {running ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <Activity className="w-3 h-3" /> Probar conexión
              </>
            )}
          </CompactButton>
        </div>
      </form>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string | number | null }> = ({ label, value }) => (
  <div className="flex justify-between gap-2 border-b border-gray-100 pb-0.5">
    <span className="text-text-muted">{label}</span>
    <span className="text-text-primary font-mono text-right truncate">
      {value === null || value === undefined || value === '' ? '—' : String(value)}
    </span>
  </div>
);

export default TestConnectionModal;
