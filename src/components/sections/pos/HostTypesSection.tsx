import React, { useState } from 'react';
import { Layers, Plus, RefreshCw, Edit, Printer } from 'lucide-react';
import HostTypeModal from './HostTypeModal';
import { usePermissions } from '../../../hooks/usePermissions';
import { PermissionGate } from '../../common';
import { useHostTypes } from '../../../hooks/useHostTypes';
import { IHostType } from '../../../services/hostTypeService';
import { CompactButton, Pagination } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

const HostTypesSection: React.FC = () => {
  const { hostTypes, loading, error, refreshHostTypes } = useHostTypes();
  usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalHostType, setModalHostType] = useState<IHostType | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const list = (Array.isArray(hostTypes) ? hostTypes : ((hostTypes as any)?.data || [])) as IHostType[];

  const filtered = list.filter(h => {
    const s = searchTerm.toLowerCase();
    return (
      h.name.toLowerCase().includes(s) ||
      (h.code || '').toLowerCase().includes(s) ||
      (h.description || '').toLowerCase().includes(s)
    );
  });

  const totalItems = list.length;
  const activeCount = list.filter(h => h.active).length;
  const printerCount = list.filter(h => h.hasPrinter).length;

  const handleView = (h: IHostType) => {
    setModalHostType(h);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setModalHostType(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (h: IHostType) => {
    setModalHostType(h);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    refreshHostTypes();
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setModalHostType(null);
    setModalMode('create');
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tipos de dispositivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Toolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar tipos de dispositivo..."
        chips={[
          { label: 'Total', value: totalItems, color: 'blue' },
          { label: 'Activos', value: activeCount, color: 'green' },
          { label: 'Con impresora', value: printerCount, color: 'blue' },
        ]}
      >
        <CompactButton variant="ghost" onClick={refreshHostTypes} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
        <PermissionGate permissions={['devices.create']}>
          <CompactButton variant="primary" onClick={handleCreate}>
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </CompactButton>
        </PermissionGate>
      </Toolbar>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-2">
          <p className="text-xs text-yellow-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 text-xs font-medium text-gray-500">Nombre</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Código</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Descripción</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Impresora</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Estado</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((h) => (
                <tr
                  key={h.hostTypeId}
                  className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover cursor-pointer transition-colors"
                  onClick={() => handleView(h)}
                >
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900">{h.name}</span>
                    </div>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <span className="font-mono text-xs text-gray-700">{h.code || 'N/A'}</span>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-900">{h.description || 'N/A'}</td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    {h.hasPrinter ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Printer className="w-3 h-3" /><span className="text-xs">Sí</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <StatusDot
                      color={h.active ? 'green' : 'red'}
                      label={h.active ? 'Activo' : 'Inactivo'}
                    />
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <PermissionGate permissions={['devices.edit']}>
                        <CompactButton
                          variant="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(h);
                          }}
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                        </CompactButton>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={itemsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
        itemLabel="tipos"
        filteredTotal={list.length}
      />

      <HostTypeModal
        isOpen={isModalOpen}
        onClose={handleClose}
        hostType={modalHostType}
        mode={modalMode}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default HostTypesSection;
