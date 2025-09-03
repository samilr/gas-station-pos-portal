import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Extraer la sección activa de la URL
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    
    // Extraer la sección principal y subsección
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const section = segments[1];
      const subsection = segments[2];
      
      // Casos especiales para rutas específicas
      if (section === 'sites' && !subsection) {
        return 'sites.list';
      }
      if (section === 'pos' && subsection === 'terminals') {
        return 'pos.terminals';
      }
      if (section === 'pos' && subsection === 'devices') {
        return 'pos.devices';
      }
      if (section === 'logs' && subsection === 'actions') {
        return 'logs.actions';
      }
      if (section === 'logs' && subsection === 'errors') {
        return 'logs.errors';
      }
      
      return `${section}${subsection ? `.${subsection}` : ''}`;
    }
    return 'dashboard';
  };

  const activeSection = getActiveSection();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={() => {}} // No necesitamos esta función con rutas
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeSection={activeSection} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
