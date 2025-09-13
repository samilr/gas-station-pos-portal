import React, { useEffect } from "react";
import {
  Users,
  CreditCard,
  RefreshCw,
  BarChart3,
  XCircle,
  User,
  DollarSign,
  Fuel,
  Store,
  Building2,
} from "lucide-react";
import { useDashboard } from "./../../../hooks/useDashboard";
import { formatCurrency, formatNumber, formatRelativeTime } from "./../../../utils/dashboardUtils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../../context/AuthContext";
import DailySalesChart from "./charts/DailySalesChart";
import SiteSalesChart from "./charts/SiteSalesChart";
import CfTypePieChart from "./charts/CfTypePieChart";
import TopProductsChart from "./charts/TopProductsChart";

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
    totalTransactions,
    totalSales,
    totalReturns,
    totalFuelSales,
    totalStoreSales,
    salesByVendor,
    dailySales,
    chartLoading,
    chartError,
    chartFilters,
    siteSales,
    siteLoading,
    siteError,
    siteChartFilters,
    cfTypeData,
    recentTransactions,
    allTransactions,
    loading,
    error,
    refresh,
    loadChartData,
    updateChartFilters,
    refreshChartData,
    getChartStats,
    loadSiteSalesData,
    refreshSiteData,
    updateSiteChartFilters,
    getSiteStats,
  } = useDashboard();

  // Debug: Log CF Type Data
  console.log("CF Type Data:", cfTypeData);

  // Función para obtener la fecha y hora actual de Santo Domingo
  const getCurrentSantoDomingoDateTime = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("es-DO", {
      timeZone: "America/Santo_Domingo",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return formatter.format(now);
  };

  // Cargar datos del gráfico después de que se cargue el dashboard principal
  useEffect(() => {
    if (!loading && !error) {
      // Esperar un poco para que el usuario vea que el dashboard principal se cargó
      const timer = setTimeout(() => {
        console.log("📊 Iniciando carga de datos del gráfico...");
        loadChartData();

        // Cargar datos de sucursales después de un pequeño delay adicional
        setTimeout(() => {
          console.log("🏢 Iniciando carga de datos de sucursales...");
          loadSiteSalesData();
        }, 500); // 0.5 segundos adicionales
      }, 1000); // 1 segundo de delay

      return () => clearTimeout(timer);
    }
  }, [loading, error, loadChartData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {user?.name || "Usuario"}!
            </h1>
            <p className="text-gray-600">
              Estás viendo datos del sistema para{" "}
              {getCurrentSantoDomingoDateTime()}
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
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 animate-pulse"
            >
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
              ¡Bienvenido, {user?.name || "Usuario"}! 👋
            </h1>
            <p className="text-gray-600">
              Estás viendo datos del sistema para{" "}
              {getCurrentSantoDomingoDateTime()}
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
              <h3 className="text-lg font-medium text-red-800">
                Error al cargar datos
              </h3>
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
            ¡Bienvenido, {user?.name || "Usuario"}!
          </h1>
          <p className="text-gray-600">
            Estás viendo datos del sistema para{" "}
            {getCurrentSantoDomingoDateTime()}
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

      {/* Main Stats Grid - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
          onClick={() => navigate("/dashboard/transactions")}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Ventas Totales
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalSales)}
              </p>
              <p className="text-sm text-gray-500">
                de {formatNumber(totalTransactions)} transacciones
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
          onClick={() => navigate("/dashboard/transactions")}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Total de Retornos
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalReturns)}
              </p>
              <p className="text-sm text-gray-500">
                transacciones de devolución
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-full">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
          onClick={() => navigate("/dashboard/transactions/revenue")}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Ventas de Combustible
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalFuelSales)}
              </p>
              <p className="text-sm text-gray-500">Comprobantes NCF</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-full">
              <Fuel className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
          onClick={() => navigate("/dashboard/transactions/tienda")}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Ventas de Tienda
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalStoreSales)}
              </p>
              <p className="text-sm text-gray-500">Productos de conveniencia</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-full">
              <Store className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Recent Transactions and Sales by Vendor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
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
                        {transaction.taxpayerName || transaction.taxpayerId || 'Consumidor Final'}
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

        {/* Sales by Vendor */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Ventas por Vendedor
            </h3>
            <span className="text-sm text-gray-500">
              Top {salesByVendor?.length || 0} vendedores
            </span>
          </div>
          <div className="space-y-3">
            {salesByVendor && salesByVendor.length > 0 ? (
              salesByVendor.slice(0, 5).map((vendor, index) => (
                <div
                  key={vendor.staftId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {vendor.staftName}
                      </p>
                      <p className="text-xs text-gray-600">
                        ID: {vendor.staftId} • {vendor.transactionCount}{" "}
                        transacciones
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(vendor.totalSales)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalSales > 0
                        ? `${Math.round(
                            (vendor.totalSales / totalSales) * 100
                          )}%`
                        : "0%"}{" "}
                      del total
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

      {/* CF Type Pie Chart and Top Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <TopProductsChart
          data={allTransactions}
          loading={loading}
          error={error}
        />
        <CfTypePieChart data={cfTypeData} loading={loading} error={error} />
      </div>

      {/* Daily Sales Chart Section */}
      <div className="grid grid-cols-1 gap-6">
        <DailySalesChart
          data={dailySales}
          loading={chartLoading}
          error={chartError}
          chartFilters={chartFilters}
          onUpdateFilters={updateChartFilters}
          onRefresh={refreshChartData}
          chartStats={getChartStats}
        />
      </div>

      {/* Site Sales Chart Section */}
      <div className="grid grid-cols-1 gap-6">
        <SiteSalesChart
          data={siteSales}
          loading={siteLoading}
          error={siteError}
          chartFilters={siteChartFilters}
          onUpdateFilters={updateSiteChartFilters}
          onRefresh={refreshSiteData}
          siteStats={getSiteStats}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/dashboard/users")}
            className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Gestionar Usuarios</h4>
            <p className="text-sm text-gray-600">
              Ver y administrar usuarios del sistema
            </p>
          </button>

          <button
            onClick={() => navigate("/dashboard/transactions")}
            className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <CreditCard className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Ver Transacciones</h4>
            <p className="text-sm text-gray-600">
              Revisar transacciones y ventas
            </p>
          </button>

          <button
            onClick={() => navigate("/dashboard/reports")}
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
