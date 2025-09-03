# Sistema de Permisos Centralizado

Este sistema te permite controlar la visibilidad de todos los componentes de tu aplicación desde un solo lugar, basado en los roles de usuario.

## 🎯 Características Principales

- **Control centralizado**: Todos los permisos están definidos en un solo archivo
- **Fácil mantenimiento**: Cambia permisos sin tocar el código de los componentes
- **Flexible**: Múltiples formas de verificar permisos
- **Type-safe**: Completamente tipado con TypeScript
- **Performance**: Verificaciones eficientes de permisos

## 🏗️ Arquitectura del Sistema

```
src/
├── config/
│   ├── permissions.ts          # Configuración central de permisos
│   └── permissions.example.tsx # Ejemplos de uso
├── hooks/
│   └── usePermissions.ts       # Hook personalizado para permisos
└── components/
    └── common/
        └── PermissionGate.tsx  # Componentes wrapper para control de visibilidad
```

## 👥 Roles Disponibles

- **ADMIN**: Acceso completo a todo el sistema
- **MANAGER**: Acceso de gestión (sin eliminación)
- **SUPERVISOR**: Acceso de supervisión (similar a MANAGER)
- **AUDITOR**: Acceso de solo lectura + reversión de transacciones

## 🔐 Tipos de Permisos

### Permisos Granulares
- `users.view`, `users.create`, `users.edit`, `users.delete`
- `transactions.view`, `transactions.create`, `transactions.edit`, `transactions.delete`, `transactions.reverse`
- `products.view`, `products.create`, `products.edit`, `products.delete`
- `sites.view`, `sites.create`, `sites.edit`, `sites.delete`
- `terminals.view`, `terminals.create`, `terminals.edit`, `terminals.delete`
- `devices.view`, `devices.create`, `devices.edit`, `devices.delete`
- `analytics.view`, `analytics.export`
- `reports.view`, `reports.create`, `reports.export`
- `logs.view`, `logs.export`
- `database.view`, `database.edit`, `database.backup`
- `security.view`, `security.edit`, `security.keys`
- `notifications.view`, `notifications.edit`
- `settings.view`, `settings.edit`

## 🚀 Cómo Usar

### 1. Hook usePermissions (Recomendado)

```tsx
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
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
      {/* Verificación directa */}
      {can('users.view') && <p>Puedes ver usuarios</p>}
      
      {/* Usando helpers específicos */}
      {canViewUsers && <button>Ver Usuarios</button>}
      {canCreateUsers && <button>Crear Usuario</button>}
      {canReverseTransactions && <button>Reversar Transacción</button>}
      
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
```

### 2. Componentes Wrapper

#### PermissionGate (Más flexible)

```tsx
import { PermissionGate } from '../components/common/PermissionGate';

const MyComponent = () => {
  return (
    <div>
      {/* Solo usuarios con permiso específico */}
      <PermissionGate permissions={['users.create']}>
        <button>Crear Usuario</button>
      </PermissionGate>
      
      {/* Solo roles específicos */}
      <PermissionGate roles={['ADMIN', 'AUDITOR']}>
        <button>Acción Administrativa</button>
      </PermissionGate>
      
      {/* Usuario debe tener TODOS los permisos */}
      <PermissionGate permissions={['users.view', 'users.edit']} mode="all">
        <button>Editar Usuario</button>
      </PermissionGate>
      
      {/* Con fallback personalizado */}
      <PermissionGate 
        permissions={['users.delete']} 
        fallback={<p>No tienes permisos para eliminar usuarios</p>}
      >
        <button>Eliminar Usuario</button>
      </PermissionGate>
    </div>
  );
};
```

#### ComponentGate (Para componentes específicos)

```tsx
import { ComponentGate } from '../components/common/PermissionGate';

const MyComponent = () => {
  return (
    <div>
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
```

#### ActionGate (Para acciones específicas)

```tsx
import { ActionGate } from '../components/common/PermissionGate';

const MyComponent = () => {
  return (
    <div>
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
```

#### AdminGate, EditorGate (Para roles específicos)

```tsx
import { AdminGate, EditorGate } from '../components/common/PermissionGate';

const MyComponent = () => {
  return (
    <div>
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
```

## 📝 Cómo Modificar Permisos

### 1. Cambiar permisos de un rol

Edita `src/config/permissions.ts`:

```typescript
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Agregar o quitar permisos aquí
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'transactions.view', 'transactions.reverse',
    // ... más permisos
  ],
  MANAGER: [
    // Modificar permisos del MANAGER
    'users.view', 'users.create', 'users.edit', // Sin delete
    // ... más permisos
  ],
  // ... otros roles
};
```

