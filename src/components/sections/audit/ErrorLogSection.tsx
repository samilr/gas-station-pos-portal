import React, { useState } from "react";
import {
  AlertTriangle,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  User,
  Zap,
  X,
  MapPin,
} from "lucide-react";
import { useErrorLogs } from "../../../hooks/useLogs";
import { IErrorLog } from "../../../types/logs";
import { getCurrentSantoDomingoDate } from "../../../utils/transactionUtils";
import toast from "react-hot-toast";
import { formatDateToSantoDomingo } from "../../../utils/dateUtils";
import { LocationMap } from "../../common";
import { CompactButton, Pagination } from '../../ui';
import Toolbar from '../../ui/Toolbar';


const ErrorLogSection: React.FC = () => {
  const {
    errorLogs,
    loading,
    startDateFilter,
    endDateFilter,
    setStartDateFilter,
    setEndDateFilter,
    refreshErrorLogs,
    loadErrorLogsWithDates,
    pagination,
    currentPage,
    goToPage,
    changeLimit,
  } = useErrorLogs();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedError, setSelectedError] = useState<IErrorLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: string;
    lng: string;
    title: string;
  } | null>(null);

  const handleApplyDateFilters = async () => {
    await loadErrorLogsWithDates(startDateFilter, endDateFilter);
  };

  const handleClearFilters = async () => {
    const today = getCurrentSantoDomingoDate();
    setStartDateFilter(today);
    setEndDateFilter(today);
    await loadErrorLogsWithDates(today, today);
  };

  const filteredLogs = (Array.isArray(errorLogs) ? errorLogs : []).filter(
    (log) => {
      const matchesSearch =
        (log.errorCode || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (log.message || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.context || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.staftId?.toString() || "").includes(searchTerm);

      const matchesSeverity =
        severityFilter === "" || log.errorCode === severityFilter;
      const matchesEnvironment =
        environmentFilter === "" || log.siteId === environmentFilter;

      return matchesSearch && matchesSeverity && matchesEnvironment;
    }
  );

  const totalPages = pagination.totalPages;
  const startIndex = (currentPage - 1) * pagination.limit;

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
    refreshErrorLogs();
  };

  const handleExport = async () => {
    try {
      console.log('Exportando logs de errores...');
      toast.success('Exportacion iniciada');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar');
    }
  };

  const handleShowDetails = (log: IErrorLog) => {
    setSelectedError(log);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedError(null);
  };

  const handleShowLocation = (log: IErrorLog) => {
    if (log.latitude && log.longitude) {
      setSelectedLocation({
        lat: log.latitude,
        lng: log.longitude,
        title: `${log.errorCode || 'Error'} - ${log.message || 'Sin mensaje'}`
      });
      setShowLocationMap(true);
    }
  };

  const handleCloseLocationMap = () => {
    setShowLocationMap(false);
    setSelectedLocation(null);
  };

  const uniqueSeverities = Array.from(
    new Set(errorLogs.map((log) => log.errorCode).filter(Boolean))
  );
  const uniqueEnvironments = Array.from(
    new Set(errorLogs.map((log) => log.siteId).filter(Boolean))
  );

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
        searchPlaceholder="Buscar por codigo, mensaje, Staff ID..."
        chips={[
          { label: "Total", value: pagination.total, color: "red" },
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Codigo de Error</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm"
              >
                <option value="">Todos los codigos</option>
                {uniqueSeverities.map((severity) => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Site ID</label>
              <select
                value={environmentFilter}
                onChange={(e) => setEnvironmentFilter(e.target.value)}
                className="w-full h-7 px-2 text-sm border border-gray-300 rounded-sm"
              >
                <option value="">Todos los sites</option>
                {uniqueEnvironments.map((env) => (
                  <option key={env} value={env}>{env}</option>
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
                <th className="px-2 text-left text-xs font-medium text-gray-500">Vendedor</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Mensaje</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Contexto</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Codigo</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Site ID</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Ubicacion</th>
                <th className="px-2 text-left text-xs font-medium text-gray-500">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const { date, time } = formatDateToSantoDomingo(log.createdAt);
                return (
                  <tr
                    key={log.errorId}
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
                      <span className="block max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
                        {log.message || "N/A"}
                      </span>
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-gray-400" />
                        <span className="text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">{log.context || "N/A"}</span>
                      </span>
                    </td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-700">{log.errorCode || 'N/A'}</td>
                    <td className="px-2 text-sm whitespace-nowrap text-gray-500">{log.siteId || "N/A"}</td>
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
        itemLabel="errores"
      />

      {/* Modal de detalles */}
      {showDetailsModal && selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Detalles del Error</h3>
                  <p className="text-xs text-gray-600">{selectedError.errorCode || 'Sin codigo'}</p>
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
                    ['Codigo de Error', selectedError.errorCode],
                    ['Codigo Vendedor', selectedError.staftId],
                    ['Sucursal', selectedError.siteId],
                    ['Device ID', selectedError.deviceId],
                    ['Terminal', selectedError.terminalId],
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
                    <span className="font-medium">{selectedError.createdAt ? formatDateToSantoDomingo(selectedError.createdAt).date : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium">{selectedError.createdAt ? formatDateToSantoDomingo(selectedError.createdAt).time : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">IP Address:</span>
                    <span className="font-medium">{selectedError.ipAddress || 'N/A'}</span>
                  </div>
                  {selectedError.latitude && selectedError.longitude && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Ubicacion:</span>
                      <button onClick={() => handleShowLocation(selectedError)} className="text-blue-600 hover:text-blue-800 font-medium">Ver en mapa</button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-900 uppercase mb-1">Mensaje del Error</h4>
                <div className="bg-red-50 border border-red-200 rounded-sm p-2">
                  <p className="text-xs text-red-800 font-medium">{selectedError.message || 'Sin mensaje'}</p>
                </div>
              </div>

              {selectedError.context && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 uppercase mb-1">Contexto</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-sm p-2">
                    <p className="text-xs text-gray-700">{selectedError.context}</p>
                  </div>
                </div>
              )}

              {selectedError.stacktrace && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 uppercase mb-1">Stacktrace</h4>
                  <div className="bg-gray-900 border border-gray-700 rounded-sm p-2 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                      {selectedError.stacktrace}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end items-center p-3 border-t border-gray-200 gap-2">
              <CompactButton variant="ghost" onClick={handleCloseDetailsModal}>Cerrar</CompactButton>
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

export default ErrorLogSection;
