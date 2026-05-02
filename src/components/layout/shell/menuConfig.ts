import {
  LayoutDashboard, Users, Settings, BarChart3, FileText,
  TrendingUp, Activity, AlertTriangle, Receipt,
  Package, Monitor, Smartphone, Building2, FuelIcon, Store, Layers,
  DollarSign, Landmark, Zap, CreditCard, Shield, BookUser,
  Gauge, DollarSign as PriceIcon, Container, Cpu, Wrench,
  Tag, ClipboardList, History, Barcode,
  PlayCircle, Percent, Rows3, Columns, CalendarClock,
  ShoppingBag, UserCog, Wallet, Scale, Server, Sliders,
  UserCheck, Clock
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
      { id: 'transactions.list', label: 'Combustible', icon: FuelIcon, permission: 'transactions.view' },
      { id: 'transactions.tienda', label: 'Tienda', icon: Store, permission: 'transactions.view' },
      { id: 'transactions.revenue', label: 'Comprobantes NCF', icon: FileText, permission: 'transactions.view' },
      { id: 'card-payments.list', label: 'Pagos con Tarjeta', icon: CreditCard, permission: 'settings.view' },
    ],
  },
  {
    id: 'products',
    label: 'Productos',
    icon: ShoppingBag,
    permission: 'products.view',
    subItems: [
      { id: 'products.list', label: 'Inventario', icon: Package, permission: 'products.view' },
      { id: 'products.categories', label: 'Categorías', icon: Layers, permission: 'products.view' },
      { id: 'products.barcodes', label: 'Barcodes', icon: Barcode, permission: 'products.view' },
    ],
  },
  {
    id: 'users',
    label: 'Personal',
    icon: UserCog,
    permission: 'users.view',
    subItems: [
      { id: 'users.list', label: 'Usuarios', icon: Users, permission: 'users.view' },
      { id: 'users.roles', label: 'Roles', icon: Shield, permission: 'users.view' },
      { id: 'users.staft-groups', label: 'Grupos de Cajeros', icon: BookUser, permission: 'users.view' },
      { id: 'users.period-staft', label: 'Programación de Cajeros', icon: CalendarClock, permission: 'users.view' },
      { id: 'users.fuel-pump-shifts', label: 'Asignación por Bomba', icon: UserCheck, permission: 'users.view' },
      { id: 'users.shifts', label: 'Turnos', icon: Clock, permission: 'users.view' },
    ],
  },
  {
    id: 'dispensers',
    label: 'Operación Estación',
    icon: FuelIcon,
    permission: 'dispensers.view',
    subItems: [
      { id: 'dispensers.dashboard', label: 'Dashboard', icon: BarChart3, permission: 'dispensers.view' },
      { id: 'dispensers.monitor', label: 'Monitoreo', icon: Gauge, permission: 'dispensers.view' },
      { id: 'dispensers.prices', label: 'Precios', icon: PriceIcon, permission: 'dispensers.view' },
      { id: 'transactions.fuel', label: 'Bombas (Operacional)', icon: FuelIcon, permission: 'transactions.view' },
      { id: 'dispensers.reports', label: 'Reportes', icon: ClipboardList, permission: 'dispensers.view' },
      { id: 'dispensers.workbench', label: 'Workbench', icon: Columns, permission: 'dispensers.view' },
    ],
  },
  {
    id: 'payments',
    label: 'Pagos',
    icon: Wallet,
    permission: 'settings.view',
    subItems: [
      { id: 'settings.payments', label: 'Métodos de Pago', icon: CreditCard, permission: 'settings.view' },
      { id: 'dataphones.list', label: 'Dataphones', icon: Smartphone, permission: 'settings.view' },
      { id: 'dataphones.suppliers', label: 'Proveedores Dataphone', icon: Building2, permission: 'settings.view' },
      { id: 'dataphones.terminals', label: 'Dataphone-Terminal', icon: Monitor, permission: 'settings.view' },
    ],
  },
  {
    id: 'fiscal',
    label: 'Fiscal',
    icon: Scale,
    permission: 'settings.view',
    subItems: [
      { id: 'gov.taxpayers', label: 'Contribuyentes', icon: Users, permission: 'settings.view' },
      { id: 'gov.taxes', label: 'Impuestos', icon: Receipt, permission: 'settings.view' },
      { id: 'gov.tax-types', label: 'Tipos de Impuesto', icon: Percent, permission: 'settings.view' },
      { id: 'gov.tax-lines', label: 'Líneas de Impuesto', icon: Rows3, permission: 'settings.view' },
      { id: 'gov.cf-config', label: 'Config Fiscal (CF)', icon: Shield, permission: 'settings.view' },
      { id: 'zataca.main', label: 'Zataca', icon: Zap, permission: 'settings.view' },
    ],
  },
  {
    id: 'infrastructure',
    label: 'Infraestructura',
    icon: Server,
    permission: 'settings.view',
    subItems: [
      { id: 'sites.list', label: 'Sucursales', icon: Building2, permission: 'sites.view' },
      { id: 'pos.terminals', label: 'Terminales', icon: Monitor, permission: 'terminals.view' },
      { id: 'pos.devices', label: 'Dispositivos', icon: Smartphone, permission: 'devices.view' },
      { id: 'pos.host-types', label: 'Tipos de Dispositivo', icon: Layers, permission: 'devices.view' },
      { id: 'dispensers.tanks', label: 'Tanques', icon: Container, permission: 'dispensers.view' },
      { id: 'dispensers.islands', label: 'Fuel Islands', icon: Layers, permission: 'dispensers.view' },
      { id: 'dispensers.config', label: 'Configuración Dispensadoras', icon: Settings, permission: 'dispensers.view' },
      { id: 'dispensers.hardware', label: 'Hardware Bombas', icon: Wrench, permission: 'dispensers.view' },
      { id: 'dispensers.pts-config', label: 'Parámetros PTS', icon: Sliders, permission: 'dispensers.view' },
      { id: 'dispensers.system', label: 'Sistema PTS', icon: Cpu, permission: 'dispensers.view' },
      { id: 'dispensers.tags', label: 'Tags RFID', icon: Tag, permission: 'dispensers.view' },
    ],
  },
  {
    id: 'system',
    label: 'Sistema',
    icon: Settings,
    permission: 'settings.view',
    categoryPermission: 'settings.view',
    subItems: [
      { id: 'settings.appconfig', label: 'App Config Móvil', icon: Smartphone, permission: 'settings.view' },
      { id: 'jobs.list', label: 'Jobs', icon: PlayCircle, permission: 'settings.edit' },
      { id: 'logs.actions', label: 'Actions Log', icon: Activity, permission: 'logs.view' },
      { id: 'logs.errors', label: 'Error Log', icon: AlertTriangle, permission: 'logs.view' },
    ],
  },
];

