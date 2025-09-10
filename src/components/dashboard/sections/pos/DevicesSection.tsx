import React, { useState } from 'react';
import { Smartphone, Plus, Search, Filter, RefreshCw, Edit, Trash2, Eye, Monitor, Globe } from 'lucide-react';
import DeviceModal from './DeviceModal';
import DeleteDeviceDialog from './DeleteDeviceDialog';
import { useDevices } from '../../../../hooks/useDevices';
import { useAuth } from '../../../../context/AuthContext';
import { IHost } from '../../../../services/deviceService';
import { usePermissions } from '../../../../hooks/usePermissions';
import { PermissionGate } from '../../../common';

// Función para formatear fecha de conexión
const formatConnectionDate = (dateString: string | Date | undefined): { date: string; time: string } | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const dateFormatted = date.toLocaleDateString('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const timeFormatted = date.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return { date: dateFormatted, time: timeFormatted };
};

const DevicesSection: React.FC = () => {
  const { hasPermission } = useAuth();
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

  const getStatusText = (status: boolean) => status ? 'Activo' : 'Inactivo';
  const getStatusColor = (status: boolean) => status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const getConnectionText = (connected: boolean) => connected ? 'Conectado' : 'Desconectado';
  const getConnectionColor = (connected: boolean) => connected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';

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
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header con búsqueda y botones */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar dispositivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Stats Cards */}
                <div className="flex items-center space-x-4">
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="text-lg font-bold text-gray-900">{totalDevices}</span>
                      <Smartphone className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Activos</span>
                      <span className="text-lg font-bold text-green-600">{activeDevices}</span>
                      <Monitor className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Inactivos</span>
                      <span className="text-lg font-bold text-red-600">{inactiveDevices}</span>
                      <Monitor className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Conectados</span>
                      <span className="text-lg font-bold text-blue-600">{connectedDevices}</span>
                      <Globe className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
              </button>
              <button 
                onClick={handleClearFilters}
                disabled={loading}
                className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                  loading 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{loading ? 'Limpiando...' : 'Limpiar'}</span>
              </button>
              <button 
                onClick={refreshDevices}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
              <PermissionGate permissions={['devices.create']}>
                <button 
                  onClick={handleCreateDevice}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Dispositivo</span>
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              {/* Site Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sitio</label>
                <select 
                  value={siteFilter}
                  onChange={(e) => setSiteFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {uniqueSites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>

              {/* Connection Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conexión</label>
                <select 
                  value={connectionFilter}
                  onChange={(e) => setConnectionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="connected">Conectados</option>
                  <option value="disconnected">Desconectados</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning Message */}
      {error && error.includes('datos de prueba') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Devices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dispositivo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Host ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sitio</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Conexión</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Última Conexión</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedDevices.map((device) => (
                <tr 
                  key={device.host_id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(device)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{device.name}</div>
                        <div className="text-xs text-gray-400">{device.description || 'Sin descripción'}</div>
                        {device.device_id && (
                          <div className="text-xs text-gray-500">ID: {device.device_id?.toUpperCase().substring(10,16)}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{device.host_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {device.ip_address ? 
                        (device.ip_address.length > 16 ? 
                          `${device.ip_address.substring(0, 16)}...` : 
                          device.ip_address
                        ) : 
                        'N/A'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{device.site_id || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(device.active)}`}>
                      {getStatusText(device.active)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConnectionColor(device.connected)}`}>
                      {getConnectionText(device.connected)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {device.connected_last_time ? (
                      <div>
                        <div className="text-sm text-gray-900">{formatConnectionDate(device.connected_last_time)?.date}</div>
                        <div className="text-sm text-gray-500">{formatConnectionDate(device.connected_last_time)?.time}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Nunca</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <PermissionGate permissions={['devices.edit']}>
                        <button 
                          onClick={() => handleEditDevice(device)}
                          className="p-1 text-blue-600 hover:text-blue-900" 
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </PermissionGate>
                      <PermissionGate permissions={['devices.delete']}>
                        <button 
                          onClick={() => handleDeleteDevice(device)}
                          className="p-1 text-red-600 hover:text-red-900" 
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
      <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
          <span className="font-medium">{Math.min(endIndex, filteredDevices.length)}</span> de{' '}
          <span className="font-medium">{filteredDevices.length}</span> dispositivos
          {filteredDevices.length !== devices.length && (
            <span className="text-gray-500"> (filtrados de {devices.length} total)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Anterior
          </button>
          
          {/* Números de página */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Mostrar solo algunas páginas para evitar demasiados botones
              if (totalPages <= 7 || 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 text-gray-500">...</span>;
              }
              return null;
            })}
          </div>
          
          <button 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Siguiente
          </button>
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
