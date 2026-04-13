import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { IProduct } from '../../../../types/product';

interface DeleteProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: IProduct | null;
  loading: boolean;
}

const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  product,
  loading
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-sm flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Eliminar Producto</h2>
              <p className="text-xs text-text-muted">Confirmar eliminación</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <p className="text-sm text-gray-700 mb-3">
              ¿Está seguro de que desea eliminar el siguiente producto?
            </p>

            <div className="bg-gray-50 rounded-sm p-3 border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-sm flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">{product.name}</h3>
                  <p className="text-xs text-text-muted">ID: {product.product_id}</p>
                  {product.description && (
                    <p className="text-xs text-text-muted mt-0.5">{product.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs text-yellow-800 font-medium">Advertencia</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Esta acción no se puede deshacer. El producto será eliminado permanentemente del sistema.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-4 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-7 px-3 text-sm rounded-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center space-x-2 h-7 px-3 text-sm rounded-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{loading ? 'Eliminando...' : 'Eliminar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductDialog;
