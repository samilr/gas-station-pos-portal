import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { CompactButton } from '../../ui';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'red' | 'orange' | 'green';
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', confirmColor = 'red',
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // El error se maneja en el llamador
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const variant = confirmColor === 'red' ? 'danger' : 'primary';
  const iconBg = confirmColor === 'red' ? 'bg-red-100' : confirmColor === 'orange' ? 'bg-orange-100' : 'bg-green-100';
  const iconColor = confirmColor === 'red' ? 'text-red-600' : confirmColor === 'orange' ? 'text-orange-600' : 'text-green-600';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-sm w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${iconBg} mb-3`}>
            <AlertCircle className={`h-5 w-5 ${iconColor}`} />
          </div>
          <h3 className="text-base font-semibold text-text-primary text-center mb-1">{title}</h3>
          <p className="text-sm text-text-secondary text-center mb-4">{message}</p>
          <div className="flex gap-2">
            <CompactButton variant="ghost" onClick={onClose} disabled={loading} className="flex-1 justify-center">Cancelar</CompactButton>
            <CompactButton variant={variant} onClick={handleConfirm} disabled={loading} className="flex-1 justify-center">
              {loading ? <><RefreshCw className="w-3 h-3 animate-spin" /> Procesando...</> : confirmLabel}
            </CompactButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
