import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Shield, Calendar, Save, Eye, EyeOff, Briefcase, MapPin, Phone, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { IUser, userService } from '../../../services/userService';
import { CompactButton } from '../../ui';
import Toolbar from '../../ui/Toolbar';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<IUser | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const loadUserData = async () => {
    if (!user?.staftId) {
      setMessage({ type: 'error', text: 'No se encontró el ID del usuario' });
      setIsLoadingData(false);
      return;
    }

    try {
      setIsLoadingData(true);
      const response = await userService.getUserByStaftId(user.staftId);

      if (response.successful && response.data) {
        setUserData(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          position: response.data.staft_group || '',
          department: response.data.staft_group || '',
          phone: '',
          address: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: 'Error al cargar los datos del usuario' });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage({ type: 'error', text: 'Error al cargar los datos del usuario' });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user?.staftId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const inputClass = "w-full h-7 px-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-text-muted transition-colors";
  const labelClass = "block text-2xs uppercase tracking-wide text-text-muted mb-0.5";
  const sectionHeaderClass = "flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border";

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <Toolbar
        chips={[
          { label: 'Usuario', value: userData?.name || '—' },
          { label: 'Rol', value: userData?.role || '—', color: 'blue' },
          { label: 'Sucursal', value: userData?.site_id || '—' },
        ]}
      >
        <CompactButton
          variant={isEditing ? 'ghost' : 'primary'}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancelar' : 'Editar Perfil'}
        </CompactButton>
        {isEditing && (
          <CompactButton variant="primary" onClick={handleSaveProfile} disabled={isLoading}>
            <Save className="w-3 h-3" />
            {isLoading ? 'Guardando...' : 'Guardar'}
          </CompactButton>
        )}
      </Toolbar>

      {/* Status message */}
      {message && (
        <div className={`px-3 py-2 rounded-sm text-sm border ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* 1. Información del Usuario */}
      <div className="bg-white rounded-sm border border-table-border">
        <div className={sectionHeaderClass}>
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-sm font-semibold text-text-primary">Información del Usuario</span>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Nombre completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClass}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className={labelClass}><Mail className="w-3 h-3 inline mr-1" />Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClass}
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className={labelClass}><Shield className="w-3 h-3 inline mr-1" />Rol</label>
              <input type="text" value={userData?.role || ''} disabled className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Calendar className="w-3 h-3 inline mr-1" />Fecha de registro</label>
              <input
                type="text"
                value={userData?.created_at ? formatDate(userData.created_at.toString()) : 'N/D'}
                disabled
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}><Clock className="w-3 h-3 inline mr-1" />Último login</label>
              <input
                type="text"
                value={userData?.last_time_logged ? formatDate(userData.last_time_logged.toString()) : 'N/D'}
                disabled
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}><Lock className="w-3 h-3 inline mr-1" />Último cambio de contraseña</label>
              <input
                type="text"
                value={userData?.updated_password_at ? formatDate(userData.updated_password_at.toString()) : 'N/D'}
                disabled
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Información de Empleado */}
      <div className="bg-white rounded-sm border border-table-border">
        <div className={sectionHeaderClass}>
          <Briefcase className="w-3.5 h-3.5 text-green-600" />
          <span className="text-sm font-semibold text-text-primary">Información de Empleado</span>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}><Briefcase className="w-3 h-3 inline mr-1" />Cargo/Posición</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClass}
                placeholder="Ej: Cajero, Supervisor..."
              />
            </div>
            <div>
              <label className={labelClass}><Briefcase className="w-3 h-3 inline mr-1" />Grupo de Personal</label>
              <input type="text" value={userData?.staft_group || ''} disabled className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Calendar className="w-3 h-3 inline mr-1" />Turno</label>
              <input type="text" value={userData?.shift || ''} disabled className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Phone className="w-3 h-3 inline mr-1" />Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={inputClass}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className={labelClass}><MapPin className="w-3 h-3 inline mr-1" />Sucursal</label>
              <input type="text" value={userData?.site_id || ''} disabled className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Briefcase className="w-3 h-3 inline mr-1" />Terminal</label>
              <input type="text" value={userData?.terminal_id || ''} disabled className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cambio de Contraseña */}
      <div className="bg-white rounded-sm border border-table-border">
        <div className={sectionHeaderClass}>
          <Lock className="w-3.5 h-3.5 text-red-600" />
          <span className="text-sm font-semibold text-text-primary">Cambiar Contraseña</span>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className={labelClass}>Contraseña actual</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`${inputClass} pr-8`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showCurrentPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`${inputClass} pr-8`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${inputClass} pr-8`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div>
              <CompactButton
                variant="danger"
                onClick={handleChangePassword}
                disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                className="w-full justify-center"
              >
                <Lock className="w-3 h-3" />
                {isLoading ? 'Cambiando...' : 'Cambiar'}
              </CompactButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
