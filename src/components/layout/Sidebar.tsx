import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../../hooks/useNavigation';
import { LayoutDashboard, Users, Settings, BarChart3, Database, Shield, FileText, Bell, ChevronDown, ChevronUp, UserPlus, UserCheck, UserX, TrendingUp, PieChart, Activity, Server, HardDrive, DatabaseBackup as Backup, Lock, Key, AlertTriangle, FileBarChart, Download, Upload, Mail, MessageSquare, Sliders, Globe, Palette, CreditCard, Receipt, Package, Monitor, Smartphone, Building2, FuelIcon, Store, DollarSign } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

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
  categoryPermission?: string; // Permiso para mostrar toda la categoría
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard 
  },
  { 
    id: 'transactions', 
    label: 'Transacciones', 
    icon: DollarSign,
    permission: 'transactions.view',
    subItems: [
      { id: 'transactions.list', label: 'Todas las ventas', icon: Receipt, permission: 'transactions.view' },
      { id: 'transactions.tienda', label: 'Tienda', icon: Store, permission: 'transactions.view' },
      { id: 'transactions.revenue', label: 'Comprobantes NCF', icon: FuelIcon, permission: 'transactions.view' },
      //{ id: 'transactions.refunds', label: 'Zataca', icon: Smartphone, permission: 'transactions.edit' },
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
    permission: 'terminals.view',
    categoryPermission: 'pos.view', // Solo ADMIN, MANAGER y SUPERVISOR pueden ver esta categoría
    subItems: [
      { id: 'pos.terminals', label: 'Terminales', icon: Monitor, permission: 'terminals.view' },
      { id: 'pos.devices', label: 'Dispositivos', icon: Smartphone, permission: 'devices.view' },
    ]
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
    id: 'sites', 
    label: 'Sucursales', 
    icon: Building2,
    permission: 'sites.view',
    subItems: [
      { id: 'sites.list', label: 'Lista de Sucursales', icon: Building2, permission: 'sites.view' },
    ]
  },
  { 
    id: 'logs', 
    label: 'Registros', 
    icon: FileText,
    permission: 'logs.view',
    categoryPermission: 'logs.view', // Solo ADMIN y AUDITOR pueden ver esta categoría
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
    categoryPermission: 'database.view', // Solo ADMIN puede ver esta categoría
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
    categoryPermission: 'security.view', // Solo ADMIN puede ver esta categoría
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
    categoryPermission: 'reports.view', // Solo ADMIN, MANAGER y SUPERVISOR pueden ver esta categoría
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
    categoryPermission: 'notifications.view', // Solo ADMIN y MANAGER pueden ver esta categoría
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
    categoryPermission: 'settings.view', // Solo ADMIN puede ver esta categoría
    subItems: [
      { id: 'settings.general', label: 'General', icon: Sliders, permission: 'settings.view' },
      { id: 'settings.api', label: 'API Config', icon: Globe, permission: 'settings.edit' },
      { id: 'settings.theme', label: 'Tema', icon: Palette, permission: 'settings.view' },
    ]
  },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  isCollapsed
}) => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { routeMap } = useNavigation();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hoveredItemRef, setHoveredItemRef] = useState<HTMLButtonElement | null>(null);

  // Minimizar todas las categorías cuando se está en el dashboard
  // Expandir automáticamente la categoría del item activo
  React.useEffect(() => {
    if (activeSection === 'dashboard') {
      setExpandedItem(null);
    } else {
      // Encontrar la categoría padre del item activo
      const activeItem = menuItems.find(item => 
        item.subItems?.some(subItem => subItem.id === activeSection)
      );
      if (activeItem) {
        setExpandedItem(activeItem.id);
      }
    }
  }, [activeSection]);

  // Limpiar timeout al desmontar el componente
  React.useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);


  const handleNavigation = (sectionId: string) => {
    const route = routeMap[sectionId];
    if (route) {
      navigate(route);
    }
  };

  const handleMouseEnter = (itemId: string, element: HTMLButtonElement) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredItem(itemId);
    setHoveredItemRef(element);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredItem(null);
      setHoveredItemRef(null);
    }, 150); // 150ms de delay antes de ocultar
    setHoverTimeout(timeout);
  };

  const { can } = usePermissions();
  
  const filteredMenuItems = menuItems.filter(item => {
    // Verificar permiso de categoría primero
    if (item.categoryPermission && !can(item.categoryPermission as any)) {
      return false;
    }
    // Luego verificar permiso individual
    return !item.permission || hasPermission(item.permission);
  });

  const getFilteredSubItems = (subItems?: SubMenuItem[]) => {
    return subItems?.filter(subItem => 
      !subItem.permission || hasPermission(subItem.permission)
    ) || [];
  };

  return (
    <div className="relative">
      {/* Sidebar principal */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white h-full transition-all duration-300 ease-in-out flex flex-col transform origin-left`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo siempre visible */}
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">MC</span>
            </div>
            
            {/* Texto que aparece/desaparece */}
            <div className={`transition-all duration-200 ${
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto ml-3'
            }`}>
              <h2 className="text-xl font-bold whitespace-nowrap">MAGIC CLOUD</h2>
            </div>
          </div>
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
                    ref={(el) => {
                      if (el && isCollapsed && hasSubItems) {
                        // Solo asignar la referencia si es el elemento hovereado
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (isCollapsed && hasSubItems) {
                        handleMouseEnter(item.id, e.currentTarget);
                      }
                    }}
                    onMouseLeave={() => {
                      if (isCollapsed) {
                        handleMouseLeave();
                      }
                    }}
                    onClick={() => {
                      if (hasSubItems && !isCollapsed) {
                        // Si la categoría no está expandida, expandirla
                        if (!isExpanded) {
                          setExpandedItem(item.id);
                        }
                        // Si ya está expandida, navegar al primer subitem
                        else {
                          const firstSubItem = getFilteredSubItems(item.subItems)[0];
                          if (firstSubItem) {
                            handleNavigation(firstSubItem.id);
                          }
                        }
                      } else {
                        handleNavigation(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between transition-all duration-200 min-h-[44px] ${
                      isCollapsed 
                        ? 'px-2 py-3 rounded-lg hover:bg-gray-700' 
                        : 'px-3 py-3 rounded-lg'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'
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
                                  ? 'bg-blue-500 text-white shadow-md'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:shadow-sm'
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
            {!isCollapsed && ''}&copy;
          </div>
        </div>
      </div>

      {/* Menú desplegable en hover cuando está colapsado */}
      {isCollapsed && hoveredItem && hoveredItemRef && (
        <div 
          className="absolute left-16 z-50 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 min-w-48"
          style={{ 
            top: `${(() => {
              if (hoveredItemRef) {
                const rect = hoveredItemRef.getBoundingClientRect();
                const sidebarRect = hoveredItemRef.closest('.relative')?.getBoundingClientRect();
                if (sidebarRect) {
                  return rect.top - sidebarRect.top;
                }
              }
              return 0;
            })()}px` 
          }}
          onMouseEnter={() => {
            if (hoveredItemRef) {
              handleMouseEnter(hoveredItem, hoveredItemRef);
            }
          }}
          onMouseLeave={() => handleMouseLeave()}
        >
          {(() => {
            const item = menuItems.find(menuItem => menuItem.id === hoveredItem);
            if (!item || !item.subItems) return null;
            
            const filteredSubItems = getFilteredSubItems(item.subItems);
            if (filteredSubItems.length === 0) return null;
            
            return (
              <div className="py-2">
                <div className="px-4 py-2 text-sm font-semibold text-gray-300 border-b border-gray-700">
                  {item.label}
                </div>
                {filteredSubItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = activeSection === subItem.id;
                  
                  return (
                    <button
                      key={subItem.id}
                      onClick={() => handleNavigation(subItem.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 rounded-md ${
                        isSubActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <SubIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{subItem.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Sidebar;