import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
}

const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const { user, logout } = useAuth();

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

            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;