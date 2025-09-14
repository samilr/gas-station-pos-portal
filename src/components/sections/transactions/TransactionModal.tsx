import React from "react";
import {
  CreditCard,
  X,
  Package,
  QrCode,
  RefreshCw,
  FileText,
  Undo2,
} from "lucide-react";
import {
  getStatusText,
  getStatusColor,
  getPaymentTypeColor,
  getCfTypeText,
  formatDate,
  formatCurrency,
} from "../../../utils/transactionUtils";
import { ITransactionResume } from "../../../types/transaction";
import pdfService from "../../../services/pdfService";
import toast from "react-hot-toast";

// Componente QR
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
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })
          .then((dataUrl) => {
            setQrDataUrl(dataUrl);
            setError("");
          })
          .catch((err) => {
            console.error("Error generando QR:", err);
            setError("Error al generar el código QR");
          });
      });
    }
  }, [url, size]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-32 h-32 border border-red-200 rounded-lg bg-red-50">
        <div className="text-center">
          <div className="w-8 h-8 text-red-500 mx-auto mb-2">⚠️</div>
          <p className="text-xs text-red-600">Error QR</p>
        </div>
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center w-32 h-32 border border-gray-200 rounded-lg bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <img
        src={qrDataUrl}
        alt="Código QR"
        className="border border-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
        style={{ width: size, height: size }}
        onClick={() => {
          // Abrir directamente el enlace sin pasar por página intermedia
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        title="Haz click para abrir la URL"
      />
    </div>
  );
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

      // Crear una nueva ventana para imprimir
      const printWindow = window.open(pdfUrl, "_blank");

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        // Si no se puede abrir la ventana, descargar el PDF
        await pdfService.generateTransactionPDF(transaction, false);
      }
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast.error("Error al generar el PDF de la transacción", {
        duration: 5000,
        icon: "❌",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Detalles de Transacción
              </h3>
              <p className="text-sm text-gray-600">{transaction.transNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-md font-semibold text-gray-900">
                {getCfTypeText(transaction.cfType)}
              </p>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  transaction.cfStatus
                )}`}
              >
                {getStatusText(transaction.cfStatus)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Número de Transacción:
                  </span>
                  <span className="text-sm font-medium">
                    {transaction.transNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Número de e-NCF:
                  </span>
                  <span className="text-sm font-medium">
                    {transaction.cfNumber}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha:</span>
                  <span className="text-sm font-medium">
                    {formatDate(transaction.transDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vendedor:</span>
                  <span className="text-sm font-medium">
                    {transaction.staftId + " - " + transaction.staftName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Turno:</span>
                  <span className="text-sm font-medium">
                    {transaction.shift}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Terminal:</span>
                  <span className="text-sm font-medium">
                    {transaction.terminalId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cliente:</span>
                  <span className="text-sm font-medium">
                    {transaction.taxpayerName || "Consumidor Final"}
                  </span>
                </div>

                {transaction.taxpayerName && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">RNC/Cédula:</span>
                      <span className="text-sm font-medium">
                        {transaction.taxpayerId}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(transaction.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ITBIS:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(transaction.tax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(transaction.total)}
                  </span>
                </div>
                {transaction.cfQr && (
                  <div className="flex items-end space-x-4">
                    <QRCodeComponent url={transaction.cfQr} size={120} />

                    <div className="flex flex-col space-y-2">
                      <br />
                      <br />
                      <br />
                      {transaction.cfSecurityCode && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            Código de Seguridad:{" "}
                          </span>

                          <span className="font-medium font-mono text-gray-500">
                            {transaction.cfSecurityCode}
                          </span>
                        </div>
                      )}
                      {transaction.digitalSignatureDate && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            Fecha Firma Digital:{" "}
                          </span>

                          <span className="font-medium text-gray-500">
                            {transaction.digitalSignatureDate}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Productos ({transaction.prods.length})
            </h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Precio Unit.
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      ITBIS
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transaction.prods.map((product) => (
                    <tr key={product.productId}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.productId}
                          </div>
                          {product.isReturn && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Devolución
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(product.tax)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(product.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Pagos ({transaction.payms.length})
            </h4>
            <div className="space-y-3">
              {transaction.payms.map((payment) => (
                <div
                  key={payment.paymentId}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeColor(
                              payment.type
                            )}`}
                          >
                            {payment.type}
                          </span>
                          {payment.isReturn && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Devolución
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(payment.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zataca Information */}
          {transaction.zataca && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                Información Zataca
              </h4>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Operador</div>
                    <div className="text-sm font-medium">
                      {transaction.zataca.operator}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Monto</div>
                    <div className="text-sm font-medium">
                      {formatCurrency(transaction.zataca.amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      Número de Referencia Local
                    </div>
                    <div className="text-sm font-medium">
                      {transaction.zataca.localReferenceNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      Número de Teléfono
                    </div>
                    <div className="text-sm font-medium">
                      {transaction.zataca.phoneNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      ID del Producto Z
                    </div>
                    <div className="text-sm font-medium">
                      {transaction.zataca.zProductId}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          {/* Botón de Reversar - Solo visible para ADMIN o AUDITOR */}
          {canReverseTransaction && (
            <button
              onClick={() => onReverseTransaction(transaction.transNumber)}
              disabled={isReversing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {isReversing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Reversando...</span>
                </>
              ) : (
                <>
                  <Undo2 className="w-4 h-4" />
                  <span>Reversar Transacción</span>
                </>
              )}
            </button>
          )}

          <div
            className={`flex space-x-3 ${
              !canReverseTransaction ? "ml-auto" : ""
            }`}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => handlePrintTransaction(transaction)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Imprimir Recibo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
