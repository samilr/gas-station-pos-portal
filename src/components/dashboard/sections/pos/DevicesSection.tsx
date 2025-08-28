import React, { useState } from 'react';
import { Smartphone, Plus, Search, Filter, RefreshCw, Edit, Trash2, Eye } from 'lucide-react';
import DeviceModal from './DeviceModal';
import DeleteDeviceDialog from './DeleteDeviceDialog';
import { useDevices } from '../../../../hooks/useDevices';
import { IDevice } from '../../../../services/deviceService';

// Función para formatear fecha de creación de dispositivo
const formatDeviceDate = (dateString: string | Date): { date: string; time: string } => {
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
  const { devices, loading, error, refreshDevices } = useDevices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [modalDevice, setModalDevice] = useState<IDevice | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<IDevice | null>(null);

  const filteredDevices = (Array.isArray(devices) ? devices : []).filter(device => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.siteId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && device.status) ||
      (statusFilter === 'inactive' && !device.status);
    const matchesSite = siteFilter === '' || device.siteId === siteFilter;
    const matchesDeviceType = deviceTypeFilter === '' || device.deviceType === deviceTypeFilter;

    return matchesSearch && matchesStatus && matchesSite && matchesDeviceType;
  });

  const getStatusText = (status: boolean) => status ? 'Activo' : 'Inactivo';
  const getStatusColor = (status: boolean) => status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const getDeviceTypeText = (deviceType: string) => {
    switch (deviceType) {
      case 'smartphone': return 'Smartphone';
      case 'tablet': return 'Tablet';
      case 'pos_device': return 'Dispositivo POS';
      case 'other': return 'Otro';
      default: return deviceType;
    }
  };

  const handleViewDetails = (device: IDevice) => {
    setModalDevice(device);
    setModalMode('view');
    setIsDeviceModalOpen(true);
  };

  const handleCreateDevice = () => {
    setModalDevice(null);
    setModalMode('create');
    setIsDeviceModalOpen(true);
  };

  const handleEditDevice = (device: IDevice) => {
    setModalDevice(device);
    setModalMode('edit');
    setIsDeviceModalOpen(true);
  };

  const handleDeleteDevice = (device: IDevice) => {
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
    setDeviceTypeFilter('');
  };

  // Obtener valores únicos para los filtros
  const uniqueSites = Array.from(new Set(devices.map(device => device.siteId).filter(Boolean)));
  const uniqueDeviceTypes = Array.from(new Set(devices.map(device => device.deviceType).filter(Boolean)));

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
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dispositivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispositivos</h1>
            <p className="text-gray-600">Gestiona los dispositivos móviles de punto de venta</p>
          </div>
        </div>
        <button 
          onClick={handleCreateDevice}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Dispositivo</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar dispositivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>
            <button 
              onClick={handleClearFilters}
              className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Limpiar
            </button>
          </div>
          <button 
            onClick={refreshDevices}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {uniqueSites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>

              {/* Device Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Dispositivo</label>
                <select 
                  value={deviceTypeFilter}
                  onChange={(e) => setDeviceTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {uniqueDeviceTypes.map(type => (
                    <option key={type} value={type}>{getDeviceTypeText(type)}</option>
                  ))}
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ID Dispositivo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sitio</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedDevices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{device.name}</div>
                        <div className="text-xs text-gray-400">{device.description || 'Sin descripción'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{device.deviceId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{getDeviceTypeText(device.deviceType)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{device.siteId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(device.status)}`}>
                      {getStatusText(device.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {device.createdAt && (
                      <div>
                        <div className="text-sm text-gray-900">{formatDeviceDate(device.createdAt).date}</div>
                        <div className="text-sm text-gray-500">{formatDeviceDate(device.createdAt).time}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDetails(device)}
                        className="p-1 text-gray-600 hover:text-gray-900" 
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditDevice(device)}
                        className="p-1 text-blue-600 hover:text-blue-900" 
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDevice(device)}
                        className="p-1 text-red-600 hover:text-red-900" 
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                        ? 'bg-green-600 text-white'
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
