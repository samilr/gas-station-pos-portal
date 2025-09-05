import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
      
      {/* Botón de toggle entre sidebar y contenido */}
      <div className="relative">
        <button
          id="side-nav-trigger"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -left-3 top-20 z-50 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all duration-300 group"
          type="button"
          aria-haspopup="menu"
          aria-label="menu"
          aria-expanded={!sidebarCollapsed}
          title={sidebarCollapsed ? "Expandir" : "Colapsar"}
          tabIndex={0}
        >
          <div className="transform transition-transform duration-300">
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </div>
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {sidebarCollapsed ? "Expandir" : "Colapsar"}
          </div>
        </button>
      </div>
      
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
