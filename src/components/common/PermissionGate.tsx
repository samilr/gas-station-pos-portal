import React, { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../config/permissions';

interface PermissionGateProps {
  // Permisos requeridos (al menos uno debe cumplirse)
  permissions?: Permission[];
  // Roles requeridos (al menos uno debe cumplirse)
  roles?: string[];
  // Componente a renderizar si se cumplen los permisos
  children: ReactNode;
  // Componente alternativo si no se cumplen los permisos (opcional)
  fallback?: ReactNode;
  // Modo de verificación: 'any' (al menos uno) o 'all' (todos)
  mode?: 'any' | 'all';
  // Si es true, renderiza children incluso si no hay permisos (útil para debugging)
  debug?: boolean;
}

/**
 * Componente wrapper que controla la visibilidad de otros componentes
 * basado en los permisos del usuario actual
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permissions = [],
  roles = [],
  children,
  fallback = null,
  mode = 'any',
  debug = false
}) => {
  const { can, canAny, canAll, hasRole, hasAnyRole } = usePermissions();

  // Si está en modo debug, siempre mostrar
  if (debug) {
    return <>{children}</>;
  }

  let hasAccess = false;

  // Verificar permisos si se especificaron
  if (permissions.length > 0) {
    if (mode === 'all') {
      hasAccess = canAll(permissions);
    } else {
      hasAccess = canAny(permissions);
    }
  }

  // Verificar roles si se especificaron
  if (roles.length > 0) {
    const hasRoleAccess = hasAnyRole(roles as any);
    // Si hay tanto permisos como roles, ambos deben cumplirse
    if (permissions.length > 0) {
      hasAccess = hasAccess && hasRoleAccess;
    } else {
      hasAccess = hasRoleAccess;
    }
  }

  // Si no se especificaron permisos ni roles, permitir acceso
  if (permissions.length === 0 && roles.length === 0) {
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Componente wrapper para verificar si el usuario puede ver un componente específico
 */
export const ComponentGate: React.FC<{
  componentName: string;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ componentName, children, fallback = null }) => {
  const { canViewComponent } = usePermissions();
  
  return canViewComponent(componentName) ? <>{children}</> : <>{fallback}</>;
};

/**
 * Componente wrapper para verificar si el usuario puede realizar una acción
 */
export const ActionGate: React.FC<{
  action: string;
  resource: string;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ action, resource, children, fallback = null }) => {
  const { canPerformAction } = usePermissions();
  
  return canPerformAction(action, resource) ? <>{children}</> : <>{fallback}</>;
};

/**
 * Componente wrapper para verificar si el usuario tiene un rol específico
 */
export const RoleGate: React.FC<{
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
  mode?: 'any' | 'all';
}> = ({ roles, children, fallback = null, mode = 'any' }) => {
  const { hasRole, hasAnyRole } = usePermissions();
  
  let hasAccess = false;
  
  if (mode === 'all') {
    hasAccess = roles.every(role => hasRole(role as any));
  } else {
    hasAccess = hasAnyRole(roles as any);
  }
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Componente wrapper para mostrar contenido solo a administradores
 */
export const AdminGate: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => {
  const { isAdmin } = usePermissions();
  
  return isAdmin() ? <>{children}</> : <>{fallback}</>;
};

/**
 * Componente wrapper para mostrar contenido solo a editores
 */
export const EditorGate: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => {
  const { isEditor } = usePermissions();
  
  return isEditor() ? <>{children}</> : <>{fallback}</>;
};

/**
 * Componente wrapper para mostrar contenido solo a usuarios de solo lectura
 */
export const ReadOnlyGate: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => {
  const { isReadOnly } = usePermissions();
  
  return isReadOnly() ? <>{children}</> : <>{fallback}</>;
};

// Exportar todos los componentes
export default PermissionGate;
