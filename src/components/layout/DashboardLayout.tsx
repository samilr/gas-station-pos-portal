import React from 'react';
import { useLocation } from 'react-router-dom';
import AppShell from './shell/AppShell';
import { HeaderProvider } from '../../context/HeaderContext';

const DashboardLayout: React.FC = () => {
  const location = useLocation();

  // Extraer la sección activa de la URL
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';

    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const section = segments[1];
      const subsection = segments[2];

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
      if (section === 'dispensers' && subsection) {
        return `dispensers.${subsection}`;
      }
      if (section === 'dispensers') {
        return 'dispensers.monitor';
      }

      return `${section}${subsection ? `.${subsection}` : ''}`;
    }
    return 'dashboard';
  };

  const activeSection = getActiveSection();

  return (
    <HeaderProvider>
      <AppShell activeSection={activeSection} />
    </HeaderProvider>
  );
};

export default DashboardLayout;
