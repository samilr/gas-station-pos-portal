import React, { useState } from 'react';
import { Users, Search, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin', status: 'Activo', lastLogin: '2024-01-15' },
  { id: 2, name: 'María García', email: 'maria@example.com', role: 'Editor', status: 'Activo', lastLogin: '2024-01-14' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Viewer', status: 'Inactivo', lastLogin: '2024-01-10' },
  { id: 4, name: 'Ana Martín', email: 'ana@example.com', role: 'Editor', status: 'Activo', lastLogin: '2024-01-15' },
];

const UsersSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users] = useState(mockUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-gray-600">Administra usuarios del sistema</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'Editor' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-900">
                        <MoreHorizontal className="w-4 h-4" />
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
          Mostrando <span className="font-medium">1</span> a <span className="font-medium">4</span> de{' '}
          <span className="font-medium">4</span> resultados
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors">
            Anterior
          </button>
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersSection;