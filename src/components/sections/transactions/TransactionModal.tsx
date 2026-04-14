import React from "react";
import {
  CreditCard,
  X,
  Package,
  QrCode,
  RefreshCw,
  Undo2,
  Download,
  Printer,
  User,
  Building2,
  Calendar,
  Clock9,
  Monitor,
  Receipt,
} from "lucide-react";
import {
  getCfTypeText,
  formatDate,
  formatCurrency,
} from "../../../utils/transactionUtils";
import { formatDateOnly } from "../../../utils/dateUtils";
import { ITransactionResume, CFStatus } from "../../../types/transaction";
import pdfService from "../../../services/pdfService";
import toast from "react-hot-toast";
import StatusDot from "../../ui/StatusDot";
import { CompactButton } from "../../ui";

const QRCodeComponent: React.FC<{ url: string; size?: number }> = ({
  url,
  size = 128,
}) => {
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (url) {
      import("qrcode").then((QRCode) => {
        QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        })
          .then((dataUrl) => { setQrDataUrl(dataUrl); setError(""); })
          .catch((err) => { console.error("Error generando QR:", err); setError("Error al generar el código QR"); });
      });
    }
  }, [url, size]);

  if (error) {
    return (
      <div className="flex items-center justify-center border border-red-200 rounded-sm bg-red-50" style={{ width: size, height: size }}>
        <p className="text-2xs text-red-600">Error QR</p>
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center border border-gray-200 rounded-sm bg-gray-50" style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <img
      src={qrDataUrl}
      alt="QR"
      className="border border-gray-200 rounded-sm cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
      style={{ width: size, height: size }}
      onClick={() => {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
      title="Abrir QR"
    />
  );
};

const getStatusDotColor = (cfStatus: number) => {
  switch (cfStatus) {
    case CFStatus.ACCEPTED:
    case CFStatus.ACCEPTED_ALT:
      return "green";
    case CFStatus.REJECTED:
      return "red";
    case CFStatus.PENDING:
    case 0: case 1: case 5: case 6: case 7: case 8:
      return "yellow";
    default:
      return "gray";
  }
};

const getStatusLabel = (cfStatus: number) => {
  switch (cfStatus) {
    case CFStatus.ACCEPTED:
    case CFStatus.ACCEPTED_ALT:
      return "Aceptada";
    case CFStatus.REJECTED:
      return "Rechazada";
    case CFStatus.PENDING:
    case 0: case 1: case 5: case 6: case 7: case 8:
      return "Pendiente";
    default:
      return "Desconocido";
  }
};

interface TransactionModalProps {
  transaction: ITransactionResume;
  isOpen: boolean;
  onClose: () => void;
  canReverseTransaction: boolean;
  isReversing: boolean;
  onReverseTransaction: (transNumber: string) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  canReverseTransaction,
  isReversing,
  onReverseTransaction,
}) => {
  const handlePrintTransaction = async (transaction: ITransactionResume) => {
    try {
      const pdfUrl = await pdfService.generateTransactionPDF(transaction, true);
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => { printWindow.print(); };
      } else {
        await pdfService.generateTransactionPDF(transaction, false);
      }
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast.error("Error al generar el PDF", { duration: 5000, icon: "❌" });
    }
  };

  const handleDownloadTrasaction = async (transaction: ITransactionResume) => {
    try {
      await pdfService.generateTransactionPDF(transaction, false);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      toast.error("Error al descargar el PDF", { duration: 5000, icon: "❌" });
    }
  };

  if (!isOpen) return null;

  const InfoRow = ({ label, value, mono = false, danger = false }: { label: string; value: React.ReactNode; mono?: boolean; danger?: boolean }) => (
    <div className="flex justify-between items-center gap-2 py-0.5">
      <span className={`text-xs ${danger ? 'text-red-600' : 'text-text-muted'} flex-shrink-0`}>{label}</span>
      <span className={`text-sm ${danger ? 'text-red-600 font-medium' : 'text-text-primary font-medium'} ${mono ? 'font-mono' : ''} truncate`}>{value}</span>
    </div>
  );

  const sectionHeaderClass = "flex items-center gap-2 px-3 h-7 bg-table-header border-b border-table-border";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm w-full max-w-[1100px] max-h-[92vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {getCfTypeText(transaction.cfType)}
              </h3>
              <div className="flex items-center gap-2 text-2xs text-text-muted">
                <span className="font-mono">{transaction.transNumber}</span>
                <span>·</span>
                <span className="font-mono">{transaction.cfNumber}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusDot color={getStatusDotColor(transaction.cfStatus)} label={getStatusLabel(transaction.cfStatus)} />
            {transaction.cfValidity && (
              <span className="text-2xs text-text-muted">
                Válida hasta <span className="font-semibold text-text-primary">{formatDateOnly(transaction.cfValidity)}</span>
              </span>
            )}
            <button onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Reversed warning banner */}
          {transaction.returnCfNumber && transaction.returnTransNUmber && (
            <div className="mb-2 bg-red-50 border border-red-200 rounded-sm px-3 py-2 flex items-center gap-3">
              <Undo2 className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-red-600 font-semibold">Transacción reversada:</span>
                <span className="ml-2 font-mono text-red-700">{transaction.returnTransNUmber}</span>
                <span className="text-red-500 mx-1">·</span>
                <span className="font-mono text-red-700">{transaction.returnCfNumber}</span>
              </div>
            </div>
          )}

          {/* Top row: 3 columns - General / Totals / QR */}
          <div className="grid grid-cols-12 gap-2 mb-2">
            {/* General info - 5 cols */}
            <div className="col-span-12 lg:col-span-5 bg-white border border-table-border rounded-sm">
              <div className={sectionHeaderClass}>
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Información General</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-0">
                <InfoRow label="Transacción" value={transaction.transNumber} mono />
                <InfoRow label="e-NCF" value={transaction.cfNumber} mono />
                <InfoRow label="Fecha" value={formatDate(transaction.transDate)} />
                <InfoRow label="Terminal" value={transaction.terminalId} />
                <InfoRow label="Sucursal" value={transaction.siteId} />
                <InfoRow label="Turno" value={transaction.shift} />
                <InfoRow label="Vendedor" value={`${transaction.staftId} - ${transaction.staftName}`} />
                <InfoRow label="Cliente" value={transaction.taxpayerName || "Consumidor Final"} />
                {transaction.taxpayerId && <InfoRow label="RNC/Cédula" value={transaction.taxpayerId} mono />}
              </div>
            </div>

            {/* Totals - 3 cols */}
            <div className="col-span-6 lg:col-span-3 bg-white border border-table-border rounded-sm">
              <div className={sectionHeaderClass}>
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Totales</span>
              </div>
              <div className="p-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">Subtotal</span>
                  <span className="text-sm font-mono font-medium">{formatCurrency(transaction.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-text-muted">ITBIS</span>
                  <span className="text-sm font-mono font-medium">{formatCurrency(transaction.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 mt-1 border-t border-gray-200">
                  <span className="text-sm font-semibold text-text-primary">Total</span>
                  <span className="text-base font-mono font-bold text-green-600">{formatCurrency(transaction.total)}</span>
                </div>
              </div>
            </div>

            {/* QR + security - 4 cols */}
            <div className="col-span-6 lg:col-span-4 bg-white border border-table-border rounded-sm">
              <div className={sectionHeaderClass}>
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">DGII</span>
              </div>
              <div className="p-3">
                {transaction.cfQr ? (
                  <div className="flex items-start gap-3">
                    <QRCodeComponent url={transaction.cfQr} size={96} />
                    <div className="flex-1 min-w-0 space-y-1">
                      {transaction.cfSecurityCode && (
                        <div>
                          <div className="text-2xs uppercase tracking-wide text-text-muted">Código Seguridad</div>
                          <div className="text-xs font-mono font-medium break-all">{transaction.cfSecurityCode}</div>
                        </div>
                      )}
                      {transaction.digitalSignatureDate && (
                        <div>
                          <div className="text-2xs uppercase tracking-wide text-text-muted">Firma Digital</div>
                          <div className="text-xs font-medium">{transaction.digitalSignatureDate}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">Sin QR disponible</p>
                )}
              </div>
            </div>
          </div>

          {/* Products table */}
          <div className="bg-white border border-table-border rounded-sm mb-2">
            <div className={sectionHeaderClass}>
              <Package className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                Productos ({transaction.prods.length})
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 h-7 text-2xs font-medium text-text-secondary uppercase tracking-wide">Producto</th>
                    <th className="text-right px-3 h-7 text-2xs font-medium text-text-secondary uppercase tracking-wide w-20">Cant.</th>
                    <th className="text-right px-3 h-7 text-2xs font-medium text-text-secondary uppercase tracking-wide w-28">Precio</th>
                    <th className="text-right px-3 h-7 text-2xs font-medium text-text-secondary uppercase tracking-wide w-24">ITBIS</th>
                    <th className="text-right px-3 h-7 text-2xs font-medium text-text-secondary uppercase tracking-wide w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.prods.map((product) => (
                    <tr key={product.productId} className="h-8 border-t border-table-border hover:bg-row-hover">
                      <td className="px-3 text-sm text-text-primary">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{product.productName}</span>
                          <span className="text-2xs text-text-muted font-mono">{product.productId}</span>
                          {product.isReturn && (
                            <StatusDot color="red" label="Devolución" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 text-sm text-right font-mono">{product.quantity}</td>
                      <td className="px-3 text-sm text-right font-mono">{formatCurrency(product.price)}</td>
                      <td className="px-3 text-sm text-right font-mono text-text-muted">{formatCurrency(product.tax)}</td>
                      <td className="px-3 text-sm text-right font-mono font-semibold">{formatCurrency(product.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white border border-table-border rounded-sm mb-2">
            <div className={sectionHeaderClass}>
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                Pagos ({transaction.payms.length})
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 h-7 text-2xs font-medium text-text-secondary uppercase tracking-wide">Tipo</th>
                    <th className="text-left px-3 h-7 text-2xs font-medium text-text-secondary uppercase tracking-wide">Estado</th>
                    <th className="text-right px-3 h-7 text-2xs font-medium text-text-secondary uppercase tracking-wide w-32">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.payms.map((payment) => (
                    <tr key={payment.paymentId} className="h-8 border-t border-table-border hover:bg-row-hover">
                      <td className="px-3 text-sm text-text-primary font-medium">{payment.type}</td>
                      <td className="px-3 text-sm">
                        {payment.isReturn ? (
                          <StatusDot color="red" label="Devolución" />
                        ) : (
                          <StatusDot color="green" label="Completado" />
                        )}
                      </td>
                      <td className="px-3 text-sm text-right font-mono font-semibold">{formatCurrency(payment.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Zataca */}
          {transaction.zataca && (
            <div className="bg-white border border-table-border rounded-sm">
              <div className={sectionHeaderClass}>
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">Información Zataca</span>
              </div>
              <div className="p-3 grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <div className="text-2xs uppercase tracking-wide text-text-muted mb-0.5">Operador</div>
                  <div className="text-sm font-medium">{transaction.zataca.operator}</div>
                </div>
                <div>
                  <div className="text-2xs uppercase tracking-wide text-text-muted mb-0.5">Monto</div>
                  <div className="text-sm font-mono font-medium">{formatCurrency(transaction.zataca.amount)}</div>
                </div>
                <div>
                  <div className="text-2xs uppercase tracking-wide text-text-muted mb-0.5">Ref. Local</div>
                  <div className="text-sm font-mono font-medium">{transaction.zataca.localReferenceNumber}</div>
                </div>
                <div>
                  <div className="text-2xs uppercase tracking-wide text-text-muted mb-0.5">Teléfono</div>
                  <div className="text-sm font-medium">{transaction.zataca.phoneNumber}</div>
                </div>
                <div>
                  <div className="text-2xs uppercase tracking-wide text-text-muted mb-0.5">ID Producto Z</div>
                  <div className="text-sm font-mono font-medium">{transaction.zataca.zProductId}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            {canReverseTransaction && transaction.status === 1 && transaction.cfType !== "34" && !transaction.isReturn && (
              <CompactButton variant="danger" onClick={() => onReverseTransaction(transaction.transNumber)} disabled={isReversing}>
                {isReversing ? (
                  <><RefreshCw className="w-3 h-3 animate-spin" /> Reversando...</>
                ) : (
                  <><Undo2 className="w-3 h-3" /> Reversar Transacción</>
                )}
              </CompactButton>
            )}
          </div>
          <div className="flex gap-2">
            <CompactButton variant="ghost" onClick={onClose}>Cerrar</CompactButton>
            <CompactButton variant="ghost" onClick={() => handleDownloadTrasaction(transaction)}>
              <Download className="w-3 h-3" /> Descargar
            </CompactButton>
            <CompactButton variant="primary" onClick={() => handlePrintTransaction(transaction)}>
              <Printer className="w-3 h-3" /> Imprimir
            </CompactButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
