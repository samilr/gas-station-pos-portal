import React, { useState } from 'react';
import { X, Fuel, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { authorizePump } from '../../../services/dispenserService';
import type { NozzlePrice } from '../../../types/dispenser';
import { CompactButton } from '../../ui';

interface AuthorizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pumpNumber: number;
  nozzlePrices: NozzlePrice[];
  onSuccess: () => void;
}

const AuthorizeModal: React.FC<AuthorizeModalProps> = ({
  isOpen, onClose, pumpNumber, nozzlePrices, onSuccess,
}) => {
  const [type, setType] = useState<'Amount' | 'Volume' | 'FullTank'>('Amount');
  const [dose, setDose] = useState<string>('');
  const [nozzle, setNozzle] = useState<number>(nozzlePrices[0]?.Nozzle || 1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const doseValue = type === 'FullTank' ? 0 : parseFloat(dose);
    if (type !== 'FullTank' && (!doseValue || doseValue <= 0)) {
      toast.error('Ingrese un valor válido');
      return;
    }

    const request: any = { Type: type, Dose: doseValue, Nozzle: nozzle };

    setLoading(true);
    try {
      await authorizePump(pumpNumber, request);
      toast.success(`Bomba ${pumpNumber} autorizada`, { duration: 3000 });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al autorizar:', err);
      toast.error(`Error al autorizar bomba ${pumpNumber}`, { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const selectedNozzle = nozzlePrices.find((np) => np.Nozzle === nozzle);

  if (!isOpen) return null;

  const inputCls = 'w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-sm flex items-center justify-center">
              <Fuel className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Autorizar Despacho</h3>
              <p className="text-2xs text-text-muted">Bomba #{pumpNumber}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-gray-100">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Tipo de despacho</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'Amount', label: 'Monto (RD$)' },
                { value: 'Volume', label: 'Volumen (G.)' },
                { value: 'FullTank', label: 'Tanque lleno' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`h-7 px-2 text-xs font-medium rounded-sm border transition-colors ${
                    type === opt.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-text-primary border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {nozzlePrices.length > 0 && (
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Pistola / Combustible</label>
              <select value={nozzle} onChange={(e) => setNozzle(Number(e.target.value))} className={inputCls}>
                {nozzlePrices.map((np) => (
                  <option key={np.Nozzle} value={np.Nozzle}>
                    Pistola {np.Nozzle} - {np.FuelGradeName} (RD${np.Price.toFixed(2)}/G.)
                  </option>
                ))}
              </select>
            </div>
          )}

          {type !== 'FullTank' && (
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">
                {type === 'Amount' ? 'Monto (RD$)' : 'Volumen (Galones)'}
              </label>
              <input
                type="number"
                step={type === 'Amount' ? '0.01' : '0.001'}
                min="0"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder={type === 'Amount' ? 'Ej: 2000.00' : 'Ej: 20.000'}
                className={inputCls}
                autoFocus
              />
              {type === 'Amount' && selectedNozzle && dose && parseFloat(dose) > 0 && (
                <p className="text-2xs text-text-muted mt-1">Aprox. {(parseFloat(dose) / selectedNozzle.Price).toFixed(3)} galones</p>
              )}
              {type === 'Volume' && selectedNozzle && dose && parseFloat(dose) > 0 && (
                <p className="text-2xs text-text-muted mt-1">Aprox. RD${(parseFloat(dose) * selectedNozzle.Price).toFixed(2)}</p>
              )}
            </div>
          )}

          {type === 'FullTank' && selectedNozzle && (
            <div className="bg-blue-50 border border-blue-200 rounded-sm px-3 py-2 text-xs text-blue-700">
              Se autorizará despacho de tanque lleno con <strong>{selectedNozzle.FuelGradeName}</strong> a RD${selectedNozzle.Price.toFixed(2)}/G.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-11 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <CompactButton type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancelar</CompactButton>
          <CompactButton type="submit" variant="primary" disabled={loading || (type !== 'FullTank' && (!dose || parseFloat(dose) <= 0))}>
            {loading ? <><RefreshCw className="w-3 h-3 animate-spin" /> Autorizando...</> : 'Autorizar'}
          </CompactButton>
        </div>
      </form>
    </div>
  );
};

export default AuthorizeModal;
