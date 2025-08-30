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
import ActionsLogSection from '../components/dashboard/sections/logs/ActionsLogSection';
import ErrorLogSection from '../components/dashboard/sections/logs/ErrorLogSection';
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

// Configuración de rutas
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
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
        element: <DashboardHome />
      },
      // Rutas de Usuarios
      {
        path: 'users',
        children: [
          {
            index: true,
            element: <Navigate to="list" replace />
          },
          {
            path: 'list',
            element: <UsersSection />
          },

          {
            path: 'active',
            element: (
              <GenericSection
                title="Usuarios Activos"
                description="Lista de usuarios activos en el sistema"
                icon={Users}
              />
            )
          },
          {
            path: 'inactive',
            element: (
              <GenericSection
                title="Usuarios Inactivos"
                description="Lista de usuarios inactivos en el sistema"
                icon={Users}
              />
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
            element: <Navigate to="overview" replace />
          },
          {
            path: 'overview',
            element: (
              <GenericSection
                title="Analytics - Vista General"
                description="Dashboard general de analytics y métricas"
                icon={BarChart3}
              />
            )
          },
          {
            path: 'charts',
            element: (
              <GenericSection
                title="Gráficos Analytics"
                description="Visualización avanzada de datos con gráficos"
                icon={BarChart3}
              />
            )
          },
          {
            path: 'realtime',
            element: (
              <GenericSection
                title="Analytics en Tiempo Real"
                description="Monitoreo de métricas en tiempo real"
                icon={BarChart3}
              />
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
            element: <Navigate to="list" replace />
          },
          {
            path: 'list',
            element: <TransactionsSection />
          },
          {
            path: 'revenue',
            element: (
              <GenericSection
                title="Ingresos y Ganancias"
                description="Análisis detallado de ingresos y ganancias"
                icon={CreditCard}
              />
            )
          },
          {
            path: 'refunds',
            element: (
              <GenericSection
                title="Reembolsos"
                description="Gestión de reembolsos y devoluciones"
                icon={CreditCard}
              />
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
            element: <Navigate to="list" replace />
          },
          {
            path: 'list',
            element: <ProductsSection />
          },
          {
            path: 'create',
            element: (
              <GenericSection
                title="Crear Nuevo Producto"
                description="Formulario para agregar productos al inventario"
                icon={Package}
              />
            )
          },
          {
            path: 'categories',
            element: (
              <GenericSection
                title="Categorías de Productos"
                description="Gestiona las categorías de productos"
                icon={Package}
              />
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
            element: <Navigate to="terminals" replace />
          },
          {
            path: 'terminals',
            element: <TerminalsSection />
          },
          {
            path: 'devices',
            element: <DevicesSection />
          }
        ]
      },
      // Rutas de Sucursales
      {
        path: 'sites',
        element: <SitesSection />
      },
      // Rutas de Logs
      {
        path: 'logs',
        children: [
          {
            index: true,
            element: <Navigate to="actions" replace />
          },
          {
            path: 'actions',
            element: <ActionsLogSection />
          },
          {
            path: 'errors',
            element: <ErrorLogSection />
          }
        ]
      },
      // Rutas de Base de Datos
      {
        path: 'database',
        children: [
          {
            index: true,
            element: <Navigate to="connections" replace />
          },
          {
            path: 'connections',
            element: (
              <GenericSection
                title="Conexiones de Base de Datos"
                description="Gestiona las conexiones activas a la base de datos"
                icon={Database}
              />
            )
          },
          {
            path: 'tables',
            element: (
              <GenericSection
                title="Tablas de Base de Datos"
                description="Explora y gestiona las tablas de la base de datos"
                icon={Database}
              />
            )
          },
          {
            path: 'backup',
            element: (
              <GenericSection
                title="Respaldos de Base de Datos"
                description="Gestiona respaldos y restauraciones"
                icon={Database}
              />
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
            element: <Navigate to="permissions" replace />
          },
          {
            path: 'permissions',
            element: (
              <GenericSection
                title="Gestión de Permisos"
                description="Configura permisos y roles de usuario"
                icon={Shield}
              />
            )
          },
          {
            path: 'keys',
            element: (
              <GenericSection
                title="API Keys"
                description="Gestiona las claves de API del sistema"
                icon={Shield}
              />
            )
          },
          {
            path: 'alerts',
            element: (
              <GenericSection
                title="Alertas de Seguridad"
                description="Monitorea alertas y eventos de seguridad"
                icon={Shield}
              />
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
            element: <Navigate to="analytics" replace />
          },
          {
            path: 'analytics',
            element: (
              <GenericSection
                title="Reportes de Analytics"
                description="Genera reportes detallados de analytics"
                icon={FileText}
              />
            )
          },
          {
            path: 'export',
            element: (
              <GenericSection
                title="Exportar Datos"
                description="Exporta datos del sistema en diferentes formatos"
                icon={FileText}
              />
            )
          },
          {
            path: 'import',
            element: (
              <GenericSection
                title="Importar Datos"
                description="Importa datos externos al sistema"
                icon={FileText}
              />
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
            element: <Navigate to="email" replace />
          },
          {
            path: 'email',
            element: (
              <GenericSection
                title="Notificaciones Email"
                description="Configura y gestiona notificaciones por email"
                icon={Bell}
              />
            )
          },
          {
            path: 'push',
            element: (
              <GenericSection
                title="Notificaciones Push"
                description="Configura notificaciones push del sistema"
                icon={Bell}
              />
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
            element: <Navigate to="general" replace />
          },
          {
            path: 'general',
            element: (
              <GenericSection
                title="Configuración General"
                description="Configuración general del sistema"
                icon={Settings}
              />
            )
          },
          {
            path: 'api',
            element: (
              <GenericSection
                title="Configuración API"
                description="Configura endpoints y conexiones API"
                icon={Settings}
              />
            )
          },
          {
            path: 'theme',
            element: (
              <GenericSection
                title="Configuración de Tema"
                description="Personaliza la apariencia del portal"
                icon={Settings}
              />
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
