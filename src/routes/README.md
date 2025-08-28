# Sistema de Rutas - Portal Administrativo

## 📋 Descripción

Este archivo documenta la estructura de rutas implementada con React Router v6 para el portal administrativo.

## 🏗️ Estructura de Rutas

### Rutas Principales

```
/                           → Redirige a /dashboard
/login                      → Página de autenticación
/dashboard                  → Dashboard principal
```

### Rutas del Dashboard

#### Usuarios (`/dashboard/users`)
- `/dashboard/users` → Redirige a `/dashboard/users/list`
- `/dashboard/users/list` → Lista de usuarios
- `/dashboard/users/create` → Crear usuario
- `/dashboard/users/active` → Usuarios activos
- `/dashboard/users/inactive` → Usuarios inactivos

#### Analytics (`/dashboard/analytics`)
- `/dashboard/analytics` → Redirige a `/dashboard/analytics/overview`
- `/dashboard/analytics/overview` → Vista general de analytics
- `/dashboard/analytics/charts` → Gráficos analytics
- `/dashboard/analytics/realtime` → Analytics en tiempo real

#### Transacciones (`/dashboard/transactions`)
- `/dashboard/transactions` → Redirige a `/dashboard/transactions/list`
- `/dashboard/transactions/list` → Lista de transacciones
- `/dashboard/transactions/revenue` → Ingresos y ganancias
- `/dashboard/transactions/refunds` → Reembolsos

#### Productos (`/dashboard/products`)
- `/dashboard/products` → Redirige a `/dashboard/products/list`
- `/dashboard/products/list` → Inventario de productos
- `/dashboard/products/create` → Crear nuevo producto
- `/dashboard/products/categories` → Categorías de productos

#### Base de Datos (`/dashboard/database`)
- `/dashboard/database` → Redirige a `/dashboard/database/connections`
- `/dashboard/database/connections` → Conexiones de BD
- `/dashboard/database/tables` → Tablas de BD
- `/dashboard/database/backup` → Respaldos de BD

#### Seguridad (`/dashboard/security`)
- `/dashboard/security` → Redirige a `/dashboard/security/permissions`
- `/dashboard/security/permissions` → Gestión de permisos
- `/dashboard/security/keys` → API Keys
- `/dashboard/security/alerts` → Alertas de seguridad

#### Reportes (`/dashboard/reports`)
- `/dashboard/reports` → Redirige a `/dashboard/reports/analytics`
- `/dashboard/reports/analytics` → Reportes de analytics
- `/dashboard/reports/export` → Exportar datos
- `/dashboard/reports/import` → Importar datos

#### Notificaciones (`/dashboard/notifications`)
- `/dashboard/notifications` → Redirige a `/dashboard/notifications/email`
- `/dashboard/notifications/email` → Notificaciones email
- `/dashboard/notifications/push` → Notificaciones push

#### Configuración (`/dashboard/settings`)
- `/dashboard/settings` → Redirige a `/dashboard/settings/general`
- `/dashboard/settings/general` → Configuración general
- `/dashboard/settings/api` → Configuración API
- `/dashboard/settings/theme` → Configuración de tema

## 🔒 Protección de Rutas

### Componentes de Protección

- **`ProtectedRoute`**: Protege rutas que requieren autenticación
- **`PublicRoute`**: Redirige usuarios autenticados desde rutas públicas

### Lógica de Protección

```typescript
// Rutas protegidas
if (!isAuthenticated) {
  return <Navigate to="/login" replace />
}

// Rutas públicas
if (isAuthenticated) {
  return <Navigate to="/dashboard" replace />
}
```

## 🎯 Hook Personalizado: `useNavigation`

### Funcionalidades

- **`activeSection`**: Sección activa actual basada en la URL
- **`routeMap`**: Mapeo de IDs de sección a rutas
- **`currentPath`**: Ruta actual completa

### Uso

```typescript
import { useNavigation } from '../hooks/useNavigation';

const { activeSection, routeMap, currentPath } = useNavigation();
```

## 📁 Estructura de Archivos

```
src/
├── routes/
│   ├── index.tsx          # Configuración principal de rutas
│   └── README.md          # Esta documentación
├── hooks/
│   └── useNavigation.ts   # Hook para navegación
├── components/
│   └── layout/
│       ├── DashboardLayout.tsx  # Layout principal con rutas
│       ├── Sidebar.tsx          # Navegación lateral
│       └── Header.tsx           # Encabezado
└── App.tsx                # Configuración del router
```

## 🚀 Beneficios de la Nueva Estructura

### ✅ Ventajas

1. **URLs Limpias**: Cada sección tiene su propia URL
2. **Navegación Directa**: Los usuarios pueden acceder directamente a cualquier sección
3. **Historial del Navegador**: Funciona correctamente con el botón atrás/adelante
4. **Compartir Enlaces**: Se pueden compartir URLs específicas
5. **SEO Mejorado**: Mejor indexación por motores de búsqueda
6. **Escalabilidad**: Fácil agregar nuevas rutas y secciones
7. **Mantenibilidad**: Código más organizado y modular

### 🔧 Características Técnicas

- **React Router v6**: Última versión con mejoras de rendimiento
- **Lazy Loading**: Carga de componentes bajo demanda
- **Protección de Rutas**: Autenticación automática
- **Redirecciones Inteligentes**: Navegación fluida entre secciones
- **Estado Sincronizado**: URL siempre refleja el estado actual

## 📝 Notas de Implementación

### Migración de Estado Local a Rutas

- **Antes**: Estado local `activeSection` en el componente Dashboard
- **Después**: Estado derivado de la URL actual

### Compatibilidad

- Mantiene toda la funcionalidad existente
- No requiere cambios en componentes de sección
- Preserva el sistema de permisos
- Mantiene la UI/UX actual

## 🎯 Próximos Pasos

1. **Lazy Loading**: Implementar carga diferida de componentes
2. **Breadcrumbs**: Agregar navegación de migas de pan
3. **Rutas Anidadas**: Implementar rutas más complejas si es necesario
4. **Analytics de Rutas**: Tracking de navegación de usuarios
