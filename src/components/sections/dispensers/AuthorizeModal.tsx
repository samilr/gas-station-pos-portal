import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fuel } from 'lucide-react';
import toast from 'react-hot-toast';
import { authorizePump } from '../../../services/dispenserService';
import type { AuthorizeRequest, NozzlePrice } from '../../../types/dispenser';

interface AuthorizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pumpNumber: number;
  nozzlePrices: NozzlePrice[];
  onSuccess: () => void;
}

const AuthorizeModal: React.FC<AuthorizeModalProps> = ({
  isOpen,
  onClose,
  pumpNumber,
  nozzlePrices,
  onSuccess,
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

    const request: any = {
      Type: type,
      Dose: doseValue,
      Nozzle: nozzle,
    };

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-sm shadow-xl w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Fuel className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Autorizar Despacho</h3>
                  <p className="text-xs text-text-muted">Bomba #{pumpNumber}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {/* Tipo de autorización */}
              <div>
                <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                  Tipo de despacho
                </label>
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
                      className={`h-7 px-3 text-sm font-medium rounded-sm border transition-colors ${
                        type === opt.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pistola / Grado */}
              {nozzlePrices.length > 0 && (
                <div>
                  <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                    Pistola / Combustible
                  </label>
                  <select
                    value={nozzle}
                    onChange={(e) => setNozzle(Number(e.target.value))}
                    className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {nozzlePrices.map((np) => (
                      <option key={np.Nozzle} value={np.Nozzle}>
                        Pistola {np.Nozzle} - {np.FuelGradeName} (RD${np.Price.toFixed(2)}/G.)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Valor */}
              {type !== 'FullTank' && (
                <div>
                  <label className="block text-2xs uppercase tracking-wide text-gray-500 mb-0.5">
                    {type === 'Amount' ? 'Monto (RD$)' : 'Volumen (Galones)'}
                  </label>
                  <input
                    type="number"
                    step={type === 'Amount' ? '0.01' : '0.001'}
                    min="0"
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                    placeholder={type === 'Amount' ? 'Ej: 2000.00' : 'Ej: 20.000'}
                    className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  {type === 'Amount' && selectedNozzle && dose && parseFloat(dose) > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Aprox. {(parseFloat(dose) / selectedNozzle.Price).toFixed(3)} galones
                    </p>
                  )}
                  {type === 'Volume' && selectedNozzle && dose && parseFloat(dose) > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Aprox. RD${(parseFloat(dose) * selectedNozzle.Price).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {/* Resumen */}
              {type === 'FullTank' && selectedNozzle && (
                <div className="bg-blue-50 border border-blue-200 rounded-sm p-3">
                  <p className="text-xs text-blue-700">
                    Se autorizará despacho de tanque lleno con <strong>{selectedNozzle.FuelGradeName}</strong> a RD${selectedNozzle.Price.toFixed(2)}/G.
                  </p>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="h-7 px-3 text-sm rounded-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (type !== 'FullTank' && (!dose || parseFloat(dose) <= 0))}
                  className="h-7 px-3 text-sm rounded-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Autorizar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthorizeModal;
