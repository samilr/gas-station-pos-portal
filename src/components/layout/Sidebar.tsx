import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../../hooks/useNavigation';
import { LayoutDashboard, Users, Settings, BarChart3, Database, Shield, FileText, Bell, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, UserPlus, UserCheck, UserX, TrendingUp, PieChart, Activity, Server, HardDrive, DatabaseBackup as Backup, Lock, Key, AlertTriangle, FileBarChart, Download, Upload, Mail, MessageSquare, Sliders, Globe, Palette, CreditCard, Receipt, DollarSign, TrendingDown, Package, Monitor, Smartphone } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface SubMenuItem {
  id: string;
  label: string;
  icon: any;
  permission?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  permission?: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard 
  },
  { 
    id: 'users', 
    label: 'Usuarios', 
    icon: Users,
    permission: 'users.view',
    subItems: [
      { id: 'users.list', label: 'Lista de Usuarios', icon: Users, permission: 'users.view' },
      { id: 'users.active', label: 'Usuarios Activos', icon: UserCheck, permission: 'users.view' },
      { id: 'users.inactive', label: 'Usuarios Inactivos', icon: UserX, permission: 'users.view' },
    ]
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: BarChart3,
    permission: 'analytics.view',
    subItems: [
      { id: 'analytics.overview', label: 'Vista General', icon: TrendingUp, permission: 'analytics.view' },
      { id: 'analytics.charts', label: 'Gráficos', icon: PieChart, permission: 'analytics.view' },
      { id: 'analytics.realtime', label: 'Tiempo Real', icon: Activity, permission: 'analytics.view' },
    ]
  },
  { 
    id: 'transactions', 
    label: 'Transacciones', 
    icon: CreditCard,
    permission: 'transactions.view',
    subItems: [
      { id: 'transactions.list', label: 'Lista de Ventas', icon: Receipt, permission: 'transactions.view' },
      { id: 'transactions.revenue', label: 'Ingresos', icon: DollarSign, permission: 'transactions.view' },
      { id: 'transactions.refunds', label: 'Reembolsos', icon: TrendingDown, permission: 'transactions.edit' },
    ]
  },
  { 
    id: 'products', 
    label: 'Productos', 
    icon: Package,
    permission: 'products.view',
    subItems: [
      { id: 'products.list', label: 'Inventario', icon: Package, permission: 'products.view' },
      { id: 'products.create', label: 'Nuevo Producto', icon: UserPlus, permission: 'products.create' },
      { id: 'products.categories', label: 'Categorías', icon: Users, permission: 'products.view' },
    ]
  },
  { 
    id: 'pos', 
    label: 'Puntos de Venta', 
    icon: Monitor,
    subItems: [
      { id: 'pos.terminals', label: 'Terminales', icon: Monitor },
      { id: 'pos.devices', label: 'Dispositivos', icon: Smartphone },
    ]
  },
  { 
    id: 'logs', 
    label: 'Registros', 
    icon: FileText,
    permission: 'logs.view',
    subItems: [
      { id: 'logs.actions', label: 'Actions Log', icon: Activity, permission: 'logs.view' },
      { id: 'logs.errors', label: 'Error Log', icon: AlertTriangle, permission: 'logs.view' },
    ]
  },
  { 
    id: 'database', 
    label: 'Base de Datos', 
    icon: Database,
    permission: 'database.view',
    subItems: [
      { id: 'database.connections', label: 'Conexiones', icon: Server, permission: 'database.view' },
      { id: 'database.tables', label: 'Tablas', icon: HardDrive, permission: 'database.view' },
      { id: 'database.backup', label: 'Respaldos', icon: Backup, permission: 'database.edit' },
    ]
  },
  { 
    id: 'security', 
    label: 'Seguridad', 
    icon: Shield,
    permission: 'security.view',
    subItems: [
      { id: 'security.permissions', label: 'Permisos', icon: Lock, permission: 'security.view' },
      { id: 'security.keys', label: 'API Keys', icon: Key, permission: 'security.edit' },
      { id: 'security.alerts', label: 'Alertas', icon: AlertTriangle, permission: 'security.view' },
    ]
  },
  { 
    id: 'reports', 
    label: 'Reportes', 
    icon: FileText,
    permission: 'reports.view',
    subItems: [
      { id: 'reports.analytics', label: 'Reportes Analytics', icon: FileBarChart, permission: 'reports.view' },
      { id: 'reports.export', label: 'Exportar Datos', icon: Download, permission: 'reports.create' },
      { id: 'reports.import', label: 'Importar Datos', icon: Upload, permission: 'reports.create' },
    ]
  },
  { 
    id: 'notifications', 
    label: 'Notificaciones', 
    icon: Bell,
    permission: 'notifications.view',
    subItems: [
      { id: 'notifications.email', label: 'Email', icon: Mail, permission: 'notifications.view' },
      { id: 'notifications.push', label: 'Push', icon: MessageSquare, permission: 'notifications.edit' },
    ]
  },
  { 
    id: 'settings', 
    label: 'Configuración', 
    icon: Settings,
    permission: 'settings.view',
    subItems: [
      { id: 'settings.general', label: 'General', icon: Sliders, permission: 'settings.view' },
      { id: 'settings.api', label: 'API Config', icon: Globe, permission: 'settings.edit' },
      { id: 'settings.theme', label: 'Tema', icon: Palette, permission: 'settings.view' },
    ]
  },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();
  const { routeMap } = useNavigation();
  const [expandedItem, setExpandedItem] = useState<string | null>('users');

  const toggleExpanded = (itemId: string) => {
    setExpandedItem(prev => 
      prev === itemId ? null : itemId
    );
  };

  const handleNavigation = (sectionId: string) => {
    const route = routeMap[sectionId];
    if (route) {
      navigate(route);
    }
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const getFilteredSubItems = (subItems?: SubMenuItem[]) => {
    return subItems?.filter(subItem => 
      !subItem.permission || hasPermission(subItem.permission)
    ) || [];
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white h-full transition-all duration-300 ease-in-out flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold">MAGIC CLOUD</h2>
              <p className="text-xs text-gray-400 mt-1">{user?.role}</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id || activeSection.startsWith(item.id + '.');
            const isExpanded = expandedItem === item.id;
            const hasSubItems = item.subItems && getFilteredSubItems(item.subItems).length > 0;
            
            return (
              <li key={item.id}>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      if (hasSubItems && !isCollapsed) {
                        toggleExpanded(item.id);
                      } else {
                        handleNavigation(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between transition-all duration-200 ${
                      isCollapsed 
                        ? 'px-2 py-4 rounded-lg hover:bg-gray-700' 
                        : 'px-3 py-3 rounded-lg'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </div>
                    {!isCollapsed && hasSubItems && (
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Sub Items */}
                  {!isCollapsed && hasSubItems && isExpanded && (
                    <ul className="ml-6 space-y-1 border-l border-gray-700 pl-4">
                      {getFilteredSubItems(item.subItems).map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = activeSection === subItem.id;
                        
                        return (
                          <li key={subItem.id}>
                            <button
                              onClick={() => handleNavigation(subItem.id)}
                              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                                isSubActive
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }`}
                            >
                              <SubIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{subItem.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          {!isCollapsed && 'ISLA DOMINICANA DE PETROLEO CORP'}&copy;

        </div>
      </div>
    </div>
  );
};

export default Sidebar;