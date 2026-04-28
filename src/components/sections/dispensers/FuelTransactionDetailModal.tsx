import React from 'react';
import { Fuel, X } from 'lucide-react';
import { FuelTransaction } from '../../../services/fuelTransactionService';
import { mapFuelProductName } from '../../../utils/fuelProductMapping';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: FuelTransaction | null;
}

const Field: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <div className="text-2xs uppercase tracking-wide text-text-muted">{label}</div>
    <div className={`text-sm text-text-primary ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</div>
  </div>
);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(amount);

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const FuelTransactionDetailModal: React.FC<Props> = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-sm w-full max-w-3xl shadow-xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-100 rounded-sm flex items-center justify-center">
              <Fuel className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Detalle de transacción de combustible</h3>
              <p className="text-2xs text-text-muted font-mono">#{transaction.transactionId}</p>
            </div>
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
          {/* Resumen principal */}
          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">
              Resumen
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <Field label="Fecha / Hora" value={formatDateTime(transaction.transactionDate)} />
              <Field
                label="Producto"
                value={
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-semibold">
                    {mapFuelProductName(transaction.fuelGradeName)}
                  </span>
                }
              />
              <Field label="Dispensadora" value={`Pump ${transaction.pump}`} />
              <Field label="Manguera" value={`Manguera ${transaction.nozzle}`} />
              <Field label="Volumen" value={<span className="font-mono">{transaction.volume.toFixed(3)} G.</span>} />
              <Field label="Precio" value={<span className="font-mono">{formatCurrency(transaction.price)}</span>} />
              <Field
                label="Monto"
                value={<span className="font-mono font-bold">{formatCurrency(transaction.amount)}</span>}
              />
              <Field
                label="Estado"
                value={
                  transaction.isOffline ? (
                    <StatusDot color="red" label="Offline" />
                  ) : (
                    <StatusDot color="green" label="Online" />
                  )
                }
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">
              Ubicación
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <Field label="Sucursal" value={transaction.siteId} mono />
              <Field label="PTS" value={transaction.ptsId} mono />
              <Field label="Tanque" value={transaction.tank} />
              <Field label="Tag" value={transaction.tag} mono />
            </div>
          </div>

          {/* Personal */}
          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">
              Personal
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <Field label="User ID" value={transaction.userId} mono />
              <Field label="Cajero asignado" value={transaction.staftId ?? 'Sin asignar'} mono />
            </div>
          </div>

          {/* Técnico */}
          <div>
            <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary mb-2 pb-1 border-b border-gray-200">
              Técnico
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <Field label="Hardware Tx ID" value={transaction.hardwareTransactionId} mono />
              <Field
                label="Volumen acumulado"
                value={<span className="font-mono">{transaction.totalVolume.toFixed(3)} G.</span>}
              />
              <Field
                label="Monto acumulado"
                value={<span className="font-mono">{formatCurrency(transaction.totalAmount)}</span>}
              />
              <Field
                label="TC Volume"
                value={<span className="font-mono">{transaction.tcVolume.toFixed(3)} G.</span>}
              />
              <Field
                label="Flow Rate"
                value={<span className="font-mono">{transaction.flowRate.toFixed(2)}</span>}
              />
              <Field
                label="Pump Tx uploaded / total"
                value={
                  <span className="font-mono">
                    {transaction.pumpTransactionsUploaded} / {transaction.pumpTransactionsTotal}
                  </span>
                }
              />
              <Field label="Config ID" value={transaction.configurationId} mono />
              <Field label="Inicio tx" value={formatDateTime(transaction.transactionDateStart)} />
              <Field label="Creado" value={formatDateTime(transaction.createdAt)} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton variant="ghost" onClick={onClose}>Cerrar</CompactButton>
        </div>
      </div>
    </div>
  );
};

export default FuelTransactionDetailModal;
