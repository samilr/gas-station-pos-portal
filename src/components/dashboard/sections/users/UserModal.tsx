import React, { useState, useEffect } from 'react';
import { User, Shield, Building, Save, X, Eye, EyeOff, Edit, UserPlus } from 'lucide-react';
import { userService, IUser } from '../../../../services/userService';
import toast from 'react-hot-toast';
import { usePermissions } from '../../../../hooks/usePermissions';

interface UserFormData {
  username: string;
  name: string;
  email: string;
  password: string;
  role: string;
  staft_group: string;
  staft_id: string;
  site_id: string;
  terminal_id: number;
  shift: number;
  active: number;
  connected: number;
  portal_access: number;
}

// Interfaces para los DTOs del API
interface CreateUserDto {
  username: string;
  name: string;
  email?: string;
  password: string;
  roleId: number;
  portalAccess: boolean;
  staftId: number;
  siteId: string;
  terminalId: number;
  shift: number;
  staftGroupId: number;
}

interface UpdateUserDto {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  roleId?: number;
  portalAccess?: boolean;
  connected?: boolean;
  active?: boolean;
  staftId?: number;
  siteId?: string;
  terminalId?: number;
  shift?: number;
  staftGroupId?: number;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: IUser | null;
  mode: 'create' | 'edit' | 'view';
  onSuccess: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, mode, onSuccess }) => {
  const { canEditUsers } = usePermissions();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    name: '',
    email: '',
    password: '',
    role: '5', // SELLER por defecto
    staft_group: '',
    staft_id: '',
    site_id: '',
    terminal_id: 1,
    shift: 1,
    active: 1,
    connected: 0,
    portal_access: 0
  });

  const isEditing = mode === 'edit';
  const isViewing = mode === 'view';
  const isCreating = mode === 'create';

  // Función para mapear role string a roleId number
  const getRoleId = (role: string): number => {
    // Si el role ya es un número, devolverlo directamente
    const roleNum = parseInt(role);
    if (!isNaN(roleNum)) {
      return roleNum;
    }
    
    // Mapeo de strings a números (para compatibilidad)
    switch (role.toLowerCase()) {
      case 'admin': return 1;
      case 'configuration': return 2;
      case 'supervisor': return 3;
      case 'manager': return 4;
      case 'seller': return 5;
      default: return 5; // seller por defecto
    }
  };


  // Función para mapear role string a roleId number (corregido según tu mapeo)
  const getRoleIdFromString = (roleName: string): string => {
    switch (roleName.toUpperCase()) {
      case 'ADMIN': return '1';
      case 'CONFIGURATION': return '2';
      case 'SUPERVISOR': return '3';
      case 'MANAGER': return '4';
      case 'SELLER': return '5';
      default: return '5'; // SELLER por defecto
    }
  };

  // Función para mapear grupo de personal string a number
  const getGroupId = (groupName: string): string => {
    // Si el grupo ya es un número, devolverlo directamente
    const groupNum = parseInt(groupName);
    if (!isNaN(groupNum)) {
      return groupNum.toString();
    }
    
    // Mapeo de strings a números
    switch (groupName.toLowerCase()) {
      case 'vendedor pista':
        return '1';
      case 'vendedor tienda':
        return '2';
      case 'administrador estacion':
      case 'administrador estación':
        return '3';
      case 'administracion isla':
      case 'administración isla':
        return '4';
      default:
        return '1'; // Vendedor Pista por defecto
    }
  };


  // Función para mapear formulario a CreateUserDto
  const mapToCreateUserDto = (formData: UserFormData): CreateUserDto => {
    return {
      username: formData.username,
      name: formData.name,
      email: formData.email || undefined,
      password: formData.password,
      roleId: getRoleId(formData.role),
      portalAccess: formData.portal_access === 1,
      staftId: parseInt(formData.staft_id) || 0,
      siteId: formData.site_id,
      terminalId: formData.terminal_id,
      shift: formData.shift,
      staftGroupId: parseInt(formData.staft_group) || 0
    };
  };

  // Función para mapear formulario a UpdateUserDto
  const mapToUpdateUserDto = (formData: UserFormData): UpdateUserDto => {
    const updateData: UpdateUserDto = {
      username: formData.username,
      name: formData.name,
      email: formData.email || undefined,
      roleId: getRoleId(formData.role),
      portalAccess: formData.portal_access === 1,
      connected: formData.connected === 1, // Convertir number (1/0) a boolean (true/false)
      active: formData.active === 1, // Convertir number (1/0) a boolean (true/false)
      staftId: parseInt(formData.staft_id) || 0,
      siteId: formData.site_id,
      terminalId: formData.terminal_id,
      shift: formData.shift,
      staftGroupId: parseInt(formData.staft_group) || 0
    };

    // Solo incluir password si se proporcionó
    if (formData.password) {
      updateData.password = formData.password;
    }

    return updateData;
  };

  // Cargar datos del usuario cuando se abre el modal para editar o ver
  useEffect(() => {
    if (user && isOpen && (isEditing || isViewing)) {
      
              const mappedFormData = {
          username: user.username || '',
          name: user.name || '',
          email: user.email || '',
          password: '', // No mostrar contraseña actual
          role: getRoleIdFromString(user.role || ''), // Mapear role string a roleId
          staft_group: getGroupId(user.staft_group || ''), // Mapear grupo correctamente
          staft_id: user.staft_id || '',
          site_id: user.site_id || '',
          terminal_id: user.terminal_id || 1,
          shift: user.shift || 1,
          connected: user.connected ? 1 : 0,
          active: user.active,
          portal_access: user.portal_access ? 1 : 0
        };
        setFormData(mappedFormData);
    } else if (isCreating && isOpen) {
             // Resetear formulario para crear nuevo usuario
               setFormData({
          username: '',
          name: '',
          email: '',
          password: '',
          role: '5', // SELLER por defecto
          staft_group: '',
          staft_id: '',
          site_id: '',
          terminal_id: 1,
          shift: 1,
          active: 1,
          portal_access: 0,
          connected: 0
        });
    }
  }, [user, isOpen, isEditing, isViewing, isCreating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked ? 1 : 0 :
               name === 'terminal_id' || name === 'shift' || name === 'active' || name === 'portal_access' || name === 'connected'
        ? parseInt(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // No hacer nada en modo vista
    if (isViewing) {
      return;
    }
    
    setLoading(true);
    
    try {
             if (isEditing) {
         const updateData = mapToUpdateUserDto(formData);
         const response = await userService.updateUser(user!.user_id, updateData);
        if (response.successful) {
          toast.success(`Usuario actualizado exitosamente \n ${formData.name}`, {
            duration: 5000,
            icon: '✅',
          });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al actualizar usuario. Por favor, inténtalo de nuevo.', {
            duration: 5000,
            icon: '❌',
          });
          console.error('Error al actualizar usuario');
        }
      } else {
        const createData = mapToCreateUserDto(formData);
        const response = await userService.createUser(createData);
        if (response.successful) {
          toast.success(`Usuario creado exitosamente \n ${formData.name}`, {
            duration: 5000,
            icon: '✅',
          });
          onSuccess();
          onClose();
        } else {
          toast.error('Error al crear usuario. Por favor, inténtalo de nuevo.', {
            duration: 5000,
            icon: '❌',
          });
          console.error('Error al crear usuario');
        }
      }
    } catch (error) {
      console.error('Error al procesar usuario:', error);
      toast.error('Error de conexión. Por favor, inténtalo de nuevo.', {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <Edit className="w-6 h-6 text-green-600" />
            ) : (
              <UserPlus className="w-6 h-6 text-blue-600" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isViewing ? 'Ver Usuario' : isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
              <p className="text-sm text-gray-600">
                {isViewing ? `Viendo: ${user?.name}` : isEditing ? `Editando: ${user?.name}` : 'Completa el formulario para crear un nuevo usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span>Información Básica</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa el nombre completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Ingresa el nombre de usuario"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="nombre.apellido@isladom.com.do"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {!isEditing && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!isEditing && !isViewing}
                      disabled={isViewing}
                      className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder={isViewing ? "••••••••" : isEditing ? "Dejar vacío para mantener actual" : "Ingresa la contraseña"}
                    />
                                          <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isViewing}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          isViewing ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Role and Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <span>Rol y Permisos</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    disabled={isViewing || !canEditUsers}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing || !canEditUsers ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="1">ADMIN</option>
                    <option value="2">CONFIGURATION</option>
                    <option value="3">SUPERVISOR</option>
                    <option value="4">MANAGER</option>
                    <option value="5">SELLER</option>
                  </select>
                  {!canEditUsers && !isViewing && (
                    <p className="text-xs text-red-500 mt-1">
                      Solo usuarios ADMIN o MANAGER pueden cambiar roles
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acceso al Portal
                  </label>
                  <select
                    name="portal_access"
                    value={formData.portal_access}
                    onChange={handleInputChange}
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value={1}>Permitido</option>
                    <option value={0}>Denegado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Building className="w-5 h-5 text-gray-600" />
                <span>Información Laboral</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Grupo de Personal *
                   </label>
                   <select
                     name="staft_group"
                     value={formData.staft_group}
                     onChange={handleInputChange}
                     required
                     disabled={isViewing}
                     className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                       isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                     }`}
                   >
                     <option value="">Seleccionar grupo</option>
                     <option value="1">Vendedor Pista</option>
                     <option value="2">Vendedor Tienda</option>
                     <option value="3">Administrador Estacion</option>
                     <option value="4">Administracion ISLA</option>
                   </select>
                 </div>
                
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Código de empleado *
                   </label>
                                                          <input
                       type="number"
                       name="staft_id"
                       value={formData.staft_id}
                       onChange={handleInputChange}
                       required
                       disabled={isViewing}
                       className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                         isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                       }`}
                       placeholder="Ingresa el código de empleado"
                     />
                </div>
                
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Sucursal *
                   </label>
                   <input
                     type="text"
                     name="site_id"
                     value={formData.site_id}
                     onChange={handleInputChange}
                     required
                     disabled={isViewing}
                     className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                       isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                     }`}
                     placeholder="Ingresa el ID del sitio"
                   />
                 </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Turno
                  </label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    disabled={isViewing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isViewing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value={1}>Turno 1 (6:00 AM - 2:00 PM)</option>
                    <option value={2}>Turno 2 (2:00 PM - 10:00 PM)</option>
                    <option value={3}>Turno 3 (10:00 PM - 6:00 AM)</option>
                    <option value={4}>Turno 4 (8:00 AM - 5:00 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status Switches */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <span>Estado del Usuario</span>
              </h3>
              
              {/* Switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Conectado</label>
                    <p className="text-xs text-gray-500">Indica si el usuario está conectado</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="connected"
                      checked={formData.connected === 1}
                      onChange={handleInputChange}
                      disabled={isViewing}
                      className="sr-only peer"
                    />
                    <div className={`relative w-12 h-7 rounded-full transition-all duration-300 ease-in-out ${
                      formData.connected === 1 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200 border-2 border-gray-300'
                    } ${isViewing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 ease-in-out transform shadow-sm ${
                        formData.connected === 1 ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                      {formData.connected === 1 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Activo</label>
                    <p className="text-xs text-gray-500">Indica si el usuario está activo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active === 1}
                      onChange={handleInputChange}
                      disabled={isViewing}
                      className="sr-only peer"
                    />
                    <div className={`relative w-12 h-7 rounded-full transition-all duration-300 ease-in-out ${
                      formData.active === 1 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200 border-2 border-gray-300'
                    } ${isViewing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-all duration-300 ease-in-out transform shadow-sm ${
                        formData.active === 1 ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                      {formData.active === 1 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isViewing ? 'Cerrar' : 'Cancelar'}
              </button>
              {!isViewing && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
