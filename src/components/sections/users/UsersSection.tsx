import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, RefreshCw, Filter } from 'lucide-react';
import DeleteUserDialog from './DeleteUserDialog';
import UserModal from './UserModal';
import { useAuth } from '../../../context/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import { useUsers } from '../../../hooks/useUsers';
import { IUser } from '../../../services/userService';
import { PermissionGate } from '../../common';
import { Role } from '../../../config/permissions';
import { formatDateDMY } from '../../../utils/dateUtils';
import { CompactButton } from '../../ui';
import StatusDot from '../../ui/StatusDot';
import Toolbar from '../../ui/Toolbar';
import { CompactSelect } from '../../ui/CompactInput';
import CompactTable from '../../ui/CompactTable';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<IUser>();

const UsersSection: React.FC = () => {
  const { } = useNavigate();
  const { } = useAuth();
  const { users, loading, error, refreshUsers } = useUsers();
  const { } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [portalAccessFilter, setPortalAccessFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<IUser | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const filteredUsers = useMemo(() => {
    return (Array.isArray(users) ? users : []).filter(user => {
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
  }, [users, searchTerm, roleFilter, statusFilter, siteFilter, groupFilter, portalAccessFilter]);

  const handleViewDetails = (user: IUser) => { setModalUser(user); setModalMode('view'); setIsUserModalOpen(true); };
  const handleCreateUser = () => { setModalUser(null); setModalMode('create'); setIsUserModalOpen(true); };
  const handleEditUser = (user: IUser) => { setModalUser(user); setModalMode('edit'); setIsUserModalOpen(true); };
  const handleUserModalSuccess = () => { refreshUsers(); };
  const handleCloseUserModal = () => { setIsUserModalOpen(false); setModalUser(null); setModalMode('create'); };
  const handleDeleteUser = (user: IUser) => { setUserToDelete(user); setIsDeleteDialogOpen(true); };
  const handleCloseDeleteDialog = () => { setIsDeleteDialogOpen(false); setUserToDelete(null); };
  const handleDeleteSuccess = () => { refreshUsers(); };
  const handleClearFilters = () => {
    setSearchTerm(''); setRoleFilter(''); setStatusFilter('');
    setSiteFilter(''); setGroupFilter(''); setPortalAccessFilter('');
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.active === 1).length;
  const inactiveUsers = users.filter(u => u.active === 0).length;
  const adminUsers = users.filter(u => u.role.toLowerCase() === Role.ADMIN.toLowerCase()).length;

  const uniqueSites = Array.from(new Set(users.map(u => u.site_id).filter(Boolean)));
  const uniqueGroups = Array.from(new Set(users.map(u => u.staft_group).filter(Boolean)));

  const getRoleDotColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'purple';
      case 'manager': return 'blue';
      case 'supervisor': return 'green';
      case 'audit': return 'orange';
      default: return 'gray';
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Usuario',
      size: 200,
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-100 rounded text-2xs font-medium text-blue-600 flex items-center justify-center flex-shrink-0">
              {user.staft_id}
            </div>
            <span className="text-sm text-text-primary truncate">{user.name}</span>
            <span className="text-text-muted truncate">{user.email}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('site_id', {
      header: 'Sucursal',
      size: 100,
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('role', {
      header: 'Rol',
      size: 100,
      cell: (info) => <StatusDot color={getRoleDotColor(info.getValue())} label={info.getValue()} />,
    }),
    columnHelper.accessor('staft_group', {
      header: 'Grupo',
      size: 100,
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('active', {
      header: 'Estado',
      size: 80,
      cell: (info) => (
        <StatusDot
          color={info.getValue() === 1 ? 'green' : 'red'}
          label={info.getValue() === 1 ? 'Activo' : 'Inactivo'}
        />
      ),
    }),
    columnHelper.accessor('portal_access', {
      header: 'Portal',
      size: 60,
      cell: (info) => (
        <StatusDot
          color={info.getValue() ? 'green' : 'red'}
          label={info.getValue() ? 'Sí' : 'No'}
        />
      ),
    }),
    columnHelper.accessor('created_at', {
      header: 'Fecha',
      size: 100,
      cell: (info) => {
        const val = info.getValue();
        if (!val) return null;
        return <span className="text-sm">{formatDateDMY(val)}</span>;
      },
    }),
  ], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="bg-white rounded-sm border border-table-border p-4">
        <p className="text-sm text-red-600 mb-2">{error}</p>
        <CompactButton variant="primary" onClick={refreshUsers}>
          <RefreshCw className="w-3 h-3" /> Reintentar
        </CompactButton>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <Toolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar usuarios..."
        chips={[
          { label: 'Total', value: totalUsers },
          { label: 'Activos', value: activeUsers, color: 'green' },
          { label: 'Inactivos', value: inactiveUsers, color: 'red' },
          { label: 'Admins', value: adminUsers, color: 'purple' },
        ]}
      >
        <CompactButton variant="icon" onClick={() => setShowFilters(!showFilters)} title="Filtros">
          <Filter className={`w-[13px] h-[13px] ${showFilters ? 'text-blue-600' : ''}`} />
        </CompactButton>
        <CompactButton variant="icon" onClick={handleClearFilters} title="Limpiar">
          <RefreshCw className="w-[13px] h-[13px]" />
        </CompactButton>
        <CompactButton variant="ghost" onClick={refreshUsers}>
          <RefreshCw className="w-3 h-3" /> Actualizar
        </CompactButton>
        <PermissionGate roles={[Role.ADMIN]}>
          <CompactButton variant="primary" onClick={handleCreateUser}>
            <Plus className="w-3 h-3" /> Nuevo Usuario
          </CompactButton>
        </PermissionGate>
      </Toolbar>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 border border-table-border rounded-sm p-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Rol</label>
              <CompactSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full">
                <option value="">Todos</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
                <option value="AUDIT">AUDIT</option>
              </CompactSelect>
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Estado</label>
              <CompactSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full">
                <option value="">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </CompactSelect>
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Sucursal</label>
              <CompactSelect value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="w-full">
                <option value="">Todas</option>
                {uniqueSites.map(site => <option key={site} value={site}>{site}</option>)}
              </CompactSelect>
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Grupo</label>
              <CompactSelect value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="w-full">
                <option value="">Todos</option>
                {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </CompactSelect>
            </div>
            <div>
              <label className="block text-2xs uppercase tracking-wide text-text-muted mb-0.5">Portal</label>
              <CompactSelect value={portalAccessFilter} onChange={(e) => setPortalAccessFilter(e.target.value)} className="w-full">
                <option value="">Todos</option>
                <option value="yes">Sí</option>
                <option value="no">No</option>
              </CompactSelect>
            </div>
          </div>
        </div>
      )}

      {/* Warning */}
      {error && error.includes('datos de prueba') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-sm px-3 py-2 text-xs text-yellow-800">{error}</div>
      )}

      {/* Table */}
      <CompactTable
        data={filteredUsers}
        columns={columns}
        onRowClick={handleViewDetails}
        renderRowActions={(user) => (
          <PermissionGate roles={[Role.ADMIN]}>
            <button onClick={(e) => { e.stopPropagation(); handleEditUser(user); }} className="p-0.5 text-blue-600 hover:text-blue-900" title="Editar">
              <Edit className="w-3.5 h-3.5" />
            </button>
            <PermissionGate permissions={['users.delete']}>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(user); }} className="p-0.5 text-red-600 hover:text-red-900" title="Eliminar">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </PermissionGate>
          </PermissionGate>
        )}
        pageSize={15}
      />

      {/* Modals */}
      <UserModal isOpen={isUserModalOpen} onClose={handleCloseUserModal} user={modalUser} mode={modalMode} onSuccess={handleUserModalSuccess} />
      <DeleteUserDialog isOpen={isDeleteDialogOpen} onClose={handleCloseDeleteDialog} user={userToDelete} onSuccess={handleDeleteSuccess} />
    </div>
  );
};

export default UsersSection;
