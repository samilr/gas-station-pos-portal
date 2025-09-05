import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
}

const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const { user, logout } = useAuth();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (logoutMenuRef.current && !logoutMenuRef.current.contains(event.target as Node)) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutMenu(!showLogoutMenu);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutMenu(false);
    }
  };

  const getSectionTitle = (section: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard Principal',
      users: 'Gestión de Usuarios',
      'users.list': 'Lista de Usuarios',
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
            Bienvenido al portal administrativo centralizado
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User className="w-8 h-8 p-1 bg-blue-100 text-blue-600 rounded-full" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-gray-600">{user?.role}</p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {isLoggingOut ? 'Cerrando sesión...' : 'Salir'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showLogoutMenu ? 'rotate-180' : ''}`} />
              </button>

              {showLogoutMenu && (
                <div
                  ref={logoutMenuRef}
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-10"
                >
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Confirmar salida</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      ¿Deseas cerrar tu sesión?
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowLogoutMenu(false)}
                        disabled={isLoggingOut}
                        className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleConfirmLogout}
                        disabled={isLoggingOut}
                        className="flex-1 px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoggingOut ? (
                          <>
                            <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          'Cerrar'
                        )}
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