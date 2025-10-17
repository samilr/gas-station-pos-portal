// Sistema centralizado de permisos para controlar la visibilidad de componentes
// Basado en roles de usuario: ADMIN, MANAGER, SUPERVISOR, AUDIT, ACCOUNTANT

export type Permission = 
  // Dashboard
  | 'dashboard.view'
  
  // Usuarios
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete'
  
  // Transacciones
  | 'transactions.view' | 'transactions.create' | 'transactions.edit' | 'transactions.delete' | 'transactions.reverse'
  
  // Productos
  | 'products.view' | 'products.create' | 'products.edit' | 'products.delete'
  
  // Sitios/Sucursales
  | 'sites.view' | 'sites.create' | 'sites.edit' | 'sites.delete'
  
  // Terminales
  | 'terminals.view' | 'terminals.create' | 'terminals.edit' | 'terminals.delete'
  
  // Dispositivos
  | 'devices.view' | 'devices.create' | 'devices.edit' | 'devices.delete'
  
  // Analytics
  | 'analytics.view' | 'analytics.export'
  
  // Reportes
  | 'reports.view' | 'reports.create' | 'reports.export'
  
  // Logs
  | 'logs.view' | 'logs.export'
  
  // Base de datos
  | 'database.view' | 'database.edit' | 'database.backup'
  
  // Seguridad
  | 'security.view' | 'security.edit' | 'security.keys'
  
  // Notificaciones
  | 'notifications.view' | 'notifications.edit'
  
  // Configuración
  | 'settings.view' | 'settings.edit'
  
  // Permisos de Categoría (para controlar visibilidad completa)
  | 'pos.view'        // Puntos de Venta
  | 'logs.view'       // Registros (ya existe, se reutiliza)
  | 'database.view'   // Base de Datos (ya existe, se reutiliza)
  | 'security.view'   // Seguridad (ya existe, se reutiliza)
  | 'reports.view'    // Reportes (ya existe, se reutiliza)
  | 'notifications.view'; // Notificaciones (ya existe, se reutiliza)

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  AUDIT = 'AUDIT',
  ACCOUNTANT = 'ACCOUNTANT'
}

// Configuración de permisos por rol
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Acceso completo a todo
    'dashboard.view',
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'transactions.view', 'transactions.create', 'transactions.edit', 'transactions.delete', 'transactions.reverse',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'sites.view', 'sites.create', 'sites.edit', 'sites.delete',
    'terminals.view', 'terminals.create', 'terminals.edit', 'terminals.delete',
    'devices.view', 'devices.create', 'devices.edit', 'devices.delete',
    'analytics.view', 'analytics.export',
    'reports.view', 'reports.create', 'reports.export',
    'logs.view', 'logs.export',
    'database.view', 'database.edit', 'database.backup',
    'security.view', 'security.edit', 'security.keys',
    'notifications.view', 'notifications.edit',
    'settings.view', 'settings.edit',
    // Categorías
    'pos.view'
  ],
  
  [Role.MANAGER]: [
    // Acceso de gestión (sin eliminación)
    'dashboard.view',
    'users.view', 'users.create', 'users.edit',
    'transactions.view', 'transactions.create', 'transactions.edit',
    'products.view', 'products.create', 'products.edit',
    //'sites.view', 'sites.create', 'sites.edit',
    //'terminals.view', 'terminals.create', 'terminals.edit',
    //'devices.view', 'devices.create', 'devices.edit',
    'analytics.view',
    // Categorías restringidas para MANAGER
    //'pos.view',        // Puede ver Puntos de Venta
    // NO puede ver: logs, database, security, settings
  ],
  
  [Role.SUPERVISOR]: [
    // Acceso de supervisión (similar a MANAGER)
    'dashboard.view',
    'users.view', 'users.create', 'users.edit',
    'transactions.view', 'transactions.create', 'transactions.edit',
    'products.view', 'products.create', 'products.edit',
    'sites.view', 'sites.create', 'sites.edit',
    'terminals.view', 'terminals.create', 'terminals.edit',
    'devices.view', 'devices.create', 'devices.edit',
    'analytics.view',
    'reports.view', 'reports.create',
    // Categorías restringidas para SUPERVISOR
    'pos.view',        // Puede ver Puntos de Venta
    'reports.view',    // Puede ver Reportes
    // NO puede ver: logs, database, security, notifications, settings
  ],
  
  [Role.AUDIT]: [
    // Acceso de auditoría (solo lectura y reversión de transacciones)
    'dashboard.view',
    'transactions.view', 'transactions.reverse',
    'products.view',
    'analytics.view', 'analytics.export',
    'reports.view', 'reports.export',
    // NO puede ver Users, Logs ni Sucursales
    // NO puede ver: pos, database, security, notifications, settings
  ]
  ,
  
  [Role.ACCOUNTANT]: [
    // Rol contable: solo lectura en dashboard, transacciones y productos
    'dashboard.view',
    'transactions.view',
    'products.view',
    'analytics.view'
    // Sin permisos de create/edit/delete/reverse en ninguna sección
  ]
};

// Permisos específicos por componente/sección
export const COMPONENT_PERMISSIONS: Record<string, Permission[]> = {
  // Dashboard
  'DashboardHome': ['dashboard.view'],
  'DashboardChart': ['dashboard.view'],
  
  // Usuarios
  'UsersSection': ['users.view'],
  'UserModal': ['users.create', 'users.edit'],
  'DeleteUserDialog': ['users.delete'],
  
  // Transacciones
  'TransactionsSection': ['transactions.view'],
  'TransactionModal': ['transactions.create', 'transactions.edit'],
  'ReverseTransactionButton': ['transactions.reverse'],
  
  // Productos
  'ProductsSection': ['products.view'],
  'ProductModal': ['products.create', 'products.edit'],
  'DeleteProductDialog': ['products.delete'],
  
  // Sitios
  'SitesSection': ['sites.view'],
  'SiteModal': ['sites.create', 'sites.edit'],
  'DeleteSiteDialog': ['sites.delete'],
  
  // Terminales
  'TerminalsSection': ['terminals.view'],
  'TerminalModal': ['terminals.create', 'terminals.edit'],
  'DeleteTerminalDialog': ['terminals.delete'],
  
  // Dispositivos
  'DevicesSection': ['devices.view'],
  'DeviceModal': ['devices.create', 'devices.edit'],
  'DeleteDeviceDialog': ['devices.delete'],
  
  // Analytics
  'AnalyticsSection': ['analytics.view'],
  'AnalyticsExport': ['analytics.export'],
  
  // Reportes
  'ReportsSection': ['reports.view'],
  'ReportsCreate': ['reports.create'],
  'ReportsExport': ['reports.export'],
  
  // Logs
  'LogsSection': ['logs.view'],
  'LogsExport': ['logs.export'],
  'ActionsLogSection': ['logs.view'],
  'ErrorLogSection': ['logs.view'],
  
  // Configuración
  'SettingsSection': ['settings.view'],
  'SettingsEdit': ['settings.edit']
};

// Función helper para verificar si un rol tiene un permiso específico
export const hasPermission = (role: Role, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

// Función helper para verificar si un rol tiene al menos uno de los permisos requeridos
export const hasAnyPermission = (role: Role, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

// Función helper para verificar si un rol tiene todos los permisos requeridos
export const hasAllPermissions = (role: Role, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission));
};
