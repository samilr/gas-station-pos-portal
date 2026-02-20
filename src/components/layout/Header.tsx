import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, AlertCircle, Loader2, ChevronDown, Settings, Shield, HelpCircle, Info, CheckCircle } from 'lucide-react';
import { useHeader } from '../../context/HeaderContext';

interface HeaderProps {
  activeSection: string;
}

const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const { user, logout } = useAuth();
  const { subtitle } = useHeader();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setShowNotificationsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotificationsMenu(false);
  };

  const handleNotificationsClick = () => {
    setShowNotificationsMenu(!showNotificationsMenu);
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    navigate('/dashboard/users/profile');
    setShowUserMenu(false);
  };


  const getSectionTitle = (section: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard Principal',
      users: 'Gestión de Usuarios',
      'users.list': 'Lista de Usuarios',
      'users.profile': 'Mi Perfil',
      'users.create': 'Crear Usuario',
      'users.active': 'Usuarios Activos',
      'users.inactive': 'Usuarios Inactivos',
      terminals: 'Gestión de Terminales',
      'terminals.list': 'Lista de Terminales',
      'terminals.create': 'Crear Terminal',
      'terminals.active': 'Terminales Activas',
      'terminals.inactive': 'Terminales Inactivas',
      devices: 'Gestión de Dispositivos',
      'devices.list': 'Lista de Dispositivos',
      'devices.create': 'Crear Dispositivo',
      'devices.active': 'Dispositivos Activos',
      'devices.inactive': 'Dispositivos Inactivos',
      pos: 'Puntos de Venta',
      'pos.terminals': 'Gestión de Terminales',
      'pos.devices': 'Gestión de Dispositivos',
      analytics: 'Analytics y Métricas',
      'analytics.overview': 'Analytics - Vista General',
      'analytics.charts': 'Gráficos Analytics',
      'analytics.realtime': 'Analytics en Tiempo Real',
      transactions: 'Transacciones y Ventas',
      'transactions.list': 'Lista de Transacciones',
      'transactions.revenue': 'Ingresos y Ganancias',
      'transactions.refunds': 'Reembolsos',
      products: 'Gestión de Productos',
      'products.list': 'Inventario de Productos',
      'products.create': 'Crear Nuevo Producto',
      'products.categories': 'Categorías de Productos',
      sites: 'Gestión de Sucursales',
      'sites.list': 'Lista de Sucursales',
      'sites.create': 'Crear Sucursal',
      'sites.active': 'Sucursales Activas',
      'sites.inactive': 'Sucursales Inactivas',
      dispensers: 'Dispensadoras de Combustible',
      'dispensers.monitor': 'Monitoreo de Dispensadoras',
      'dispensers.transactions': 'Transacciones de Dispensadoras',
      logs: 'Registros del Sistema',
      'logs.actions': 'Registro de Acciones',
      'logs.errors': 'Registro de Errores',
      database: 'Base de Datos',
      'database.connections': 'Conexiones de Base de Datos',
      'database.tables': 'Tablas de Base de Datos',
      'database.backup': 'Respaldos de Base de Datos',
      security: 'Centro de Seguridad',
      'security.permissions': 'Gestión de Permisos',
      'security.keys': 'API Keys',
      'security.alerts': 'Alertas de Seguridad',
      reports: 'Reportes y Documentos',
      'reports.analytics': 'Reportes de Analytics',
      'reports.export': 'Exportar Datos',
      'reports.import': 'Importar Datos',
      notifications: 'Centro de Notificaciones',
      'notifications.email': 'Notificaciones Email',
      'notifications.push': 'Notificaciones Push',
      settings: 'Configuración del Sistema',
      'settings.general': 'Configuración General',
      'settings.api': 'Configuración API',
      'settings.theme': 'Configuración de Tema',
    };
    return titles[section] || 'Portal Administrativo';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getSectionTitle(activeSection)}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {subtitle || 'Bienvenido al portal administrativo centralizado'}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Botón de Notificaciones */}
          <div className="relative">
            <button 
              onClick={handleNotificationsClick}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {/* Indicador de notificaciones */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Submenú de Notificaciones */}
            {showNotificationsMenu && (
              <div
                ref={notificationsMenuRef}
                className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-20"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                    <span className="text-xs text-gray-500">3 nuevas</span>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {/* Notificación 1 */}
                    <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Sistema actualizado</p>
                        <p className="text-xs text-gray-600">El sistema se ha actualizado correctamente</p>
                        <p className="text-xs text-gray-400 mt-1">Hace 5 minutos</p>
                      </div>
                    </div>

                    {/* Notificación 2 */}
                    <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Mantenimiento programado</p>
                        <p className="text-xs text-gray-600">Mantenimiento programado para mañana a las 2:00 AM</p>
                        <p className="text-xs text-gray-400 mt-1">Hace 1 hora</p>
                      </div>
                    </div>

                    {/* Notificación 3 */}
                    <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Nuevo usuario registrado</p>
                        <p className="text-xs text-gray-600">Un nuevo usuario se ha registrado en el sistema</p>
                        <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Botón de Usuario */}
            <div className="relative">
              <button 
                onClick={handleUserClick}
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <User className="w-8 h-8 p-1 bg-blue-100 text-blue-600 rounded-full" />
                <div className="text-sm text-left">
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-gray-600">{user?.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Submenú de Usuario */}
              {showUserMenu && (
                <div
                  ref={userMenuRef}
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                    
                    <div className="py-1">
                      <button 
                        onClick={handleProfileClick}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Mi Perfil</span>
                      </button>
                      
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </button>
                      
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                        <Shield className="w-4 h-4" />
                        <span>Seguridad</span>
                      </button>
                      
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                        <HelpCircle className="w-4 h-4" />
                        <span>Ayuda</span>
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button 
                        onClick={handleLogoutClick}
                        disabled={isLoggingOut}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                        <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;