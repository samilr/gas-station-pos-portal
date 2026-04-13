import React, { useState } from 'react';
import { Plus, Filter, RefreshCw, Edit, Trash2, Fuel } from 'lucide-react';
import TerminalModal from './TerminalModal';
import DeleteTerminalDialog from './DeleteTerminalDialog';
import { useAuth } from '../../../context/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { useTerminals } from '../../../hooks/useTerminals';
import { ITerminal } from '../../../services/terminalService';
import { PermissionGate } from '../../common';
import { formatDateDMY } from '../../../utils/dateUtils';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';


// Función para formatear fecha de conexión de terminal
const formatTerminalDate = (dateString: string | Date): { date: string; time: string } => {
  const date = new Date(dateString);
  const dateFormatted = formatDateDMY(dateString);
  const timeFormatted = date.toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return { date: dateFormatted, time: timeFormatted };
};

const TerminalsSection: React.FC = () => {
  const { } = useAuth();
  const { terminals, loading, error, refreshTerminals } = useTerminals();
  usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [connectionFilter, setConnectionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);
  const [modalTerminal, setModalTerminal] = useState<ITerminal | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [terminalToDelete, setTerminalToDelete] = useState<ITerminal | null>(null);

  const filteredTerminals = (Array.isArray(terminals) ? terminals : []).filter(terminal => {
    const matchesSearch =
      terminal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      terminal.terminal_id.toString().includes(searchTerm.toLowerCase()) ||
      terminal.site_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' ||
      (statusFilter === 'active' && terminal.active) ||
      (statusFilter === 'inactive' && !terminal.active);

    const matchesSite = siteFilter === '' || terminal.site_id === siteFilter;

    const matchesConnection = connectionFilter === '' ||
      (connectionFilter === 'connected' && terminal.connected) ||
      (connectionFilter === 'disconnected' && !terminal.connected);

    return matchesSearch && matchesStatus && matchesSite && matchesConnection;
  });

  // Calcular estadísticas
  const totalTerminals = terminals.length;
  const activeTerminals = terminals.filter(t => t.active).length;
  const inactiveTerminals = terminals.filter(t => !t.active).length;
  const connectedTerminals = terminals.filter(t => t.connected).length;

  const handleViewDetails = (terminal: ITerminal) => {
    setModalTerminal(terminal);
    setModalMode('view');
    setIsTerminalModalOpen(true);
  };

  const handleCreateTerminal = () => {
    setModalTerminal(null);
    setModalMode('create');
    setIsTerminalModalOpen(true);
  };

  const handleEditTerminal = (terminal: ITerminal) => {
    setModalTerminal(terminal);
    setModalMode('edit');
    setIsTerminalModalOpen(true);
  };

  const handleDeleteTerminal = (terminal: ITerminal) => {
    setTerminalToDelete(terminal);
    setIsDeleteDialogOpen(true);
  };

  const handleTerminalModalSuccess = () => {
    refreshTerminals();
  };

  const handleCloseTerminalModal = () => {
    setIsTerminalModalOpen(false);
    setModalTerminal(null);
    setModalMode('create');
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTerminalToDelete(null);
  };

  const handleDeleteSuccess = () => {
    refreshTerminals();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSiteFilter('');
    setConnectionFilter('');
  };

  // Obtener valores únicos para los filtros
  const uniqueSites = Array.from(new Set(terminals.map(terminal => terminal.site_id).filter(Boolean)));

  // Calcular paginación
  const totalPages = Math.ceil(filteredTerminals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTerminals = filteredTerminals.slice(startIndex, endIndex);

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
          <p className="text-gray-600">Cargando terminales...</p>
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
        searchPlaceholder="Buscar terminales..."
        chips={[
          { label: 'Total', value: totalTerminals, color: 'blue' },
          { label: 'Activas', value: activeTerminals, color: 'green' },
          { label: 'Inactivas', value: inactiveTerminals, color: 'red' },
          { label: 'Conectadas', value: connectedTerminals, color: 'blue' },
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
          onClick={refreshTerminals}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </CompactButton>
        <PermissionGate permissions={['terminals.create']}>
          <CompactButton
            variant="primary"
            onClick={handleCreateTerminal}
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Terminal
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
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
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
                <option value="">Todas</option>
                <option value="connected">Conectadas</option>
                <option value="disconnected">Desconectadas</option>
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

      {/* Terminals Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="h-8 text-xs uppercase tracking-wide bg-table-header border-b border-table-border">
                <th className="text-left px-2 text-xs font-medium text-gray-500">Terminal</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">ID Terminal</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Sitio</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Estado</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Conexión</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Última Conexión</th>
                <th className="text-left px-2 text-xs font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTerminals.map((terminal) => (
                <tr
                  key={`${terminal.site_id}-${terminal.terminal_id}`}
                  className="h-8 max-h-8 border-b border-table-border hover:bg-row-hover cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(terminal)}
                >
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-ellipsis overflow-hidden whitespace-nowrap">{terminal.name}</span>
                      <span className="text-xs text-gray-400">({terminal.terminal_type})</span>
                    </div>
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-900">{terminal.terminal_id}</td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-900">{terminal.site_id}</td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <StatusDot
                      color={terminal.active ? 'green' : 'red'}
                      label={terminal.active ? 'Activa' : 'Inactiva'}
                    />
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <StatusDot
                      color={terminal.connected ? 'blue' : 'gray'}
                      label={terminal.connected ? 'Conectada' : 'Desconectada'}
                    />
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap text-gray-900">
                    {terminal.connected_time
                      ? `${formatTerminalDate(terminal.connected_time).date} ${formatTerminalDate(terminal.connected_time).time}`
                      : <span className="text-gray-400">Nunca conectada</span>
                    }
                  </td>
                  <td className="px-2 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <PermissionGate permissions={['terminals.edit']}>
                        <CompactButton
                          variant="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTerminal(terminal);
                          }}
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                        </CompactButton>
                      </PermissionGate>
                      <PermissionGate permissions={['terminals.delete']}>
                        <CompactButton
                          variant="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTerminal(terminal);
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
          <span className="font-medium">{Math.min(endIndex, filteredTerminals.length)}</span> de{' '}
          <span className="font-medium">{filteredTerminals.length}</span> terminales
          {filteredTerminals.length !== terminals.length && (
            <span className="text-gray-500"> (filtrados de {terminals.length} total)</span>
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

      {/* Terminal Modal */}
      <TerminalModal
        isOpen={isTerminalModalOpen}
        onClose={handleCloseTerminalModal}
        terminal={modalTerminal}
        mode={modalMode}
        onSuccess={handleTerminalModalSuccess}
      />

      {/* Delete Terminal Dialog */}
      <DeleteTerminalDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        terminal={terminalToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default TerminalsSection;