### 2. Agregar nuevos permisos

```typescript
export type Permission = 
  // ... permisos existentes
  | 'newfeature.view'    // Nuevo permiso
  | 'newfeature.create'  // Nuevo permiso
  | 'newfeature.edit';   // Nuevo permiso

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // ... permisos existentes
    'newfeature.view', 'newfeature.create', 'newfeature.edit'
  ],
  MANAGER: [
    // ... permisos existentes
    'newfeature.view', 'newfeature.create' // Sin edit
  ],
  // ... otros roles
};
```

### 3. Agregar permisos para nuevos componentes

```typescript
export const COMPONENT_PERMISSIONS: Record<string, Permission[]> = {
  // ... componentes existentes
  
  // Nuevo componente
  'NewFeatureSection': ['newfeature.view'],
  'NewFeatureModal': ['newfeature.create', 'newfeature.edit'],
  'DeleteNewFeatureDialog': ['newfeature.delete']
};
```

## 🔧 Configuración Avanzada

### Modo Debug

```tsx
// Útil para desarrollo - siempre muestra el contenido
<PermissionGate permissions={['users.delete']} debug={true}>
  <button>Eliminar Usuario</button>
</PermissionGate>
```

### Múltiples verificaciones

```tsx
// Usuario debe tener el rol Y el permiso
<PermissionGate 
  permissions={['users.delete']} 
  roles={['ADMIN']} 
  mode="all"
>
  <button>Eliminar Usuario</button>
</PermissionGate>
```

### Fallbacks personalizados

```tsx
<PermissionGate 
  permissions={['users.delete']} 
  fallback={
    <div className="bg-yellow-100 p-4 rounded-lg">
      <p className="text-yellow-800">
        ⚠️ No tienes permisos para eliminar usuarios
      </p>
    </div>
  }
>
  <button>Eliminar Usuario</button>
</PermissionGate>
```

## 📊 Ejemplos de Implementación

### En una tabla de usuarios

```tsx
const UsersTable = () => {
  const { canEditUsers, canDeleteUsers } = usePermissions();

  return (
    <table>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.role}</td>
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
        ))}
      </tbody>
    </table>
  );
};
```

### En navegación

```tsx
const Navigation = () => {
  const { 
    canViewUsers, 
    canViewProducts, 
    canViewTransactions 
  } = usePermissions();

  return (
    <nav>
      <ul>
        {canViewUsers && <li><a href="/users">Usuarios</a></li>}
        {canViewProducts && <li><a href="/products">Productos</a></li>}
        {canViewTransactions && <li><a href="/transactions">Transacciones</a></li>}
      </ul>
    </nav>
  );
};
```

### En formularios

```tsx
const UserForm = () => {
  const { canCreateUsers, canEditUsers } = usePermissions();

  return (
    <form>
      <input type="text" placeholder="Nombre" />
      
      {/* Solo mostrar campos sensibles a administradores */}
      <PermissionGate permissions={['users.edit']}>
        <select>
          <option value="USER">Usuario</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </PermissionGate>
      
      <button type="submit">
        {canCreateUsers ? 'Crear Usuario' : 'Actualizar Usuario'}
      </button>
    </form>
  );
};
```

## 🚨 Consideraciones de Seguridad

1. **Frontend Only**: Este sistema solo controla la UI, no reemplaza la validación del backend
2. **Siempre validar en el servidor**: Los permisos del frontend son solo para UX
3. **No exponer información sensible**: Los permisos no deben revelar datos confidenciales
4. **Fallbacks apropiados**: Siempre proporciona mensajes claros cuando se deniegan permisos

## 🔍 Troubleshooting

### El componente no se muestra

1. Verifica que el usuario tenga el rol correcto
2. Confirma que el permiso esté definido en `ROLE_PERMISSIONS`
3. Usa `debug={true}` para verificar que el componente funcione
4. Revisa la consola para errores de TypeScript

### Error de tipos

1. Asegúrate de que el permiso esté definido en el tipo `Permission`
2. Verifica que el rol esté definido en el tipo `Role`
3. Importa correctamente los tipos desde `permissions.ts`

### Performance

1. Los componentes wrapper son ligeros y eficientes
2. Las verificaciones se realizan solo cuando cambia el usuario
3. Considera usar `useMemo` para verificaciones complejas si es necesario

## 📚 Recursos Adicionales

- `src/config/permissions.example.tsx` - Ejemplos completos de uso
- `src/hooks/usePermissions.ts` - Documentación del hook
- `src/components/common/PermissionGate.tsx` - Implementación de los wrappers

---

**¡Con este sistema, tienes control total sobre la visibilidad de componentes desde un solo lugar!** 🎉
