import React, { useState } from 'react';
import { Monitor, Plus, Search, Filter, RefreshCw, Edit, Trash2, Smartphone, Fuel } from 'lucide-react';
import { motion } from 'framer-motion';
import TerminalModal from './TerminalModal';
import DeleteTerminalDialog from './DeleteTerminalDialog';
import { useAuth } from '../../../context/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { useTerminals } from '../../../hooks/useTerminals';
import { ITerminal } from '../../../services/terminalService';
import { PermissionGate } from '../../common';


// Función para formatear fecha de conexión de terminal
const formatTerminalDate = (dateString: string | Date): { date: string; time: string } => {
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

  const getStatusText = (active: boolean) => active ? 'Activa' : 'Inactiva';
  const getStatusColor = (active: boolean) => active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  
  const getConnectionText = (connected: boolean) => connected ? 'Conectada' : 'Desconectada';
  const getConnectionColor = (connected: boolean) => connected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';

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
    <div className="space-y-6">
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Header con búsqueda y botones */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar terminales..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Stats Cards */}
                <div className="flex items-center space-x-4">
                  {[
                    { label: "Total", value: totalTerminals, icon: Fuel, color: "text-blue-500" },
                    { label: "Activas", value: activeTerminals, icon: Monitor, color: "text-green-500" },
                    { label: "Inactivas", value: inactiveTerminals, icon: Monitor, color: "text-red-500" }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{stat.label}</span>
                        <span className={`text-lg font-bold ${stat.label === 'Activas' ? 'text-green-600' : stat.label === 'Inactivas' ? 'text-red-600' : 'text-gray-900'}`}>
                          {stat.value}
                        </span>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Conectadas</span>
                      <span className="text-lg font-bold text-blue-600">{connectedTerminals}</span>
                      <Smartphone className="w-5 h-5 text-blue-500" />
                    </div>
                  </motion.div>
                </div>
              </div>
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
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
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
              </motion.button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                onClick={refreshTerminals}
                disabled={loading}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </motion.button>
              <PermissionGate permissions={['terminals.create']}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateTerminal}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Terminal</span>
                </motion.button>
              </PermissionGate>
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
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
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
                  <option value="">Todas</option>
                  <option value="connected">Conectadas</option>
                  <option value="disconnected">Desconectadas</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Warning Message */}
      {error && error.includes('datos de prueba') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
        >
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
        </motion.div>
      )}

      {/* Terminals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Terminal</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ID Terminal</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sitio</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Conexión</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Última Conexión</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTerminals.map((terminal, index) => (
                <motion.tr
                  key={`${terminal.site_id}-${terminal.terminal_id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(terminal)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        <Fuel className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{terminal.name}</div>
                        <div className="text-xs text-gray-400">Tipo: {terminal.terminal_type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{terminal.terminal_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{terminal.site_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(terminal.active)}`}>
                      {getStatusText(terminal.active)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConnectionColor(terminal.connected)}`}>
                      {getConnectionText(terminal.connected)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {terminal.connected_time && (
                      <div>
                        <div className="text-sm text-gray-900">{formatTerminalDate(terminal.connected_time ?? "").date}</div>
                        <div className="text-sm text-gray-500">{formatTerminalDate(terminal.connected_time ?? "").time}</div>
                      </div>
                    )}
                    {!terminal.connected_time && (
                      <span className="text-sm text-gray-500">Nunca conectada</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <PermissionGate permissions={['terminals.edit']}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditTerminal(terminal)}
                          className="p-1 text-blue-600 hover:text-blue-900" 
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </PermissionGate>
                      <PermissionGate permissions={['terminals.delete']}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteTerminal(terminal)}
                          className="p-1 text-red-600 hover:text-red-900" 
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </PermissionGate>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg"
      >
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
          <span className="font-medium">{Math.min(endIndex, filteredTerminals.length)}</span> de{' '}
          <span className="font-medium">{filteredTerminals.length}</span> terminales
          {filteredTerminals.length !== terminals.length && (
            <span className="text-gray-500"> (filtrados de {terminals.length} total)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
            whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Anterior
          </motion.button>
          
          {/* Números de página */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Mostrar solo algunas páginas para evitar demasiados botones
              if (totalPages <= 7 || 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(page)}
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
            whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
            whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Siguiente
          </motion.button>
        </div>
      </motion.div>

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
