import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { IProduct } from '../../../../types/product';
import { CompactButton } from '../../ui';

interface DeleteProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: IProduct | null;
  loading: boolean;
}

const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  isOpen, onClose, onConfirm, product, loading
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-sm w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-text-primary text-center mb-1">Eliminar Producto</h3>
          <p className="text-sm text-text-secondary text-center mb-4">
            ¿Eliminar el producto <strong>{product.name}</strong> (ID: {product.product_id})?
            <br /><span className="font-medium text-red-600">Esta acción no se puede deshacer.</span>
          </p>
          <div className="flex gap-2">
            <CompactButton variant="ghost" onClick={onClose} disabled={loading} className="flex-1 justify-center">Cancelar</CompactButton>
            <CompactButton variant="danger" onClick={onConfirm} disabled={loading} className="flex-1 justify-center">
              {loading ? <><RefreshCw className="w-3 h-3 animate-spin" /> Eliminando...</> : 'Eliminar'}
            </CompactButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductDialog;
