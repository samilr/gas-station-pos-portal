import { useAuth } from '../context/AuthContext';
import { 
  Permission, 
  Role, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  COMPONENT_PERMISSIONS 
} from '../config/permissions';

/**
 * Hook personalizado para verificar permisos de usuario
 * Proporciona funciones para controlar la visibilidad de componentes basada en roles
 */
export const usePermissions = () => {
  const { user } = useAuth();
  
  const userRole = user?.role as Role;
  
  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const can = (permission: Permission): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };
  
  /**
   * Verifica si el usuario tiene al menos uno de los permisos requeridos
   */
  const canAny = (permissions: Permission[]): boolean => {
    if (!userRole) return false;
    return hasAnyPermission(userRole, permissions);
  };
  
  /**
   * Verifica si el usuario tiene todos los permisos requeridos
   */
  const canAll = (permissions: Permission[]): boolean => {
    if (!userRole) return false;
    return hasAllPermissions(userRole, permissions);
  };
  
  /**
   * Verifica si el usuario puede ver un componente específico
   */
  const canViewComponent = (componentName: string): boolean => {
    if (!userRole) return false;
    
    const requiredPermissions = COMPONENT_PERMISSIONS[componentName];
    if (!requiredPermissions) return true; // Si no hay permisos definidos, permitir acceso
    
    return hasAnyPermission(userRole, requiredPermissions);
  };
  
  /**
   * Verifica si el usuario puede realizar una acción específica
   */
  const canPerformAction = (action: string, resource: string): boolean => {
    const permission = `${resource}.${action}` as Permission;
    return can(permission);
  };
  
  /**
   * Obtiene todos los permisos del usuario actual
   */
  const getUserPermissions = (): Permission[] => {
    if (!userRole) return [];
    return COMPONENT_PERMISSIONS[userRole] || [];
  };
  
  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (role: Role): boolean => {
    return userRole === role;
  };
  
  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.includes(userRole);
  };
  
  /**
  * Verifica si el usuario es administrador (ADMIN o AUDIT)
   */
  const isAdmin = (): boolean => {
  return hasAnyRole([Role.ADMIN, Role.AUDIT]);
  };
  
  /**
   * Verifica si el usuario es editor (MANAGER o SUPERVISOR)
   */
  const isEditor = (): boolean => {
    return hasAnyRole([Role.MANAGER, Role.SUPERVISOR]);
  };
  
  /**
  * Verifica si el usuario es solo lector (AUDIT)
   */
  const isReadOnly = (): boolean => {
  return hasRole(Role.AUDIT);
  };

  return {
    // Estado del usuario
    userRole,
    isAuthenticated: !!user,
    
    // Funciones de verificación de permisos
    can,
    canAny,
    canAll,
    canViewComponent,
    canPerformAction,
    
    // Funciones de verificación de roles
    hasRole,
    hasAnyRole,
    isAdmin,
    isEditor,
    isReadOnly,
    
    // Información de permisos
    getUserPermissions,
    
    // Helpers para componentes específicos
    canViewUsers: () => can('users.view'),
    canCreateUsers: () => can('users.create'),
    canEditUsers: () => can('users.edit'),
    canDeleteUsers: () => can('users.delete'),
    
    canViewTransactions: () => can('transactions.view'),
    canCreateTransactions: () => can('transactions.create'),
    canEditTransactions: () => can('transactions.edit'),
    canDeleteTransactions: () => can('transactions.delete'),
    canReverseTransactions: () => can('transactions.reverse'),
    
    canViewProducts: () => can('products.view'),
    canCreateProducts: () => can('products.create'),
    canEditProducts: () => can('products.edit'),
    canDeleteProducts: () => can('products.delete'),
    
    canViewSites: () => can('sites.view'),
    canCreateSites: () => can('sites.create'),
    canEditSites: () => can('sites.edit'),
    canDeleteSites: () => can('sites.delete'),
    
    canViewTerminals: () => can('terminals.view'),
    canCreateTerminals: () => can('terminals.create'),
    canEditTerminals: () => can('terminals.edit'),
    canDeleteTerminals: () => can('terminals.delete'),
    
    canViewDevices: () => can('devices.view'),
    canCreateDevices: () => can('devices.create'),
    canEditDevices: () => can('devices.edit'),
    canDeleteDevices: () => can('devices.delete'),
    
    canViewAnalytics: () => can('analytics.view'),
    canExportAnalytics: () => can('analytics.export'),
    
    canViewReports: () => can('reports.view'),
    canCreateReports: () => can('reports.create'),
    canExportReports: () => can('reports.export'),
    
    canViewLogs: () => can('logs.view'),
    canExportLogs: () => can('logs.export'),
    
    canViewDatabase: () => can('database.view'),
    canEditDatabase: () => can('database.edit'),
    canBackupDatabase: () => can('database.backup'),
    
    canViewSecurity: () => can('security.view'),
    canEditSecurity: () => can('security.edit'),
    canManageSecurityKeys: () => can('security.keys'),
    
    canViewNotifications: () => can('notifications.view'),
    canEditNotifications: () => can('notifications.edit'),
    
    canViewSettings: () => can('settings.view'),
    canEditSettings: () => can('settings.edit')
  };
};
