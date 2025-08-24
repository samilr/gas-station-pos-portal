import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import DashboardHome from './DashboardHome';
import UsersSection from './sections/UsersSection';
import TransactionsSection from './sections/TransactionsSection';
import ProductsSection from './sections/ProductsSection';
import GenericSection from './sections/GenericSection';
import { 
  BarChart3, 
  Database, 
  Shield, 
  FileText, 
  Bell, 
  Settings,
  Users,
  CreditCard,
  Package
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { hasPermission } = useAuth();

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'users':
      case 'users.list':
        return <UsersSection />;
      case 'users.create':
        return (
          <GenericSection
            title="Crear Usuario"
            description="Formulario para crear nuevos usuarios"
            icon={Users}
          />
        );
      case 'users.active':
        return (
          <GenericSection
            title="Usuarios Activos"
            description="Lista de usuarios activos en el sistema"
            icon={Users}
          />
        );
      case 'users.inactive':
        return (
          <GenericSection
            title="Usuarios Inactivos"
            description="Lista de usuarios inactivos en el sistema"
            icon={Users}
          />
        );
      case 'transactions':
      case 'transactions.list':
        return <TransactionsSection />;
      case 'transactions.revenue':
        return (
          <GenericSection
            title="Ingresos y Ganancias"
            description="Análisis detallado de ingresos y ganancias"
            icon={CreditCard}
          />
        );
      case 'transactions.refunds':
        return (
          <GenericSection
            title="Reembolsos"
            description="Gestión de reembolsos y devoluciones"
            icon={CreditCard}
          />
        );
      case 'products':
      case 'products.list':
        return <ProductsSection />;
      case 'products.create':
        return (
          <GenericSection
            title="Crear Nuevo Producto"
            description="Formulario para agregar productos al inventario"
            icon={Package}
          />
        );
      case 'products.categories':
        return (
          <GenericSection
            title="Categorías de Productos"
            description="Gestiona las categorías de productos"
            icon={Package}
          />
        );
      case 'analytics':
      case 'analytics.overview':
        return (
          <GenericSection
            title="Analytics - Vista General"
            description="Dashboard general de analytics y métricas"
            icon={BarChart3}
          />
        );
      case 'analytics.charts':
        return (
          <GenericSection
            title="Gráficos Analytics"
            description="Visualización avanzada de datos con gráficos"
            icon={BarChart3}
          />
        );
      case 'analytics.realtime':
        return (
          <GenericSection
            title="Analytics en Tiempo Real"
            description="Monitoreo de métricas en tiempo real"
            icon={BarChart3}
          />
        );
      case 'database':
      case 'database.connections':
        return (
          <GenericSection
            title="Conexiones de Base de Datos"
            description="Gestiona las conexiones activas a la base de datos"
            icon={Database}
          />
        );
      case 'database.tables':
        return (
          <GenericSection
            title="Tablas de Base de Datos"
            description="Explora y gestiona las tablas de la base de datos"
            icon={Database}
          />
        );
      case 'database.backup':
        return (
          <GenericSection
            title="Respaldos de Base de Datos"
            description="Gestiona respaldos y restauraciones"
            icon={Database}
          />
        );
      case 'security':
      case 'security.permissions':
        return (
          <GenericSection
            title="Gestión de Permisos"
            description="Configura permisos y roles de usuario"
            icon={Shield}
          />
        );
      case 'security.keys':
        return (
          <GenericSection
            title="API Keys"
            description="Gestiona las claves de API del sistema"
            icon={Shield}
          />
        );
      case 'security.alerts':
        return (
          <GenericSection
            title="Alertas de Seguridad"
            description="Monitorea alertas y eventos de seguridad"
            icon={Shield}
          />
        );
      case 'reports':
      case 'reports.analytics':
        return (
          <GenericSection
            title="Reportes de Analytics"
            description="Genera reportes detallados de analytics"
            icon={FileText}
          />
        );
      case 'reports.export':
        return (
          <GenericSection
            title="Exportar Datos"
            description="Exporta datos del sistema en diferentes formatos"
            icon={FileText}
          />
        );
      case 'reports.import':
        return (
          <GenericSection
            title="Importar Datos"
            description="Importa datos externos al sistema"
            icon={FileText}
          />
        );
      case 'notifications':
      case 'notifications.email':
        return (
          <GenericSection
            title="Notificaciones Email"
            description="Configura y gestiona notificaciones por email"
            icon={Bell}
          />
        );
      case 'notifications.push':
        return (
          <GenericSection
            title="Notificaciones Push"
            description="Configura notificaciones push del sistema"
            icon={Bell}
          />
        );
      case 'settings':
      case 'settings.general':
        return (
          <GenericSection
            title="Configuración General"
            description="Configuración general del sistema"
            icon={Settings}
          />
        );
      case 'settings.api':
        return (
          <GenericSection
            title="Configuración API"
            description="Configura endpoints y conexiones API"
            icon={Settings}
          />
        );
      case 'settings.theme':
        return (
          <GenericSection
            title="Configuración de Tema"
            description="Personaliza la apariencia del portal"
            icon={Settings}
          />
        );
      default:
        // Check if user has permission for the section
        if (activeSection.includes('.')) {
          const mainSection = activeSection.split('.')[0];
          if (!hasPermission(`${mainSection}.view`)) {
            return (
              <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h3>
                  <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
                </div>
              </div>
            );
          }
        }
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeSection={activeSection} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;