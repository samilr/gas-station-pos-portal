import React, { useState } from 'react';
import { Activity, Filter, RefreshCw, Download, Calendar, User, MapPin, X } from 'lucide-react';
import { useActionLogs } from '../../../hooks/useLogs';
import { IActionLog } from '../../../types/logs';
import { getCurrentSantoDomingoDate } from '../../../utils/transactionUtils';
import { formatDateToSantoDomingo } from '../../../utils/dateUtils';
import { LocationMap } from '../../common';
import { CompactButton, Pagination } from '../../ui';
import Toolbar from '../../ui/Toolbar';


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
    changeLimit,
  } = useActionLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAction, setSelectedAction] = useState<IActionLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: string; lng: string; title: string } | null>(null);

  const handleApplyDateFilters = async () => {
    await loadActionLogsWithDates(startDateFilter, endDateFilter);
  };

  const handleClearFilters = async () => {
    const today = getCurrentSantoDomingoDate();
    setStartDateFilter(today);
    setEndDateFilter(today);
    await loadActionLogsWithDates(today, today);
  };

  const filteredLogs = (Array.isArray(actionLogs) ? actionLogs : []).filter(log => {
    const matchesSearch =
      (log.staftId?.toString() || '').includes(searchTerm) ||
      (log.siteId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ipAddress || '').includes(searchTerm);

    const matchesUser = userFilter === '' || log.staftId?.toString() === userFilter;
    const matchesAction = actionFilter === '' || log.action === actionFilter;

    return matchesSearch && matchesUser && matchesAction;
  });

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
        title: `${log.action || 'Accion'} - ${log.description || 'Sin descripcion'}`
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

  const uniqueUsers = Array.from(new Set(actionLogs.map(log => log.staftId?.toString()).filter(Boolean)));
  const uniqueActions = Array.from(new Set(actionLogs.map(log => log.action).filter(Boolean)));

  const startIndex = (currentPage - 1) * pagination.limit;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por Staff ID, accion, IP..."
        chips={[
          { label: "Total", value: pagination.total, color: "blue" },
        ]}
      >
        <CompactButton variant="ghost" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-3.5 h-3.5" />
          {showFilters ? 'Ocultar' : 'Filtros'}
        </CompactButton>
        <CompactButton variant="ghost" onClick={handleExport}>
          <Download className="w-3.5 h-3.5" />
        </CompactButton>
        <CompactButton variant="primary" onClick={handleRefresh}>
          <RefreshCw className="w-3.5 h-3.5" />
        </CompactButton>
      </Toolbar>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="p-2 bg-gray-50 border border-gray-200 rounded-sm space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CompactButton variant="primary" onClick={handleApplyDateFilters} disabled={loading}>
              <Calendar className="w-3.5 h-3.5" />
              Aplicar Fechas
            </CompactButton>
            <CompactButton variant="ghost" onClick={handleClearFilters} disabled={loading}>
              <RefreshCw className="w-3.5 h-3.5" />
              Limpiar
            </CompactButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Staff ID</label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm"
              >
                <option value="">Todos los staff</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Accion</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm"
              >
                <option value="">Todas las acciones</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="px-2 text-left text-xs font-medium text-gray-500">Usuario</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Accion</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Descripcion</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Site ID</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">IP</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Ubicacion</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const { date, time } = formatDateToSantoDomingo(log.createdAt);
                return (
                  <tr
                    key={log.actionId}
                    className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover cursor-pointer transition-colors"
                    onClick={() => handleShowDetails(log)}
                  >
                    <td className="px-2 text-sm whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="font-medium text-gray-900">{log.staftId || 'N/A'}</span>
                      </span>
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-gray-400" />
                        {log.action || 'N/A'}
                      </span>
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <span className="block max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
                        {log.description || 'N/A'}
                      </span>
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-700">{log.siteId || 'N/A'}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-700">{log.ipAddress || 'N/A'}</td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      {log.latitude && log.longitude ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShowLocation(log); }}
                          className="text-blue-600 hover:text-blue-900 text-xs flex items-center gap-0.5"
                          title="Ver ubicacion en mapa"
                        >
                          <MapPin className="w-3 h-3" />Ver mapa
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">N/D</span>
                      )}
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <span className="text-xs text-gray-700">{date} {time}</span>
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-sm text-gray-500">
                    No hay registros para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginacion del servidor */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={handlePageChange}
        onPageSizeChange={changeLimit}
        itemLabel="registros"
      />

      {/* Modal de detalles */}
      {showDetailsModal && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Detalles de la Accion</h3>
                  <p className="text-xs text-gray-600">{selectedAction.action || 'Sin accion'}</p>
                </div>
              </div>
              <button onClick={handleCloseDetailsModal} className="p-1 hover:bg-gray-100 rounded-sm">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-gray-900 uppercase">Informacion General</h4>
                  {[
                    ['Action ID', selectedAction.actionId],
                    ['Staff ID', selectedAction.staftId],
                    ['Site ID', selectedAction.siteId],
                    ['Device ID', selectedAction.deviceId],
                    ['Terminal ID', selectedAction.terminalId],
                    ['IP Address', selectedAction.ipAddress],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between text-xs">
                      <span className="text-gray-600">{label}:</span>
                      <span className="font-medium">{(val as string) || 'N/A'}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-gray-900 uppercase">Informacion Temporal</h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">{selectedAction.createdAt ? formatDateToSantoDomingo(selectedAction.createdAt).date : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium">{selectedAction.createdAt ? formatDateToSantoDomingo(selectedAction.createdAt).time : 'N/A'}</span>
                  </div>
                  {selectedAction.latitude && selectedAction.longitude && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Ubicacion:</span>
                      <button onClick={() => handleShowLocation(selectedAction)} className="text-blue-600 hover:text-blue-800 font-medium">Ver en mapa</button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-900 uppercase mb-1">Accion Realizada</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-sm p-2">
                  <p className="text-xs text-blue-800 font-medium">{selectedAction.action || 'Sin accion'}</p>
                </div>
              </div>

              {selectedAction.description && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 uppercase mb-1">Descripcion</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-sm p-2">
                    <p className="text-xs text-gray-700">{selectedAction.description}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end items-center p-3 border-t border-gray-200 gap-2">
              <CompactButton variant="ghost" onClick={handleCloseDetailsModal}>Cerrar</CompactButton>
              {selectedAction.latitude && selectedAction.longitude && (
                <CompactButton variant="primary" onClick={() => handleShowLocation(selectedAction)}>
                  <MapPin className="w-3.5 h-3.5" />
                  Ver Ubicacion
                </CompactButton>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de ubicacion */}
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
