import {
  LayoutDashboard, Users, Settings, BarChart3, FileText,
  TrendingUp, Activity, AlertTriangle, Sliders, Receipt,
  Package, Monitor, Smartphone, Building2, FuelIcon, Store,
  DollarSign, Landmark, Zap, CreditCard, Shield, BookUser,
  Gauge, DollarSign as PriceIcon, Container, Cpu, Wrench,
  Tag, ClipboardList, History, Barcode, Wrench as MaintenanceIcon
} from 'lucide-react';

export interface SubMenuItem {
  id: string;
  label: string;
  icon: any;
  permission?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  permission?: string;
  categoryPermission?: string;
  subItems?: SubMenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    subItems: [
      { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
      { id: 'analytics.overview', label: 'Analytics', icon: TrendingUp, permission: 'analytics.view' },
    ],
  },
  {
    id: 'transactions',
    label: 'Transacciones',
    icon: DollarSign,
    permission: 'transactions.view',
    subItems: [
      { id: 'transactions.list', label: 'Todas las ventas', icon: Receipt, permission: 'transactions.view' },
      { id: 'transactions.tienda', label: 'Tienda', icon: Store, permission: 'transactions.view' },
      { id: 'transactions.revenue', label: 'Comprobantes NCF', icon: FuelIcon, permission: 'transactions.view' },
      { id: 'dispensers.transactions', label: 'Ventas Combustible', icon: FuelIcon, permission: 'dispensers.view' },
    ],
  },
  {
    id: 'maintenance',
    label: 'Mantenimiento',
    icon: MaintenanceIcon,
    permission: 'products.view',
    subItems: [
      { id: 'products.list', label: 'Inventario', icon: Package, permission: 'products.view' },
      { id: 'products.categories', label: 'Categorías', icon: Users, permission: 'products.view' },
      { id: 'products.barcodes', label: 'Barcodes', icon: Barcode, permission: 'products.view' },
      { id: 'gov.taxpayers', label: 'Contribuyentes', icon: Users, permission: 'settings.view' },
    ],
  },
  {
    id: 'dispensers',
    label: 'Dispensadoras',
    icon: FuelIcon,
    permission: 'dispensers.view',
    subItems: [
      { id: 'dispensers.monitor', label: 'Monitoreo', icon: Gauge, permission: 'dispensers.view' },
      { id: 'dispensers.control', label: 'Control', icon: Sliders, permission: 'dispensers.view' },
      { id: 'dispensers.prices', label: 'Precios', icon: PriceIcon, permission: 'dispensers.view' },
      { id: 'dispensers.tanks', label: 'Tanques', icon: Container, permission: 'dispensers.view' },
      { id: 'dispensers.system', label: 'Sistema', icon: Cpu, permission: 'dispensers.view' },
      { id: 'dispensers.hardware', label: 'Hardware', icon: Wrench, permission: 'dispensers.view' },
      { id: 'dispensers.tags', label: 'Tags RFID', icon: Tag, permission: 'dispensers.view' },
      { id: 'dispensers.reports', label: 'Reportes', icon: ClipboardList, permission: 'dispensers.view' },
    ],
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: Users,
    permission: 'users.view',
    subItems: [
      { id: 'users.list', label: 'Lista de Usuarios', icon: Users, permission: 'users.view' },
      { id: 'users.roles', label: 'Roles', icon: Shield, permission: 'users.view' },
      { id: 'users.staft-groups', label: 'Grupos de Cajeros', icon: BookUser, permission: 'users.view' },
    ],
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    permission: 'settings.view',
    categoryPermission: 'settings.view',
    subItems: [
      { id: 'settings.payments', label: 'Métodos de Pago', icon: CreditCard, permission: 'settings.view' },
      { id: 'settings.appconfig', label: 'App Config Móvil', icon: Smartphone, permission: 'settings.view' },
      { id: 'pos.terminals', label: 'Terminales POS', icon: Monitor, permission: 'terminals.view' },
      { id: 'pos.devices', label: 'Dispositivos POS', icon: Smartphone, permission: 'devices.view' },
      { id: 'sites.list', label: 'Sucursales', icon: Building2, permission: 'sites.view' },
      { id: 'gov.taxes', label: 'Impuestos', icon: Receipt, permission: 'settings.view' },
      { id: 'gov.cf-config', label: 'Config Fiscal (CF)', icon: Shield, permission: 'settings.view' },
      { id: 'zataca.main', label: 'Zataca', icon: Zap, permission: 'settings.view' },
      { id: 'logs.actions', label: 'Actions Log', icon: Activity, permission: 'logs.view' },
      { id: 'logs.errors', label: 'Error Log', icon: AlertTriangle, permission: 'logs.view' },
    ],
  },
];

export const sectionTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Usuarios',
  'users.list': 'Usuarios',
  'users.profile': 'Mi Perfil',
  'users.roles': 'Roles',
  'users.staft-groups': 'Grupos de Cajeros',
  transactions: 'Transacciones',
  'transactions.list': 'Transacciones',
  'transactions.tienda': 'Tienda',
  'transactions.revenue': 'Comprobantes NCF',
  analytics: 'Analytics',
  'analytics.overview': 'Analytics',
  maintenance: 'Mantenimiento',
  products: 'Mantenimiento',
  'products.list': 'Inventario',
  'products.categories': 'Categorías',
  'products.barcodes': 'Barcodes',
  pos: 'Puntos de Venta',
  'pos.terminals': 'Terminales',
  'pos.devices': 'Dispositivos',
  sites: 'Sucursales',
  'sites.list': 'Sucursales',
  dispensers: 'Dispensadoras',
  'dispensers.monitor': 'Monitoreo',
  'dispensers.control': 'Control',
  'dispensers.prices': 'Precios',
  'dispensers.tanks': 'Tanques',
  'dispensers.system': 'Sistema',
  'dispensers.hardware': 'Hardware',
  'dispensers.tags': 'Tags RFID',
  'dispensers.reports': 'Reportes',
  'dispensers.transactions': 'Ventas Combustible',
  logs: 'Registros',
  'logs.actions': 'Actions Log',
  'logs.errors': 'Error Log',
  gov: 'Gobierno / Fiscal',
  'gov.taxpayers': 'Contribuyentes',
  'gov.taxes': 'Impuestos',
  'gov.cf-config': 'Config Fiscal',
  zataca: 'Zataca',
  'zataca.main': 'Zataca',
  settings: 'Configuración',
  'settings.general': 'General',
  'settings.payments': 'Métodos de Pago',
  'settings.appconfig': 'App Config Móvil',
};
