import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Edit, Trash2, MoreHorizontal, RefreshCw, Filter, Eye, EyeIcon, CheckCircle, XCircle, UserCheck, UserX, Shield } from 'lucide-react';
import { useUsers } from '../../../../hooks/useUsers';
import { useAuth } from '../../../../context/AuthContext';
import { IUser } from '../../../../services/userService';
import DeleteUserDialog from './DeleteUserDialog';
import UserModal from './UserModal';

// Función para formatear fecha de creación de usuario
const formatUserDate = (dateString: string | Date): { date: string; time: string } => {
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

const UsersSection: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { users, loading, error, refreshUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [portalAccessFilter, setPortalAccessFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<IUser | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || user.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && user.active === 1) ||
      (statusFilter === 'inactive' && user.active === 0);
    const matchesSite = siteFilter === '' || user.site_id === siteFilter;
    const matchesGroup = groupFilter === '' || user.staft_group === groupFilter;
    const matchesPortalAccess = portalAccessFilter === '' || 
      (portalAccessFilter === 'yes' && user.portal_access) ||
      (portalAccessFilter === 'no' && !user.portal_access);

    return matchesSearch && matchesRole && matchesStatus && matchesSite && matchesGroup && matchesPortalAccess;
  });

  const getStatusText = (active: number) => active === 1 ? 'Activo' : 'Inactivo';
  const getStatusColor = (active: number) => active === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (user: IUser) => {
    setModalUser(user);
    setModalMode('view');
    setIsUserModalOpen(true);
  };

  const handleCreateUser = () => {
    setModalUser(null);
    setModalMode('create');
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: IUser) => {
    setModalUser(user);
    setModalMode('edit');
    setIsUserModalOpen(true);
  };

  const handleUserModalSuccess = () => {
    refreshUsers();
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setModalUser(null);
    setModalMode('create');
  };

  const handleDeleteUser = (user: IUser) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteSuccess = () => {
    refreshUsers();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setSiteFilter('');
    setGroupFilter('');
    setPortalAccessFilter('');
  };

  // Calcular estadísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.active === 1).length;
  const inactiveUsers = users.filter(user => user.active === 0).length;
  const adminUsers = users.filter(user => user.role.toLowerCase() === 'admin').length;
  const portalAccessUsers = users.filter(user => user.portal_access).length;

  // Obtener valores únicos para los filtros
  const uniqueSites = Array.from(new Set(users.map(user => user.site_id).filter(Boolean)));
  const uniqueGroups = Array.from(new Set(users.map(user => user.staft_group).filter(Boolean)));

  // Calcular paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Funciones de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Resetear página cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, siteFilter, groupFilter, portalAccessFilter]);

  if (loading) {
    return (
      <div className="space-y-6">

        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
              <p className="text-gray-600">Administra usuarios del sistema</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={refreshUsers}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header con búsqueda y botones de acción */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar usuarios por nombre, usuario o email..."
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
                      <span className="text-lg font-bold text-gray-900">{totalUsers}</span>
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Activos</span>
                      <span className="text-lg font-bold text-green-600">{activeUsers}</span>
                      <UserCheck className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Inactivos</span>
                      <span className="text-lg font-bold text-red-600">{inactiveUsers}</span>
                      <UserX className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Admins</span>
                      <span className="text-lg font-bold text-purple-600">{adminUsers}</span>
                      <Shield className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Portal</span>
                      <span className="text-lg font-bold text-blue-600">{portalAccessUsers}</span>
                      <CheckCircle className="w-5 h-5 text-blue-500" />
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
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Limpiar</span>
              </button>
              <button 
                onClick={refreshUsers}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>
              {hasPermission('users.create') && (
                <button 
                  onClick={handleCreateUser}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Usuario</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los roles</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              {/* Sucursal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                <select 
                  value={siteFilter}
                  onChange={(e) => setSiteFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las sucursales</option>
                  {uniqueSites.map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>

              {/* Grupo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                <select 
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los grupos</option>
                  {uniqueGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              {/* Portal Access */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portal</label>
                <select 
                  value={portalAccessFilter}
                  onChange={(e) => setPortalAccessFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
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



      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Portal</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Creacion</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.staft_id  }
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>

                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{user.site_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{user.staft_group}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.active)}`}>
                      {getStatusText(user.active)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.portal_access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.portal_access ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.created_at && (
                      <div>
                        <div className="text-sm text-gray-900">{formatUserDate(user.created_at).date}</div>
                        <div className="text-sm text-gray-500">{formatUserDate(user.created_at).time}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDetails(user)}
                        className="p-1 text-gray-600 hover:text-gray-900" 
                        title="Ver detalles"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {hasPermission('users.edit') && (
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-1 text-blue-600 hover:text-blue-900" 
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission('users.delete') && (
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-1 text-red-600 hover:text-red-900" 
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
          <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> de{' '}
          <span className="font-medium">{filteredUsers.length}</span> usuarios
          {filteredUsers.length !== users.length && (
            <span className="text-gray-500"> (filtrados de {users.length} total)</span>
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

      {/* User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        user={modalUser}
        mode={modalMode}
        onSuccess={handleUserModalSuccess}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        user={userToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default UsersSection;