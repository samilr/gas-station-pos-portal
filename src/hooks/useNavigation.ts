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
      return `${segments[1]}${segments[2] ? `.${segments[2]}` : ''}`;
    }
    return 'dashboard';
  };

  const activeSection = getActiveSection();

  // Mapear IDs de sección a rutas
  const routeMap: { [key: string]: string } = {
    'dashboard': '/dashboard',
    'users': '/dashboard/users',
    'users.list': '/dashboard/users/list',
    'users.create': '/dashboard/users/create',
    'users.active': '/dashboard/users/active',
    'users.inactive': '/dashboard/users/inactive',
    'analytics': '/dashboard/analytics',
    'analytics.overview': '/dashboard/analytics/overview',
    'analytics.charts': '/dashboard/analytics/charts',
    'analytics.realtime': '/dashboard/analytics/realtime',
    'transactions': '/dashboard/transactions',
    'transactions.list': '/dashboard/transactions/list',
    'transactions.revenue': '/dashboard/transactions/revenue',
    'transactions.refunds': '/dashboard/transactions/refunds',
    'products': '/dashboard/products',
    'products.list': '/dashboard/products/list',
    'products.create': '/dashboard/products/create',
    'products.categories': '/dashboard/products/categories',
    'pos': '/dashboard/pos',
      'pos.terminals': '/dashboard/pos/terminals',
  'pos.devices': '/dashboard/pos/devices',
  'sites.list': '/dashboard/sites',
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
    'settings.theme': '/dashboard/settings/theme'
  };

  return {
    activeSection,
    routeMap,
    currentPath: location.pathname
  };
};
