import React, { useState } from 'react';
import { Fuel, X, ChevronDown, ChevronRight, AlertTriangle, Receipt, CreditCard } from 'lucide-react';
import {
  FuelTransactionAdmin,
  cfStatusLabel,
  cfStatusBadgeClass,
  cardPaymentStatusLabel,
  cardPaymentStatusBadgeClass,
} from '../../../services/fuelTransactionAdminService';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import { CompactButton } from '../../ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: FuelTransactionAdmin | null;
}

const Field: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <div className="text-2xs uppercase tracking-wide text-text-muted">{label}</div>
    <div className={`text-sm text-text-primary ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</div>
  </div>
);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(amount);

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('es-DO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const SectionHeader: React.FC<{
  open: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  trailing?: React.ReactNode;
}> = ({ open, onToggle, icon, title, trailing }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center gap-2 mb-2 pb-1 border-b border-gray-200 hover:bg-gray-50 px-1"
  >
    {open ? <ChevronDown className="w-3 h-3 text-text-muted" /> : <ChevronRight className="w-3 h-3 text-text-muted" />}
    {icon}
    <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary">{title}</h4>
    <div className="flex-1" />
    {trailing}
  </button>
);

const FuelTransactionAdminDetailModal: React.FC<Props> = ({ isOpen, onClose, transaction }) => {
  const [openFuel, setOpenFuel] = useState(true);
  const [openTrans, setOpenTrans] = useState(true);
  const [openCard, setOpenCard] = useState(true);

  if (!isOpen || !transaction) return null;

  const t = transaction;
  const trans = t.trans;
  const cards = t.cardPayments;

  const headerStateBadge = !trans
    ? { text: 'Pendiente', cls: 'bg-yellow-100 text-yellow-700' }
    : cards.length > 0
      ? { text: 'Tarjeta', cls: 'bg-blue-100 text-blue-700' }
      : { text: 'Efectivo', cls: 'bg-gray-100 text-gray-700' };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-sm w-full max-w-4xl shadow-xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-100 rounded-sm flex items-center justify-center">
              <Fuel className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Vista 360° de transacción</h3>
              <p className="text-2xs text-text-muted font-mono">#{t.transactionId}</p>
            </div>
            <span className={`ml-2 inline-flex px-1.5 py-0.5 rounded text-2xs font-medium ${headerStateBadge.cls}`}>
              {headerStateBadge.text}
            </span>
            {trans?.isReturn && (
              <span className="inline-flex px-1.5 py-0.5 rounded text-2xs font-medium bg-red-100 text-red-700">
                Devolución
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100"
            title="Cerrar"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Sección 1: Trans */}
          {trans ? (
            <div>
              <SectionHeader
                open={openTrans}
                onToggle={() => setOpenTrans(!openTrans)}
                icon={<Receipt className="w-3 h-3 text-blue-600" />}
                title={`Trans · ${trans.transNumber}`}
                trailing={
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-2xs font-medium ${cfStatusBadgeClass(trans.cfStatus)}`}>
                    NCF: {cfStatusLabel(trans.cfStatus)}
                  </span>
                }
              />
              {openTrans && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="NCF" value={trans.cfNumber} mono />
                    <Field label="Tipo CF" value={trans.cfType} mono />
                    <Field label="Validez CF" value={formatDateTime(trans.cfValidity)} />
                    <Field
                      label="QR"
                      value={trans.cfQr ? <span className="font-mono text-xs truncate block max-w-full" title={trans.cfQr}>{trans.cfQr}</span> : '—'}
                    />
                    <Field label="Terminal" value={trans.terminalId} />
                    <Field label="Fecha Trans" value={formatDateTime(trans.transDate)} />
                    <Field label="Turno" value={trans.shift} />
                    <Field label="Status" value={trans.status} />
                    <Field label="Subtotal" value={<span className="font-mono">{formatCurrency(trans.subtotal)}</span>} />
                    <Field label="Impuesto" value={<span className="font-mono">{formatCurrency(trans.tax)}</span>} />
                    <Field label="Total" value={<span className="font-mono font-bold">{formatCurrency(trans.total)}</span>} />
                    <Field label="Pago" value={<span className="font-mono">{formatCurrency(trans.payment)}</span>} />
                    {trans.taxpayerId && <Field label="RNC contribuyente" value={trans.taxpayerId} mono />}
                    <Field label="Cliente" value={trans.customerId} mono />
                    {trans.returnTransNumber && <Field label="Trans devolución" value={trans.returnTransNumber} mono />}
                  </div>

                  {trans.products.length > 0 && (
                    <div>
                      <div className="text-2xs uppercase tracking-wide text-text-muted mb-1">Productos ({trans.products.length})</div>
                      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="h-7 text-2xs uppercase tracking-wide bg-table-header border-b border-gray-200">
                              <th className="text-left px-2 font-medium text-gray-600">Producto</th>
                              <th className="text-left px-2 font-medium text-gray-600">Categoría</th>
                              <th className="text-right px-2 font-medium text-gray-600">Cant.</th>
                              <th className="text-right px-2 font-medium text-gray-600">Precio</th>
                              <th className="text-right px-2 font-medium text-gray-600">Impuesto</th>
                              <th className="text-right px-2 font-medium text-gray-600">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trans.products.map((p, i) => (
                              <tr key={i} className="h-7 border-b border-gray-100">
                                <td className="px-2 text-xs">
                                  <span className="font-mono text-text-secondary">{p.productId}</span>
                                  <span className="ml-1.5">{p.productName}</span>
                                  {p.isReturn && (
                                    <span className="ml-1 inline-flex px-1 py-0.5 rounded text-2xs font-medium bg-red-100 text-red-700">
                                      Dev.
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 text-xs font-mono text-text-secondary">{p.categoryId}</td>
                                <td className="px-2 text-xs text-right font-mono">{p.quantity}</td>
                                <td className="px-2 text-xs text-right font-mono">{formatCurrency(p.price)}</td>
                                <td className="px-2 text-xs text-right font-mono">{formatCurrency(p.tax)}</td>
                                <td className="px-2 text-xs text-right font-mono font-semibold">{formatCurrency(p.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {trans.payments.length > 0 && (
                    <div>
                      <div className="text-2xs uppercase tracking-wide text-text-muted mb-1">Pagos ({trans.payments.length})</div>
                      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="h-7 text-2xs uppercase tracking-wide bg-table-header border-b border-gray-200">
                              <th className="text-left px-2 font-medium text-gray-600">ID</th>
                              <th className="text-left px-2 font-medium text-gray-600">Tipo</th>
                              <th className="text-center px-2 font-medium text-gray-600">Línea</th>
                              <th className="text-right px-2 font-medium text-gray-600">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trans.payments.map((p, i) => (
                              <tr key={i} className="h-7 border-b border-gray-100">
                                <td className="px-2 text-xs font-mono">{p.paymentId}</td>
                                <td className="px-2 text-xs">
                                  {p.type}
                                  {p.isReturn && (
                                    <span className="ml-1 inline-flex px-1 py-0.5 rounded text-2xs font-medium bg-red-100 text-red-700">
                                      Dev.
                                    </span>
                                  )}
                                </td>
                                <td className="px-2 text-xs text-center font-mono">{p.line}</td>
                                <td className="px-2 text-xs text-right font-mono font-semibold">{formatCurrency(p.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-yellow-800">Venta pendiente</div>
                <div className="text-yellow-700">
                  Esta fuel_transaction no fue promovida a <code className="font-mono">trans</code>: no tiene NCF ni cierre fiscal.
                  La promoción a venta real se realiza desde el POS Android vía <code className="font-mono">POST /api/trans/create</code> (efectivo)
                  o <code className="font-mono">POST /api/card-payments/process</code> (con tarjeta).
                </div>
              </div>
            </div>
          )}

          {/* Sección 2: Combustible */}
          <div>
            <SectionHeader
              open={openFuel}
              onToggle={() => setOpenFuel(!openFuel)}
              icon={<Fuel className="w-3 h-3 text-orange-600" />}
              title="Combustible"
            />
            {openFuel && (
              <div className="bg-white rounded-sm border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                  <span className="text-xs font-mono text-text-muted">#{t.transactionId}</span>
                  <div className="text-sm font-mono font-bold">
                    DOP {formatCurrency(t.amount).replace(/^[^\d-]+/, '')}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <Field label="Fecha / Hora" value={formatDateTime(t.transactionDate)} />
                  <Field
                    label="Producto"
                    value={
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-semibold">
                        {mapFuelProductName(t.fuelGradeName)}
                      </span>
                    }
                  />
                  <Field label="Bomba" value={`Pump ${t.pump} · M${t.nozzle}`} />
                  <Field label="Volumen" value={<span className="font-mono">{t.volume.toFixed(3)} G.</span>} />
                  <Field label="Precio" value={<span className="font-mono">{formatCurrency(t.price)}</span>} />
                  <Field label="Monto" value={<span className="font-mono font-bold">{formatCurrency(t.amount)}</span>} />
                  <Field label="Sucursal" value={t.siteId} mono />
                  <Field
                    label="Cajero"
                    value={
                      t.staftId != null
                        ? <span className="font-mono">#{t.staftId} <span className="font-sans text-text-secondary">{t.staftName ?? ''}</span></span>
                        : 'Sin asignar'
                    }
                  />
                  <Field label="Creado" value={formatDateTime(t.createdAt)} />
                </div>
              </div>
            )}
          </div>

          {/* Sección 3: Card Payments */}
          {cards.length > 0 && (
            <div>
              <SectionHeader
                open={openCard}
                onToggle={() => setOpenCard(!openCard)}
                icon={<CreditCard className="w-3 h-3 text-blue-600" />}
                title={`Pagos con Tarjeta (${cards.length})`}
              />
              {openCard && (
                <div className="space-y-2">
                  {cards.map((cp) => (
                    <div key={cp.cardPaymentId} className="bg-white rounded-sm border border-gray-200 p-3">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                        <span className="text-xs font-mono text-text-muted">{cp.cardPaymentId.slice(0, 8)}…</span>
                        <div className="text-sm font-mono font-bold">
                          {cp.currencyId} {(cp.amountCents / 100).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <Field label="Auth" value={cp.authorizationNumber} mono />
                        <Field label="Referencia" value={cp.reference} mono />
                        <Field label="Host" value={cp.host} mono />
                        <Field label="Lote" value={cp.batch} mono />
                        <Field
                          label="Tarjeta"
                          value={
                            cp.cardProduct || cp.maskedPan
                              ? (
                                <span className="text-sm font-semibold">
                                  {cp.cardProduct ?? ''}{' '}
                                  <span className="font-mono text-text-muted">{cp.maskedPan ?? ''}</span>
                                </span>
                              )
                              : '—'
                          }
                        />
                        <Field label="Terminal" value={cp.terminalId} />
                        <Field label="Datáfono" value={cp.dataphoneId} />
                        <Field label="Sucursal" value={cp.siteId} mono />
                        <Field label="Impuesto" value={<span className="font-mono">{(cp.taxCents / 100).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>} />
                        <Field label="Trans vinculada" value={cp.linkedTransNumber} mono />
                        <Field label="Fecha" value={formatDateTime(cp.updatedAt)} />
                        <Field
                          label="Estado"
                          value={
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-2xs font-medium ${cardPaymentStatusBadgeClass(cp.status)}`}>
                              {cardPaymentStatusLabel(cp.status)}
                            </span>
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton variant="ghost" onClick={onClose}>Cerrar</CompactButton>
        </div>
      </div>
    </div>
  );
};

export default FuelTransactionAdminDetailModal;
