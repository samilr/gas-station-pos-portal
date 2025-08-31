import React from 'react';
import {
  Users,
  CreditCard,
  Building2,
  Monitor,
  Smartphone,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency, formatNumber, formatRelativeTime, getStatusColor, getActionIcon } from '../../utils/dashboardUtils';
import DashboardChart from './DashboardChart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    totalUsers,
    activeUsers,
    totalTransactions,
    totalSales,
    totalSites,
    activeSites,
    totalTerminals,
    activeTerminals,
    totalDevices,
    activeDevices,
    totalActions,
    totalErrors,
    recentTransactions,
    recentActions,
    recentErrors,
    loading,
    error,
    refresh
  } = useDashboard();

  // Función para obtener la fecha y hora actual de Santo Domingo
  const getCurrentSantoDomingoDateTime = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('es-DO', {
      timeZone: 'America/Santo_Domingo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return formatter.format(now);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {user?.name || 'Usuario'}!
            </h1>
            <p className="text-gray-600">
              Estás viendo datos del sistema para {getCurrentSantoDomingoDateTime()}
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {user?.name || 'Usuario'}! 👋
            </h1>
            <p className="text-gray-600">
              Estás viendo datos del sistema para {getCurrentSantoDomingoDateTime()}
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error al cargar datos</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Ventas Totales',
      value: formatCurrency(totalSales),
      total: formatNumber(totalTransactions),
      change: '+8.1%',
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'Transacciones completadas'
    },
    {
      name: 'Usuarios Activos',
      value: activeUsers,
      total: totalUsers,
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
      description: 'Usuarios con sesión activa'
    },
    {
      name: 'Sucursales Activas',
      value: activeSites,
      total: totalSites,
      change: '+2',
      icon: Building2,
      color: 'bg-purple-500',
      description: 'Sucursales operativas'
    },
    {
      name: 'Terminales Activas',
      value: activeTerminals,
      total: totalTerminals,
      change: '+5',
      icon: Monitor,
      color: 'bg-orange-500',
      description: 'Terminales en línea'
    },
    {
      name: 'Dispositivos Activos',
      value: activeDevices,
      total: totalDevices,
      change: '+3',
      icon: Smartphone,
      color: 'bg-indigo-500',
      description: 'Dispositivos conectados'
    },
    {
      name: 'Acciones del Sistema',
      value: formatNumber(totalActions),
      total: '',
      change: '+15%',
      icon: Activity,
      color: 'bg-teal-500',
      description: 'Actividades registradas'
    },
    {
      name: 'Errores del Sistema',
      value: totalErrors,
      total: '',
      change: '-2',
      icon: AlertTriangle,
      color: 'bg-red-500',
      description: 'Errores pendientes'
    },
    {
      name: 'Tasa de Éxito',
      value: totalTransactions > 0 ? `${Math.round((totalTransactions / (totalTransactions + totalErrors)) * 100)}%` : '0%',
      total: '',
      change: '+2.5%',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      description: 'Transacciones exitosas'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Bienvenido, {user?.name || 'Usuario'}!
          </h1>
          <p className="text-gray-600">
            Estás viendo datos del sistema para {getCurrentSantoDomingoDateTime()}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
              onClick={() => {
                switch(stat.name) {
                  case 'Ventas Totales':
                    navigate('/dashboard/transactions');
                    break;
                  case 'Usuarios Activos':
                    navigate('/dashboard/users');
                    break;
                  case 'Sucursales Activas':
                    navigate('/dashboard/sites');
                    break;
                  case 'Terminales Activas':
                    navigate('/dashboard/pos/terminals');
                    break;
                  case 'Dispositivos Activos':
                    navigate('/dashboard/pos/devices');
                    break;
                  case 'Acciones del Sistema':
                    navigate('/dashboard/logs/actions');
                    break;
                  case 'Errores del Sistema':
                    navigate('/dashboard/logs/errors');
                    break;
                  case 'Tasa de Éxito':
                    navigate('/dashboard/transactions');
                    break;
                  default:
                    break;
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.total && (
                    <p className="text-sm text-gray-500">de {stat.total} total</p>
                  )}
                  <div className="flex items-center space-x-1">
                    {stat.change.startsWith('+') ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h3>
            <span className="text-sm text-gray-500">{recentTransactions.length} transacciones</span>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.taxpayerName && transaction.taxpayerName !== 'Consumidor Final' 
                        ? 'bg-green-100' 
                        : 'bg-blue-100'
                    }`}>
                      {transaction.taxpayerName && transaction.taxpayerName !== 'Consumidor Final' ? (
                        <Building2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <User className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {`#${transaction.transNumber +' - '+ transaction.cfNumber || index + 1}`}
                      </p>
                      <p className="text-xs text-gray-600">
                        {transaction.taxpayerName || transaction.taxpayer_id || 'Consumidor Final'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.total || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.transDate ? formatRelativeTime(transaction.transDate) : 'Reciente'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay transacciones recientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <span className="text-sm text-gray-500">{recentActions.length} acciones</span>
          </div>
          <div className="space-y-3">
            {recentActions.length > 0 ? (
              recentActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">
                    {getActionIcon(action.action || '')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {action.description || 'Acción del sistema'}
                    </p>
                    <p className="text-xs text-gray-600">
                      por {action.staft_id || 'Sistema'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {action.created_at ? formatRelativeTime(action.created_at) : 'Reciente'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">API Gateway</span>
            </div>
            <span className="text-sm text-green-600 font-medium">99.9%</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Base de Datos</span>
            </div>
            <span className="text-sm text-green-600 font-medium">100%</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Cache Server</span>
            </div>
            <span className="text-sm text-yellow-600 font-medium">98.7%</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Errores</span>
            </div>
            <span className="text-sm text-red-600 font-medium">{totalErrors}</span>
          </div>
        </div>
      </div>

            {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart
          title="Distribución de Usuarios"
          data={[
            { label: 'Activos', value: activeUsers, color: 'bg-green-500' },
            { label: 'Inactivos', value: totalUsers - activeUsers, color: 'bg-red-500' }
          ]}
          total={totalUsers}
          change="+12%"
          isPositive={true}
        />
        
        <DashboardChart
          title="Estado de Sucursales"
          data={[
            { label: 'Activas', value: activeSites, color: 'bg-green-500' },
            { label: 'Inactivas', value: totalSites - activeSites, color: 'bg-red-500' }
          ]}
          total={totalSites}
          change="+2"
          isPositive={true}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/dashboard/users')}
            className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Gestionar Usuarios</h4>
            <p className="text-sm text-gray-600">Ver y administrar usuarios del sistema</p>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/transactions')}
            className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <CreditCard className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Ver Transacciones</h4>
            <p className="text-sm text-gray-600">Revisar transacciones y ventas</p>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/reports')}
            className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Generar Reportes</h4>
            <p className="text-sm text-gray-600">Crear reportes detallados</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;