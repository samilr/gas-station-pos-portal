import React from 'react';
import {
  Users,
  CreditCard,
  Building2,
  Monitor,
  Activity,
  RefreshCw,
  BarChart3,
  XCircle,
  User,
  DollarSign
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { formatCurrency, formatNumber, formatRelativeTime, getActionIcon } from '../../utils/dashboardUtils';
import DashboardChart from './DashboardChart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatDateTimeToSantoDomingo } from '../../utils/dateUtils';

const DashboardHome: React.FC = () => {
  let navigate: any;
  
  try {
    navigate = useNavigate();
  } catch (error) {
    // Fallback si useNavigate no está disponible
    navigate = (path: string) => {
      window.location.href = path;
    };
  }
  
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
    totalErrors,
    recentTransactions,
    recentActions,
    salesByVendor,
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

      {/* Main Content Grid - Stats and Sales by Vendor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/dashboard/transactions')}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
                <p className="text-sm text-gray-500">de {formatNumber(totalTransactions)} transacciones</p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/dashboard/users')}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                <p className="text-sm text-gray-500">de {totalUsers} total</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/dashboard/pos/terminals')}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Terminales Activas</p>
                <p className="text-2xl font-bold text-gray-900">{activeTerminals}</p>
                <p className="text-sm text-gray-500">de {totalTerminals} total</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-full">
                <Monitor className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
            onClick={() => navigate('/dashboard/sites')}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Sucursales Activas</p>
                <p className="text-2xl font-bold text-gray-900">{activeSites}</p>
                <p className="text-sm text-gray-500">de {totalSites} total</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales by Vendor */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ventas por Vendedor</h3>
            <span className="text-sm text-gray-500">Top {salesByVendor.length} vendedores</span>
          </div>
          <div className="space-y-3">
            {salesByVendor.length > 0 ? (
              salesByVendor.map((vendor, index) => (
                <div key={vendor.staftId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {vendor.staftName}
                      </p>
                      <p className="text-xs text-gray-600">
                        ID: {vendor.staftId} • {vendor.transactionCount} transacciones
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(vendor.totalSales)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalSales > 0 ? `${Math.round((vendor.totalSales / totalSales) * 100)}%` : '0%'} del total
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay datos de ventas por vendedor</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h3>
            <span className="text-sm text-gray-500">Últimas {recentTransactions.length} transacciones</span>
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
            <span className="text-sm text-gray-500">Últimas {recentActions.length} acciones</span>
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
                      {action.created_at ? formatRelativeTime(formatDateTimeToSantoDomingo(action.created_at)) : 'Reciente'}
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