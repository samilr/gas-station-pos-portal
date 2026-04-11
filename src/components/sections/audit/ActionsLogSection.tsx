import React, { useState } from 'react';
import { Activity, Search, Filter, RefreshCw, Download, Calendar, User, MapPin, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useActionLogs } from '../../../hooks/useLogs';
import { IActionLog } from '../../../types/logs';
import { getCurrentSantoDomingoDate } from '../../../utils/transactionUtils';
import { formatDateToSantoDomingo } from '../../../utils/dateUtils';
import { LocationMap } from '../../common';


const ActionsLogSection: React.FC = () => {
  const {
    actionLogs,
    loading,
    startDateFilter,
    endDateFilter,
    setStartDateFilter,
    setEndDateFilter,
    refreshActionLogs,
    loadActionLogsWithDates,
    pagination,
    currentPage,
    goToPage,
  } = useActionLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAction, setSelectedAction] = useState<IActionLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: string; lng: string; title: string } | null>(null);

  // Función para aplicar filtros de fecha
  const handleApplyDateFilters = async () => {
    await loadActionLogsWithDates(startDateFilter, endDateFilter);
  };

  // Función para limpiar filtros y volver al día actual
  const handleClearFilters = async () => {
    const today = getCurrentSantoDomingoDate();
    setStartDateFilter(today);
    setEndDateFilter(today);
    await loadActionLogsWithDates(today, today);
  };

  // Filtros locales (solo sobre la página actual)
  const filteredLogs = (Array.isArray(actionLogs) ? actionLogs : []).filter(log => {
    const matchesSearch =
      (log.staft_id?.toString() || '').includes(searchTerm) ||
      (log.site_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ip_address || '').includes(searchTerm);

    const matchesUser = userFilter === '' || log.staft_id?.toString() === userFilter;
    const matchesAction = actionFilter === '' || log.action === actionFilter;

    return matchesSearch && matchesUser && matchesAction;
  });

  // Paginación del servidor
  const totalPages = pagination.totalPages;

  const handleNextPage = async () => {
    if (pagination.hasNext) {
      await goToPage(currentPage + 1);
    }
  };

  const handlePrevPage = async () => {
    if (pagination.hasPrev) {
      await goToPage(currentPage - 1);
    }
  };

  const handlePageChange = async (page: number) => {
    await goToPage(page);
  };

  const handleRefresh = () => {
    refreshActionLogs();
  };

  const handleExport = async () => {
    try {
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const handleShowLocation = (log: IActionLog) => {
    if (log.latitude && log.longitude) {
      setSelectedLocation({
        lat: log.latitude,
        lng: log.longitude,
        title: `${log.action || 'Acción'} - ${log.description || 'Sin descripción'}`
      });
      setShowLocationMap(true);
    }
  };

  const handleCloseLocationMap = () => {
    setShowLocationMap(false);
    setSelectedLocation(null);
  };

  const handleShowDetails = (log: IActionLog) => {
    setSelectedAction(log);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAction(null);
  };

  // Obtener valores únicos para filtros (de la página actual)
  const uniqueUsers = Array.from(new Set(actionLogs.map(log => log.staft_id?.toString()).filter(Boolean)));
  const uniqueActions = Array.from(new Set(actionLogs.map(log => log.action).filter(Boolean)));

  // Índices para el texto "Mostrando X a Y de Z"
  const startIndex = (currentPage - 1) * pagination.limit;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Header con búsqueda y botones de acción */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por Staff ID, acción, descripción, IP o Site ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-gray-50 border-t border-gray-200"
          >
            {/* Filtros de fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botones de acción para filtros de fecha */}
            <div className="flex items-center space-x-3 mb-4">
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                onClick={handleApplyDateFilters}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Aplicar Filtros de Fecha</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                onClick={handleClearFilters}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Limpiar Filtros</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los staff</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acción</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las acciones</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log, index) => {
                const { date, time } = formatDateToSantoDomingo(log.created_at);
                return (
                  <motion.tr
                    key={log.actionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleShowDetails(log)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{log.staft_id || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{log.action || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 truncate block max-w-xs">
                        {log.description || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{log.site_id || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{log.ip_address || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {log.latitude && log.longitude ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShowLocation(log); }}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-900 transition-colors"
                            title="Ver ubicación en mapa"
                          >
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">Ver mapa</span>
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No disponible
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{date}</div>
                          <div className="text-sm text-gray-500">{time}</div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No hay registros para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Paginación del servidor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg"
      >
        <div className="text-sm text-gray-700">
          Mostrando{' '}
          <span className="font-medium">{pagination.total === 0 ? 0 : startIndex + 1}</span> a{' '}
          <span className="font-medium">{Math.min(startIndex + pagination.limit, pagination.total)}</span> de{' '}
          <span className="font-medium">{pagination.total}</span> acciones
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: !pagination.hasPrev ? 1 : 1.05 }}
            whileTap={{ scale: !pagination.hasPrev ? 1 : 0.95 }}
            onClick={handlePrevPage}
            disabled={!pagination.hasPrev || loading}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              !pagination.hasPrev || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Anterior
          </motion.button>

          {/* Números de página */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              if (
                totalPages <= 7 ||
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {page}
                  </motion.button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 text-gray-500">...</span>;
              }
              return null;
            })}
          </div>

          <motion.button
            whileHover={{ scale: !pagination.hasNext ? 1 : 1.05 }}
            whileTap={{ scale: !pagination.hasNext ? 1 : 0.95 }}
            onClick={handleNextPage}
            disabled={!pagination.hasNext || loading}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              !pagination.hasNext || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Siguiente
          </motion.button>
        </div>
      </motion.div>

      {/* Modal de detalles */}
      {showDetailsModal && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detalles de la Acción</h3>
                  <p className="text-sm text-gray-600">{selectedAction.action || 'Sin acción'}</p>
                </div>
              </div>
              <button
                onClick={handleCloseDetailsModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Información General</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Action ID:</span>
                      <span className="text-sm font-medium">{selectedAction.actionId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Staff ID:</span>
                      <span className="text-sm font-medium">{selectedAction.staft_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Site ID:</span>
                      <span className="text-sm font-medium">{selectedAction.site_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Device ID:</span>
                      <span className="text-sm font-medium">{selectedAction.device_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Terminal ID:</span>
                      <span className="text-sm font-medium">{selectedAction.terminal_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">IP Address:</span>
                      <span className="text-sm font-medium">{selectedAction.ip_address || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Información Temporal</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fecha de Creación:</span>
                      <span className="text-sm font-medium">
                        {selectedAction.created_at ? formatDateToSantoDomingo(selectedAction.created_at).date : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hora:</span>
                      <span className="text-sm font-medium">
                        {selectedAction.created_at ? formatDateToSantoDomingo(selectedAction.created_at).time : 'N/A'}
                      </span>
                    </div>
                    {selectedAction.latitude && selectedAction.longitude && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ubicación:</span>
                        <button
                          onClick={() => handleShowLocation(selectedAction)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver en mapa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acción */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Acción Realizada</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium">{selectedAction.action || 'Sin acción'}</p>
                </div>
              </div>

              {/* Descripción */}
              {selectedAction.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Descripción</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedAction.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end items-center p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseDetailsModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                {selectedAction.latitude && selectedAction.longitude && (
                  <button
                    onClick={() => handleShowLocation(selectedAction)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Ver Ubicación</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de ubicación */}
      {showLocationMap && selectedLocation && (
        <LocationMap
          latitude={selectedLocation.lat}
          longitude={selectedLocation.lng}
          title={selectedLocation.title}
          onClose={handleCloseLocationMap}
        />
      )}
    </div>
  );
};

export default ActionsLogSection;
