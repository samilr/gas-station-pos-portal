import React, { useState } from 'react';
import { Smartphone, Plus, Filter, RefreshCw, Edit, Trash2 } from 'lucide-react';
import DeviceModal from './DeviceModal';
import DeleteDeviceDialog from './DeleteDeviceDialog';
import { useAuth } from '../../../context/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { PermissionGate } from '../../common';
import { useDevices } from '../../../hooks/useDevices';
import { IHost } from '../../../services/deviceService';
import { formatDateDMY } from '../../../utils/dateUtils';
import { HostType } from '../../../types/host_type.enum';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';

// Función para formatear fecha de conexión
const formatConnectionDate = (dateString: string | Date | undefined): { date: string; time: string } | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const dateFormatted = formatDateDMY(dateString);
  const timeFormatted = date.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return { date: dateFormatted, time: timeFormatted };
};

const DevicesSection: React.FC = () => {
  const { } = useAuth();
  const { devices, loading, error, refreshDevices } = useDevices();
  usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [connectionFilter, setConnectionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [modalDevice, setModalDevice] = useState<IHost | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<IHost | null>(null);

  const filteredDevices = (Array.isArray(devices) ? devices : []).filter(device => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.device_id && device.device_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (device.site_id && device.site_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (device.ip_address && device.ip_address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '' ||
      (statusFilter === 'active' && device.active) ||
      (statusFilter === 'inactive' && !device.active);
    const matchesSite = siteFilter === '' || device.site_id === siteFilter;
    const matchesConnection = connectionFilter === '' ||
      (connectionFilter === 'connected' && device.connected) ||
      (connectionFilter === 'disconnected' && !device.connected);

    return matchesSearch && matchesStatus && matchesSite && matchesConnection;
  });

  const getHostTypeText = (hostTypeId?: number): string => {
    if (!hostTypeId) return 'N/A';
    switch (hostTypeId) {
      case HostType.DATAPHONE:
        return 'Datáfono';
      case HostType.ANDROID_SCANNER:
        return 'Escáner Android';
      case HostType.ANDROID_SMARTPHONE:
        return 'Smartphone Android';
      default:
        return 'Desconocido';
    }
  };

  // Calcular estadísticas
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.active).length;
  const inactiveDevices = devices.filter(d => !d.active).length;
  const connectedDevices = devices.filter(d => d.connected).length;

  const handleViewDetails = (device: IHost) => {
    setModalDevice(device);
    setModalMode('view');
    setIsDeviceModalOpen(true);
  };

  const handleCreateDevice = () => {
    setModalDevice(null);
    setModalMode('create');
    setIsDeviceModalOpen(true);
  };

  const handleEditDevice = (device: IHost) => {
    setModalDevice(device);
    setModalMode('edit');
    setIsDeviceModalOpen(true);
  };

  const handleDeleteDevice = (device: IHost) => {
    setDeviceToDelete(device);
    setIsDeleteDialogOpen(true);
  };

  const handleDeviceModalSuccess = () => {
    refreshDevices();
  };

  const handleCloseDeviceModal = () => {
    setIsDeviceModalOpen(false);
    setModalDevice(null);
    setModalMode('create');
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeviceToDelete(null);
  };

  const handleDeleteSuccess = () => {
    refreshDevices();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSiteFilter('');
    setConnectionFilter('');
  };

  // Obtener valores únicos para los filtros
  const uniqueSites = Array.from(new Set(devices.map(device => device.site_id).filter(Boolean)));

  // Calcular paginación
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDevices = filteredDevices.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dispositivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar dispositivos..."
        chips={[
          { label: 'Total', value: totalDevices, color: 'blue' },
          { label: 'Activos', value: activeDevices, color: 'green' },
          { label: 'Inactivos', value: inactiveDevices, color: 'red' },
          { label: 'Conectados', value: connectedDevices, color: 'blue' },
        ]}
      >
        <CompactButton
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-3.5 h-3.5" />
          {showFilters ? 'Ocultar Filtros' : 'Filtros'}
        </CompactButton>
        <CompactButton
          variant="ghost"
          onClick={handleClearFilters}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Limpiar
        </CompactButton>
        <CompactButton
          variant="ghost"
          onClick={refreshDevices}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
        <PermissionGate permissions={['devices.create']}>
          <CompactButton
            variant="primary"
            onClick={handleCreateDevice}
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo
          </CompactButton>
        </PermissionGate>
      </Toolbar>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Sitio</label>
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {uniqueSites.map(site => (
                  <option key={site} value={site}>{site}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Conexión</label>
              <select
                value={connectionFilter}
                onChange={(e) => setConnectionFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="connected">Conectados</option>
                <option value="disconnected">Desconectados</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Warning Message */}
      {error && error.includes('datos de prueba') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-yellow-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Devices Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 text-xs font-medium text-gray-500">Dispositivo</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Tipo</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Sitio</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Estado</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Conexión</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Última Conexión</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDevices.map((device) => (
                <tr
                  key={device.host_id}
                  className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(device)}
                >
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-ellipsis overflow-hidden whitespace-nowrap">{device.name}</span>
                      {device.device_id && (
                        <span className="text-xs text-gray-400">({device.device_id?.toUpperCase().substring(10,16)})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-900">{getHostTypeText(device.host_type_id)}</td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-900">{device.site_id || 'N/A'}</td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <StatusDot
                      color={device.active ? 'green' : 'red'}
                      label={device.active ? 'Activo' : 'Inactivo'}
                    />
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <StatusDot
                      color={device.connected ? 'blue' : 'gray'}
                      label={device.connected ? 'Conectado' : 'Desconectado'}
                    />
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-900">
                    {device.connected_last_time
                      ? `${formatConnectionDate(device.connected_last_time)?.date} ${formatConnectionDate(device.connected_last_time)?.time}`
                      : <span className="text-gray-400">Nunca</span>
                    }
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <PermissionGate permissions={['devices.edit']}>
                        <CompactButton
                          variant="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDevice(device);
                          }}
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                        </CompactButton>
                      </PermissionGate>
                      <PermissionGate permissions={['devices.delete']}>
                        <CompactButton
                          variant="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDevice(device);
                          }}
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
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

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white px-3 py-1.5 border border-gray-200 rounded-sm">
        <div className="text-xs text-gray-700">
          Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
          <span className="font-medium">{Math.min(endIndex, filteredDevices.length)}</span> de{' '}
          <span className="font-medium">{filteredDevices.length}</span> dispositivos
          {filteredDevices.length !== devices.length && (
            <span className="text-gray-500"> (filtrados de {devices.length} total)</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <CompactButton
            variant="ghost"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Anterior
          </CompactButton>

          <div className="flex items-center gap-0.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              if (totalPages <= 7 ||
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <CompactButton
                    key={page}
                    variant={page === currentPage ? 'primary' : 'ghost'}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </CompactButton>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-1 text-xs text-gray-500">...</span>;
              }
              return null;
            })}
          </div>

          <CompactButton
            variant="ghost"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </CompactButton>
        </div>
      </div>

      {/* Device Modal */}
      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={handleCloseDeviceModal}
        device={modalDevice}
        mode={modalMode}
        onSuccess={handleDeviceModalSuccess}
      />

      {/* Delete Device Dialog */}
      <DeleteDeviceDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        device={deviceToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default DevicesSection;
