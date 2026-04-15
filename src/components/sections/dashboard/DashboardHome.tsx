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
import FuelDailyTrendChart from "../dispensers/charts/FuelDailyTrendChart";
import FuelByFuelGradeChart from "../dispensers/charts/FuelByFuelGradeChart";
import useFuelDashboard from "../../../hooks/useFuelDashboard";
import { CompactButton } from "../../ui";
import Toolbar from "../../ui/Toolbar";

const DashboardHome: React.FC = () => {
  let navigate: any;
  try { navigate = useNavigate(); } catch (error) { navigate = (path: string) => { window.location.href = path; }; }

  const { user } = useAuth();
  const {
    totalTransactions, totalSales, totalReturns, totalFuelSales, totalStoreSales,
    salesByVendor, dailySales, chartLoading, chartError, chartFilters,
    siteSales, siteLoading, siteError, siteChartFilters,
    cfTypeData, recentTransactions, allTransactions, topProducts,
    loading, error, refresh, loadChartData,
    updateChartFilters, refreshChartData, getChartStats,
    loadSiteSalesData, refreshSiteData, updateSiteChartFilters, getSiteStats,
  } = useDashboard();

  const fuelDash = useFuelDashboard({
    initialPeriod: '7d',
    enabled: { dailyTrend: true, byFuelGrade: true },
  });

  const getCurrentSantoDomingoDateTime = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("es-DO", {
      timeZone: "America/Santo_Domingo",
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
    return formatter.format(now);
  };

  useEffect(() => {
    if (!loading && !error) {
      const timer = setTimeout(() => {
        loadChartData();
        setTimeout(() => { loadSiteSalesData(); }, 500);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, error, loadChartData]);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-md font-semibold text-text-primary">Bienvenido, {user?.name || "Usuario"}</p>
            <p className="text-xs text-text-muted">{getCurrentSantoDomingoDateTime()}</p>
          </div>
          <CompactButton variant="primary" onClick={refresh}><RefreshCw className="w-3 h-3" /> Actualizar</CompactButton>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-sm p-3 border border-table-border animate-pulse">
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-md font-semibold text-text-primary">Bienvenido, {user?.name || "Usuario"}</p>
          <CompactButton variant="primary" onClick={refresh}><RefreshCw className="w-3 h-3" /> Reintentar</CompactButton>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-sm p-3 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header + Stats toolbar */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-md font-semibold text-text-primary">Bienvenido, {user?.name || "Usuario"}</p>
          <p className="text-xs text-text-muted">{getCurrentSantoDomingoDateTime()}</p>
        </div>
        <CompactButton variant="ghost" onClick={refresh}><RefreshCw className="w-3 h-3" /> Actualizar</CompactButton>
      </div>

      {/* Compact stat cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { title: "Ventas Totales", value: formatCurrency(totalSales), sub: `${formatNumber(totalTransactions)} trans.`, color: "text-green-600", onClick: () => navigate("/dashboard/transactions") },
          { title: "Retornos", value: formatCurrency(totalReturns), sub: "devoluciones", color: "text-red-600", onClick: () => navigate("/dashboard/transactions") },
          { title: "Combustible", value: formatCurrency(totalFuelSales), sub: "NCF", color: "text-orange-600", onClick: () => navigate("/dashboard/transactions/revenue") },
          { title: "Tienda", value: formatCurrency(totalStoreSales), sub: "conveniencia", color: "text-purple-600", onClick: () => navigate("/dashboard/transactions/tienda") },
        ].map((stat) => (
          <div key={stat.title} onClick={stat.onClick}
            className="bg-white rounded-sm p-2 border border-table-border hover:bg-row-hover cursor-pointer transition-colors">
            <p className="text-2xs text-text-muted uppercase tracking-wide">{stat.title}</p>
            <p className={`text-md font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-2xs text-text-muted">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions + Sales by Vendor */}
      <div className="grid grid-cols-2 gap-2">
        {/* Recent Transactions */}
        <div className="bg-white rounded-sm p-3 border border-table-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">Transacciones Recientes</span>
            <span className="text-2xs text-text-muted">{recentTransactions.length}</span>
          </div>
          <div className="space-y-1">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      transaction.taxpayerName && transaction.taxpayerName !== 'Consumidor Final' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {transaction.taxpayerName && transaction.taxpayerName !== 'Consumidor Final' ? (
                        <Building2 className="w-3 h-3 text-green-600" />
                      ) : (
                        <User className="w-3 h-3 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-text-primary font-medium">#{transaction.transNumber} · {transaction.cfNumber}</p>
                      <p className="text-2xs text-text-muted">{transaction.taxpayerName || 'Consumidor Final'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">{formatCurrency(transaction.total || 0)}</p>
                    <p className="text-2xs text-text-muted">{transaction.transDate ? formatRelativeTime(transaction.transDate) : 'Reciente'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-text-muted text-sm">No hay transacciones recientes</div>
            )}
          </div>
        </div>

        {/* Sales by Vendor */}
        <div className="bg-white rounded-sm p-3 border border-table-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">Ventas por Vendedor</span>
            <span className="text-2xs text-text-muted">Top {salesByVendor?.length || 0}</span>
          </div>
          <div className="space-y-1">
            {salesByVendor && salesByVendor.length > 0 ? (
              salesByVendor.slice(0, 5).map((vendor, index) => (
                <div key={vendor.staftId} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xs font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm text-text-primary font-medium">{vendor.staftName}</p>
                      <p className="text-2xs text-text-muted">ID: {vendor.staftId} · {vendor.transactionCount} trans.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">{formatCurrency(vendor.totalSales)}</p>
                    <p className="text-2xs text-text-muted">{totalSales > 0 ? `${Math.round((vendor.totalSales / totalSales) * 100)}%` : "0%"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-text-muted text-sm">No hay datos</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-sm border border-table-border p-2">
          <TopProductsChart data={allTransactions} topProducts={topProducts} loading={loading} error={error} />
        </div>
        <div className="bg-white rounded-sm border border-table-border p-2">
          <CfTypePieChart data={cfTypeData} loading={loading} error={error} />
        </div>
      </div>

      <div className="bg-white rounded-sm border border-table-border p-2">
        <DailySalesChart data={dailySales} loading={chartLoading} error={chartError}
          chartFilters={chartFilters} onUpdateFilters={updateChartFilters}
          onRefresh={refreshChartData} chartStats={getChartStats} />
      </div>

      <div className="bg-white rounded-sm border border-table-border p-2">
        <SiteSalesChart data={siteSales} loading={siteLoading} error={siteError}
          chartFilters={siteChartFilters} onUpdateFilters={updateSiteChartFilters}
          onRefresh={refreshSiteData} siteStats={getSiteStats} />
      </div>

      {/* Combustible — últimos 7 días */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <FuelDailyTrendChart data={fuelDash.dailyTrend} loading={fuelDash.loading} error={fuelDash.error} />
        <FuelByFuelGradeChart data={fuelDash.byFuelGrade} loading={fuelDash.loading} error={fuelDash.error} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-sm p-3 border border-table-border">
        <span className="text-sm font-semibold text-text-primary block mb-2">Acciones Rápidas</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { title: "Usuarios", icon: Users, color: "blue", onClick: () => navigate("/dashboard/users") },
            { title: "Transacciones", icon: CreditCard, color: "green", onClick: () => navigate("/dashboard/transactions") },
            { title: "Reportes", icon: BarChart3, color: "purple", onClick: () => navigate("/dashboard/reports") },
          ].map((action) => (
            <button key={action.title} onClick={action.onClick}
              className={`p-2 text-left bg-${action.color}-50 hover:bg-${action.color}-100 rounded-sm border border-${action.color}-200 transition-colors`}>
              <action.icon className={`w-4 h-4 text-${action.color}-600 mb-1`} />
              <p className="text-sm font-medium text-text-primary">{action.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
