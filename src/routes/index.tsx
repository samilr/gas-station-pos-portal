import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/auth/Login';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardHome from '../components/dashboard/DashboardHome';
import UsersSection from '../components/dashboard/sections/users/UsersSection';
import TransactionsSection from '../components/dashboard/sections/transactions/TransactionsSection';
import TerminalsSection from '../components/dashboard/sections/pos/TerminalsSection';
import DevicesSection from '../components/dashboard/sections/pos/DevicesSection';
import SitesSection from '../components/dashboard/sections/sites/SitesSection';
import GenericSection from '../components/dashboard/sections/GenericSection';
import { 
  BarChart3, 
  Database, 
  Shield, 
  FileText, 
  Bell, 
  Settings,
  Users,
  CreditCard,
  Package,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  PieChart,
  Activity,
  Server,
  HardDrive,
  DatabaseBackup as Backup,
  Lock,
  Key,
  AlertTriangle,
  FileBarChart,
  Download,
  Upload,
  Mail,
  MessageSquare,
  Sliders,
  Globe,
  Palette,
  Receipt,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import ProductsSection from '../components/dashboard/sections/products/ProductsSection';
import ActionsLogSection from '../components/dashboard/sections/logs/ActionsLogSection';
import ErrorLogSection from '../components/dashboard/sections/logs/ErrorLogSection';

// Componente de protección de rutas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente de protección de rutas basado en permisos
const PermissionRoute: React.FC<{ 
  children: React.ReactNode; 
  permission: string;
  fallback?: React.ReactNode;
}> = ({ children, permission, fallback }) => {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Componente de redirección para usuarios autenticados
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// Componente para manejar la ruta raíz
const RootRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si el usuario está autenticado, redirigir al dashboard
  // Si no está autenticado, redirigir al login
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

// Configuración de rutas
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRoute />
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <DashboardHome />
          </React.Suspense>
        )
      },
      // Rutas de Usuarios
      {
        path: 'users',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="users.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="list" replace />
            </PermissionRoute>
          },
          {
            path: 'list',
            element: <PermissionRoute permission="users.view"><UsersSection /></PermissionRoute>
          },
          {
            path: 'active',
            element: (
              <PermissionRoute permission="users.view">
                <GenericSection
                  title="Usuarios Activos"
                  description="Lista de usuarios activos en el sistema"
                  icon={Users}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'inactive',
            element: (
              <PermissionRoute permission="users.view">
                <GenericSection
                  title="Usuarios Inactivos"
                  description="Lista de usuarios inactivos en el sistema"
                  icon={Users}
                />
              </PermissionRoute>
            )
          }
        ]
      },
      // Rutas de Analytics
      {
        path: 'analytics',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="analytics.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="overview" replace />
            </PermissionRoute>
          },
          {
            path: 'overview',
            element: (
              <PermissionRoute permission="analytics.view">
                <GenericSection
                  title="Analytics - Vista General"
                  description="Dashboard general de analytics y métricas"
                  icon={BarChart3}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'charts',
            element: (
              <PermissionRoute permission="analytics.view">
                <GenericSection
                  title="Gráficos Analytics"
                  description="Visualización avanzada de datos con gráficos"
                  icon={BarChart3}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'realtime',
            element: (
              <PermissionRoute permission="analytics.view">
                <GenericSection
                  title="Analytics en Tiempo Real"
                  description="Monitoreo de métricas en tiempo real"
                  icon={BarChart3}
                />
              </PermissionRoute>
            )
          }
        ]
      },
      // Rutas de Transacciones
      {
        path: 'transactions',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="transactions.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="list" replace />
            </PermissionRoute>
          },
          {
            path: 'list',
            element: <PermissionRoute permission="transactions.view"><TransactionsSection /></PermissionRoute>
          },
          {
            path: 'tienda',
            element: (
              <PermissionRoute permission="transactions.view">
                <TransactionsSection isTiendaView={true} />
              </PermissionRoute>
            )
          },
          {
            path: 'revenue',
            element: (
              <PermissionRoute permission="transactions.view">
                <TransactionsSection isNCFView={true} />
              </PermissionRoute>
            )
          },
          {
            path: 'refunds',
            element: (
              <PermissionRoute permission="transactions.edit">
                <GenericSection
                  title="Reembolsos"
                  description="Gestión de reembolsos y devoluciones"
                  icon={CreditCard}
                />
              </PermissionRoute>
            )
          }
        ]
      },
      // Rutas de Productos
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="products.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="list" replace />
            </PermissionRoute>
          },
          {
            path: 'list',
            element: <PermissionRoute permission="products.view"><ProductsSection /></PermissionRoute>
          },
          {
            path: 'create',
            element: (
              <PermissionRoute permission="products.create">
                <GenericSection
                  title="Crear Nuevo Producto"
                  description="Formulario para agregar productos al inventario"
                  icon={Package}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'categories',
            element: (
              <PermissionRoute permission="products.view">
                <GenericSection
                  title="Categorías de Productos"
                  description="Gestiona las categorías de productos"
                  icon={Package}
                />
              </PermissionRoute>
            )
          }
        ]
      },
      // Rutas de Puntos de Venta
      {
        path: 'pos',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="terminals.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="terminals" replace />
            </PermissionRoute>
          },
          {
            path: 'terminals',
            element: <PermissionRoute permission="terminals.view"><TerminalsSection /></PermissionRoute>
          },
          {
            path: 'devices',
            element: <PermissionRoute permission="devices.view"><DevicesSection /></PermissionRoute>
          }
        ]
      },
      // Rutas de Sucursales
      {
        path: 'sites',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="sites.view"><SitesSection /></PermissionRoute>
          }
        ]
      },
      // Rutas de Logs
      {
        path: 'logs',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="logs.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="actions" replace />
            </PermissionRoute>
          },
          {
            path: 'actions',
            element: <PermissionRoute permission="logs.view"><ActionsLogSection /></PermissionRoute>
          },
          {
            path: 'errors',
            element: <PermissionRoute permission="logs.view"><ErrorLogSection /></PermissionRoute>
          }
        ]
      },
      // Rutas de Base de Datos
      {
        path: 'database',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="database.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="connections" replace />
            </PermissionRoute>
          },
          {
            path: 'connections',
            element: (
              <PermissionRoute permission="database.view">
                <GenericSection
                  title="Conexiones de Base de Datos"
                  description="Gestiona las conexiones activas a la base de datos"
                  icon={Database}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'tables',
            element: (
              <PermissionRoute permission="database.view">
                <GenericSection
                  title="Tablas de Base de Datos"
                  description="Explora y gestiona las tablas de la base de datos"
                  icon={Database}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'backup',
            element: (
              <PermissionRoute permission="database.edit">
                <GenericSection
                  title="Respaldos de Base de Datos"
                  description="Gestiona respaldos y restauraciones"
                  icon={Database}
                />
              </PermissionRoute>
            )
          }
        ]
      },
      // Rutas de Seguridad
      {
        path: 'security',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="security.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="permissions" replace />
            </PermissionRoute>
          },
          {
            path: 'permissions',
            element: (
              <PermissionRoute permission="security.view">
                <GenericSection
                  title="Gestión de Permisos"
                  description="Configura permisos y roles de usuario"
                  icon={Shield}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'keys',
            element: (
              <PermissionRoute permission="security.edit">
                <GenericSection
                  title="API Keys"
                  description="Gestiona las claves de API del sistema"
                  icon={Shield}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'alerts',
            element: (
              <PermissionRoute permission="security.view">
                <GenericSection
                  title="Alertas de Seguridad"
                  description="Monitorea alertas y eventos de seguridad"
                  icon={Shield}
                />
              </PermissionRoute>
            )
          }
        ]
      },
      // Rutas de Reportes
      {
        path: 'reports',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="reports.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="analytics" replace />
            </PermissionRoute>
          },
          {
            path: 'analytics',
            element: (
              <PermissionRoute permission="reports.view">
                <GenericSection
                  title="Reportes de Analytics"
                  description="Genera reportes detallados de analytics"
                  icon={FileText}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'export',
            element: (
              <PermissionRoute permission="reports.create">
                <GenericSection
                  title="Exportar Datos"
                  description="Exporta datos del sistema en diferentes formatos"
                  icon={FileText}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'import',
            element: (
              <PermissionRoute permission="reports.create">
                <GenericSection
                  title="Importar Datos"
                  description="Importa datos externos al sistema"
                  icon={FileText}
                />
              </PermissionRoute>
            )
          }
        ]
      },
      // Rutas de Notificaciones
      {
        path: 'notifications',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="notifications.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="email" replace />
            </PermissionRoute>
          },
          {
            path: 'email',
            element: (
              <PermissionRoute permission="notifications.view">
                <GenericSection
                  title="Notificaciones Email"
                  description="Configura y gestiona notificaciones por email"
                  icon={Bell}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'push',
            element: (
              <PermissionRoute permission="notifications.edit">
                <GenericSection
                  title="Notificaciones Push"
                  description="Configura notificaciones push del sistema"
                  icon={Bell}
                />
              </PermissionRoute>
            )
          }
        ]
      },
      // Rutas de Configuración
      {
        path: 'settings',
        children: [
          {
            index: true,
            element: <PermissionRoute permission="settings.view" fallback={<Navigate to="/dashboard" replace />}>
              <Navigate to="general" replace />
            </PermissionRoute>
          },
          {
            path: 'general',
            element: (
              <PermissionRoute permission="settings.view">
                <GenericSection
                  title="Configuración General"
                  description="Configuración general del sistema"
                  icon={Settings}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'api',
            element: (
              <PermissionRoute permission="settings.edit">
                <GenericSection
                  title="Configuración API"
                  description="Configura endpoints y conexiones API"
                  icon={Settings}
                />
              </PermissionRoute>
            )
          },
          {
            path: 'theme',
            element: (
              <PermissionRoute permission="settings.view">
                <GenericSection
                  title="Configuración de Tema"
                  description="Personaliza la apariencia del portal"
                  icon={Settings}
                />
              </PermissionRoute>
            )
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);
