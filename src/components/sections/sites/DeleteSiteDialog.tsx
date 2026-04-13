import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { ISite } from '../../../../types/site';

interface DeleteSiteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  site: ISite | null;
  loading?: boolean;
}

const DeleteSiteDialog: React.FC<DeleteSiteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  site,
  loading = false
}) => {
  if (!isOpen || !site) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm max-w-lg w-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Eliminar Sucursal</h3>
              <p className="text-xs text-text-muted">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-3">
            <p className="text-xs text-gray-700 mb-2">
              ¿Estás seguro de que quieres eliminar la sucursal:
            </p>
            <div className="bg-gray-50 p-3 rounded-sm">
              <p className="font-medium text-sm text-gray-900">{site.name}</p>
              <p className="text-xs text-text-muted">ID: {site.site_id}</p>
              <p className="text-xs text-text-muted">Número: {site.site_number}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3 mb-3">
            <div className="flex">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs text-yellow-800 font-medium">Advertencia</p>
                <p className="text-xs text-yellow-700">
                  Esta acción eliminará permanentemente la sucursal y todos sus datos asociados.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-7 px-3 text-sm rounded-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center space-x-2 h-7 px-3 text-sm rounded-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Eliminando...' : 'Eliminar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSiteDialog;
