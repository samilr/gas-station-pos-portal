// Ejemplo de uso del sistema de permisos
// Este archivo muestra cómo implementar el control de visibilidad en tus componentes

import React from 'react';
import { 
  PermissionGate, 
  ComponentGate, 
  ActionGate, 
  RoleGate, 
  AdminGate, 
  EditorGate 
} from '../components/common/PermissionGate';
import { usePermissions } from '../hooks/usePermissions';

// Ejemplo 1: Uso básico con PermissionGate
export const ExampleComponent1: React.FC = () => {
  return (
    <div>
      <h2>Ejemplo de PermissionGate</h2>
      
      {/* Solo usuarios con permiso de crear usuarios */}
      <PermissionGate permissions={['users.create']}>
        <button>Crear Usuario</button>
      </PermissionGate>
      
      {/* Solo usuarios con rol ADMIN o AUDIT */}
      <PermissionGate roles={['ADMIN', 'AUDIT']}>
        <button>Acción Administrativa</button>
      </PermissionGate>
      
      {/* Usuario debe tener TODOS los permisos */}
      <PermissionGate permissions={['users.view', 'users.edit']} mode="all">
        <button>Editar Usuario</button>
      </PermissionGate>
      
      {/* Con fallback personalizado */}
      <PermissionGate permissions={['users.delete']} fallback={<p>No tienes permisos para eliminar usuarios</p>}>
        <button>Eliminar Usuario</button>
      </PermissionGate>
    </div>
  );
};

// Ejemplo 2: Uso con ComponentGate
export const ExampleComponent2: React.FC = () => {
  return (
    <div>
      <h2>Ejemplo de ComponentGate</h2>
      
      {/* Solo si puede ver el componente UsersSection */}
      <ComponentGate componentName="UsersSection">
        <div>Contenido de la sección de usuarios</div>
      </ComponentGate>
      
      {/* Solo si puede ver el modal de usuarios */}
      <ComponentGate componentName="UserModal">
        <button>Abrir Modal de Usuario</button>
      </ComponentGate>
    </div>
  );
};

// Ejemplo 3: Uso con ActionGate
export const ExampleComponent3: React.FC = () => {
  return (
    <div>
      <h2>Ejemplo de ActionGate</h2>
      
      {/* Solo si puede crear usuarios */}
      <ActionGate action="create" resource="users">
        <button>Crear Usuario</button>
      </ActionGate>
      
      {/* Solo si puede eliminar productos */}
      <ActionGate action="delete" resource="products">
        <button>Eliminar Producto</button>
      </ActionGate>
    </div>
  );
};

// Ejemplo 4: Uso con RoleGate
export const ExampleComponent4: React.FC = () => {
  return (
    <div>
      <h2>Ejemplo de RoleGate</h2>
      
      {/* Solo para roles específicos */}
      <RoleGate roles={['ADMIN', 'MANAGER']}>
        <button>Acción de Gestión</button>
      </RoleGate>
      
      {/* Solo para un rol específico */}
      <RoleGate roles={['ADMIN']} mode="all">
        <button>Solo para Admin</button>
      </RoleGate>
    </div>
  );
};

// Ejemplo 5: Uso con AdminGate, EditorGate
export const ExampleComponent5: React.FC = () => {
  return (
    <div>
      <h2>Ejemplo de AdminGate y EditorGate</h2>
      
      {/* Solo para administradores */}
      <AdminGate>
        <button>Acción de Administrador</button>
      </AdminGate>
      
      {/* Solo para editores */}
      <EditorGate>
        <button>Acción de Editor</button>
      </EditorGate>
    </div>
  );
};

// Ejemplo 6: Uso directo del hook usePermissions
export const ExampleComponent6: React.FC = () => {
  const { 
    can, 
    canViewUsers, 
    canCreateUsers, 
    canReverseTransactions,
    isAdmin,
    userRole 
  } = usePermissions();

  return (
    <div>
      <h2>Ejemplo con usePermissions Hook</h2>
      
      <p>Tu rol: {userRole}</p>
      
      {/* Verificación directa de permisos */}
      {can('users.view') && <p>Puedes ver usuarios</p>}
      {can('users.create') && <p>Puedes crear usuarios</p>}
      {can('transactions.reverse') && <p>Puedes reversar transacciones</p>}
      
      {/* Usando helpers específicos */}
      {canViewUsers() && <button>Ver Usuarios</button>}
      {canCreateUsers() && <button>Crear Usuario</button>}
      {canReverseTransactions() && <button>Reversar Transacción</button>}
      
      {/* Verificación de roles */}
      {isAdmin() && <p>Eres administrador</p>}
      
      {/* Renderizado condicional */}
      {can('users.delete') ? (
        <button>Eliminar Usuario</button>
      ) : (
        <p>No tienes permisos para eliminar usuarios</p>
      )}
    </div>
  );
};

// Ejemplo 7: Implementación en un componente real
export const UsersSectionExample: React.FC = () => {
  usePermissions();

  return (
    <div className="users-section">
      <h2>Gestión de Usuarios</h2>
      
      {/* Tabla de usuarios */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Juan Pérez</td>
            <td>MANAGER</td>
            <td>
              {/* Botones de acción con permisos */}
              <PermissionGate permissions={['users.edit']}>
                <button>Editar</button>
              </PermissionGate>
              
              <PermissionGate permissions={['users.delete']}>
                <button>Eliminar</button>
              </PermissionGate>
            </td>
          </tr>
        </tbody>
      </table>
      
      {/* Botón de crear usuario */}
      <PermissionGate permissions={['users.create']}>
        <button>Crear Nuevo Usuario</button>
      </PermissionGate>
      
      {/* Mensaje si no tiene permisos */}
      <PermissionGate permissions={['users.view']} fallback={
        <p>No tienes permisos para ver usuarios</p>
      }>
        <div>Lista de usuarios aquí...</div>
      </PermissionGate>
    </div>
  );
};

// Ejemplo 8: Control de navegación
export const NavigationExample: React.FC = () => {
  const { 
    canViewUsers, 
    canViewProducts, 
    canViewTransactions,
    canViewAnalytics 
  } = usePermissions();

  return (
    <nav>
      <ul>
        {/* Solo mostrar enlaces si tiene permisos */}
        {canViewUsers() && (
          <li><a href="/users">Usuarios</a></li>
        )}
        
        {canViewProducts() && (
          <li><a href="/products">Productos</a></li>
        )}
        
        {canViewTransactions() && (
          <li><a href="/transactions">Transacciones</a></li>
        )}
        
        {canViewAnalytics() && (
          <li><a href="/analytics">Analytics</a></li>
        )}
      </ul>
    </nav>
  );
};
