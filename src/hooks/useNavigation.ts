import { useLocation } from 'react-router-dom';

export const useNavigation = () => {
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

  // Mapear IDs de sección a rutas
  const routeMap: { [key: string]: string } = {
    'dashboard': '/dashboard',
    'users': '/dashboard/users',
    'users.list': '/dashboard/users/list',
    'users.profile': '/dashboard/users/profile',
    'users.create': '/dashboard/users/create',
    'users.active': '/dashboard/users/active',
    'users.inactive': '/dashboard/users/inactive',
    'analytics': '/dashboard/analytics',
    'analytics.overview': '/dashboard/analytics/overview',
    'analytics.charts': '/dashboard/analytics/charts',
    'analytics.realtime': '/dashboard/analytics/realtime',
    'transactions': '/dashboard/transactions',
    'transactions.list': '/dashboard/transactions/list',
    'transactions.fuel': '/dashboard/transactions/fuel',
    'transactions.tienda': '/dashboard/transactions/tienda',
    'transactions.revenue': '/dashboard/transactions/revenue',
    'transactions.refunds': '/dashboard/transactions/refunds',
    'products': '/dashboard/products',
    'products.list': '/dashboard/products/list',
    'products.create': '/dashboard/products/create',
    'products.categories': '/dashboard/products/categories',
    'pos': '/dashboard/pos',
    'pos.terminals': '/dashboard/pos/terminals',
    'pos.devices': '/dashboard/pos/devices',
    'pos.host-types': '/dashboard/pos/host-types',
    'sites': '/dashboard/sites',
    'sites.list': '/dashboard/sites',
    'sites.create': '/dashboard/sites/create',
    'sites.active': '/dashboard/sites/active',
    'sites.inactive': '/dashboard/sites/inactive',
    'dispensers': '/dashboard/dispensers',
    'dispensers.dashboard': '/dashboard/dispensers/dashboard',
    'dispensers.config': '/dashboard/dispensers/config',
    'dispensers.pts-config': '/dashboard/dispensers/pts-config',
    'dispensers.monitor': '/dashboard/dispensers/monitor',
    'dispensers.prices': '/dashboard/dispensers/prices',
    'dispensers.tanks': '/dashboard/dispensers/tanks',
    'dispensers.system': '/dashboard/dispensers/system',
    'dispensers.hardware': '/dashboard/dispensers/hardware',
    'dispensers.tags': '/dashboard/dispensers/tags',
    'dispensers.reports': '/dashboard/dispensers/reports',
    'dispensers.islands': '/dashboard/dispensers/islands',
    'dispensers.workbench': '/dashboard/dispensers/workbench',
    'logs': '/dashboard/logs',
    'logs.actions': '/dashboard/logs/actions',
    'logs.errors': '/dashboard/logs/errors',
    'database': '/dashboard/database',
    'database.connections': '/dashboard/database/connections',
    'database.tables': '/dashboard/database/tables',
    'database.backup': '/dashboard/database/backup',
    'security': '/dashboard/security',
    'security.permissions': '/dashboard/security/permissions',
    'security.keys': '/dashboard/security/keys',
    'security.alerts': '/dashboard/security/alerts',
    'reports': '/dashboard/reports',
    'reports.analytics': '/dashboard/reports/analytics',
    'reports.export': '/dashboard/reports/export',
    'reports.import': '/dashboard/reports/import',
    'notifications': '/dashboard/notifications',
    'notifications.email': '/dashboard/notifications/email',
    'notifications.push': '/dashboard/notifications/push',
    'settings': '/dashboard/settings',
    'settings.general': '/dashboard/settings/general',
    'settings.api': '/dashboard/settings/api',
    'settings.theme': '/dashboard/settings/theme',
    'settings.payments': '/dashboard/settings/payments',
    'settings.appconfig': '/dashboard/settings/appconfig',
    // Gov
    'gov': '/dashboard/gov',
    'gov.taxpayers': '/dashboard/gov/taxpayers',
    'gov.taxes': '/dashboard/gov/taxes',
    'gov.tax-types': '/dashboard/gov/tax-types',
    'gov.tax-lines': '/dashboard/gov/tax-lines',
    'gov.cf-config': '/dashboard/gov/cf-config',
    // Dataphones
    'dataphones': '/dashboard/dataphones',
    'dataphones.suppliers': '/dashboard/dataphones/suppliers',
    'dataphones.list': '/dashboard/dataphones/list',
    'dataphones.terminals': '/dashboard/dataphones/terminals',
    // Card Payments
    'card-payments': '/dashboard/card-payments',
    'card-payments.list': '/dashboard/card-payments/list',
    // Jobs
    'jobs': '/dashboard/jobs',
    'jobs.list': '/dashboard/jobs/list',
    // Zataca
    'zataca': '/dashboard/zataca',
    'zataca.main': '/dashboard/zataca/main',
    // Products extras
    'products.barcodes': '/dashboard/products/barcodes',
    // Users extras
    'users.roles': '/dashboard/users/roles',
    'users.staft-groups': '/dashboard/users/staft-groups',
    'users.period-staft': '/dashboard/users/period-staft',
    'users.fuel-pump-shifts': '/dashboard/users/fuel-pump-shifts',
  };

  return {
    activeSection,
    routeMap,
    currentPath: location.pathname
  };
};
