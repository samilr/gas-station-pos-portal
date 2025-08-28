import React from 'react';
import { X, User, Mail, Shield, Building, Terminal, Clock, CheckCircle, XCircle } from 'lucide-react';
import { IUser } from '../../../services/userService';

interface UserDetailModalProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const getStatusIcon = (active: number) => active === 1 ? CheckCircle : XCircle;
  const getStatusColor = (active: number) => active === 1 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Detalles del Usuario</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.username}</p>
              <div className="flex items-center space-x-2 mt-1">
                {React.createElement(getStatusIcon(user.active), { 
                  className: `w-4 h-4 ${getStatusColor(user.active)}` 
                })}
                <span className={`text-sm font-medium ${getStatusColor(user.active)}`}>
                  {user.active === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gray-600" />
                <span>Información de Contacto</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID de Usuario</label>
                  <p className="text-gray-900 font-mono text-sm">{user.user_id}</p>
                </div>
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <span>Rol y Permisos</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Rol </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role.toLowerCase() === 'editor' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Acceso al Portal </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.portal_access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.portal_access ? 'Permitido' : 'Denegado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Building className="w-5 h-5 text-gray-600" />
                <span>Información Laboral</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Grupo de Personal</label>
                  <p className="text-gray-900">{user.staft_group}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID de Personal</label>
                  <p className="text-gray-900 font-mono text-sm">{user.staft_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Turno</label>
                  <p className="text-gray-900">Turno {user.shift}</p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-gray-600" />
                <span>Información del Sistema</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID del Sitio</label>
                  <p className="text-gray-900 font-mono text-sm">{user.site_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID del Terminal</label>
                  <p className="text-gray-900">{user.terminal_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Creado por</label>
                  <p className="text-gray-900">{user.created_by}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Editar Usuario
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;