export const sectionTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  'analytics.overview': 'Analytics',

  transactions: 'Transacciones',
  'transactions.list': 'Combustible',
  'transactions.fuel': 'Bombas (Operacional)',
  'transactions.tienda': 'Tienda',
  'transactions.revenue': 'Comprobantes NCF',

  products: 'Productos',
  'products.list': 'Inventario',
  'products.categories': 'Categorías',
  'products.barcodes': 'Barcodes',

  users: 'Personal',
  'users.list': 'Usuarios',
  'users.profile': 'Mi Perfil',
  'users.roles': 'Roles',
  'users.staft-groups': 'Grupos de Cajeros',
  'users.period-staft': 'Programación de Cajeros',
  'users.fuel-pump-shifts': 'Asignación por Bomba',
  'users.shifts': 'Turnos',

  dispensers: 'Operación Estación',
  'dispensers.dashboard': 'Dashboard',
  'dispensers.config': 'Configuración Dispensadoras',
  'dispensers.pts-config': 'Parámetros PTS',
  'dispensers.islands': 'Fuel Islands',
  'dispensers.workbench': 'Workbench',
  'dispensers.monitor': 'Monitoreo',
  'dispensers.prices': 'Precios',
  'dispensers.tanks': 'Tanques',
  'dispensers.system': 'Sistema PTS',
  'dispensers.hardware': 'Hardware Bombas',
  'dispensers.tags': 'Tags RFID',
  'dispensers.reports': 'Reportes',

  payments: 'Pagos',
  'settings.payments': 'Métodos de Pago',
  'card-payments': 'Pagos con Tarjeta',
  'card-payments.list': 'Pagos con Tarjeta',
  dataphones: 'Dataphones',
  'dataphones.suppliers': 'Proveedores Dataphone',
  'dataphones.list': 'Dataphones',
  'dataphones.terminals': 'Mapeo Dataphone-Terminal',

  fiscal: 'Fiscal',
  gov: 'Fiscal',
  'gov.taxpayers': 'Contribuyentes',
  'gov.taxes': 'Impuestos',
  'gov.tax-types': 'Tipos de Impuesto',
  'gov.tax-lines': 'Líneas de Impuesto',
  'gov.cf-config': 'Config Fiscal',
  zataca: 'Zataca',
  'zataca.main': 'Zataca',

  infrastructure: 'Infraestructura',
  sites: 'Sucursales',
  'sites.list': 'Sucursales',
  pos: 'Puntos de Venta',
  'pos.terminals': 'Terminales',
  'pos.devices': 'Dispositivos',
  'pos.host-types': 'Tipos de Dispositivo',

  system: 'Sistema',
  settings: 'Sistema',
  'settings.general': 'General',
  'settings.appconfig': 'App Config Móvil',
  jobs: 'Jobs',
  'jobs.list': 'Jobs',
  logs: 'Registros',
  'logs.actions': 'Actions Log',
  'logs.errors': 'Error Log',
};
