import React, { useCallback, useState } from 'react';
import {
  Users, CreditCard, RefreshCw, BarChart3, XCircle, User, Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useDashboard } from '../../../hooks/useDashboard';
import useFuelDashboard from '../../../hooks/useFuelDashboard';
import { useFuelDashboardExtra } from '../../../hooks/useFuelDashboardExtra';
import { useSelectedSiteId } from '../../../hooks/useSelectedSite';
import { formatCurrency, formatRelativeTime } from '../../../utils/dashboardUtils';
import { toLocalIsoDate } from '../../../utils/dateUtils';
import { FuelDashboardFilters } from '../../../services/fuelTransactionService';
import { CompactButton } from '../../ui';
import FuelDashboardFiltersBar from './FuelDashboardFiltersBar';
import PeriodComparisonKpis from './charts/PeriodComparisonKpis';
import PaymentMethodsDonut from './charts/PaymentMethodsDonut';
import HeatmapChart from './charts/HeatmapChart';
import ByShiftChart from './charts/ByShiftChart';
import TopStaftTable from './charts/TopStaftTable';
import ByStaftDailyChart from './charts/ByStaftDailyChart';
import FuelByFuelGradeChart from '../dispensers/charts/FuelByFuelGradeChart';
import FuelDailyTrendChart from '../dispensers/charts/FuelDailyTrendChart';
import FuelHourlyChart from '../dispensers/charts/FuelHourlyChart';
import TopProductsChart from './charts/TopProductsChart';
import CfTypePieChart from './charts/CfTypePieChart';

const DashboardHome: React.FC = () => {
  let navigate: any;
  try {
    navigate = useNavigate();
  } catch {
    navigate = (path: string) => {
      window.location.href = path;
    };
  }

  const { user } = useAuth();
  const globalSiteId = useSelectedSiteId();

  const [filters, setFilters] = useState<FuelDashboardFilters>(() => {
    const today = toLocalIsoDate();
    return {
      startDate: today,
      endDate: today,
      siteId: globalSiteId ?? null,
      excludeOffline: true,
    };
  });

  // 6 nuevos endpoints — alimentados por el filterbar global.
  const extra = useFuelDashboardExtra(filters);

  // Charts existentes de fuel (daily-trend, by-fuel-grade, hourly) con los mismos filtros.
  const fuelDash = useFuelDashboard({
    enabled: { dailyTrend: true, byFuelGrade: true, hourly: true },
    controlledFilters: filters,
  });

  // Legacy preservado: Recent Transactions + TopProducts + CfType de tienda/NCF.
  const {
    cfTypeData, recentTransactions, allTransactions, topProducts,
    error: legacyError,
  } = useDashboard({
    startDate: filters.startDate ?? '',
    endDate: filters.endDate ?? '',
    siteId: filters.siteId,
  });

  const refreshAll = useCallback(() => {
    extra.paymentMethods.refetch();
    extra.byStaft.refetch();
    extra.byStaftByDay.refetch();
    extra.periodComparison.refetch();
    extra.heatmap.refetch();
    extra.byShift.refetch();
  }, [extra]);

  const anyFetching =
    extra.paymentMethods.isFetching ||
    extra.byStaft.isFetching ||
    extra.byStaftByDay.isFetching ||
    extra.periodComparison.isFetching ||
    extra.heatmap.isFetching ||
    extra.byShift.isFetching;

  const getCurrentSantoDomingoDateTime = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('es-DO', {
      timeZone: 'America/Santo_Domingo',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
    return formatter.format(now);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-md font-semibold text-text-primary">
            Bienvenido, {user?.name || 'Usuario'}
          </p>
          <p className="text-xs text-text-muted">{getCurrentSantoDomingoDateTime()}</p>
        </div>
      </div>

      {/* Filterbar global */}
      <FuelDashboardFiltersBar
        filters={filters}
        onChange={setFilters}
        onRefresh={refreshAll}
        refreshing={anyFetching}
      />

      {/* ROW 1 — KPIs con comparación de período */}
      <PeriodComparisonKpis
        data={extra.periodComparison.data}
        isLoading={extra.periodComparison.isLoading}
        isFetching={extra.periodComparison.isFetching}
        error={extra.periodComparison.error}
        onRetry={() => extra.periodComparison.refetch()}
      />

      {/* ROW 2 — Distribución por hora + Mix por combustible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <FuelHourlyChart
          data={fuelDash.hourly}
          loading={fuelDash.loading}
          error={fuelDash.error}
        />
        <FuelByFuelGradeChart
          data={fuelDash.byFuelGrade}
          loading={fuelDash.loading}
          error={fuelDash.error}
        />
      </div>

      {/* ROW 3 — Tendencia diaria + Métodos de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <FuelDailyTrendChart
          data={fuelDash.dailyTrend}
          loading={fuelDash.loading}
          error={fuelDash.error}
        />
        <PaymentMethodsDonut
          data={extra.paymentMethods.data}
          isLoading={extra.paymentMethods.isLoading}
          isFetching={extra.paymentMethods.isFetching}
          error={extra.paymentMethods.error}
          onRetry={() => extra.paymentMethods.refetch()}
        />
      </div>

      {/* ROW 3.5 — Heatmap día × hora (full width) */}
      <HeatmapChart
        data={extra.heatmap.data}
        isLoading={extra.heatmap.isLoading}
        isFetching={extra.heatmap.isFetching}
        error={extra.heatmap.error}
        onRetry={() => extra.heatmap.refetch()}
      />

      {/* ROW 4 — Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <ByShiftChart
          data={extra.byShift.data}
          isLoading={extra.byShift.isLoading}
          isFetching={extra.byShift.isFetching}
          error={extra.byShift.error}
          onRetry={() => extra.byShift.refetch()}
        />
        <TopStaftTable
          data={extra.byStaft.data}
          isLoading={extra.byStaft.isLoading}
          isFetching={extra.byStaft.isFetching}
          error={extra.byStaft.error}
          onRetry={() => extra.byStaft.refetch()}
        />
      </div>

      {/* ROW 5 — Vendedores por día */}
      <ByStaftDailyChart
        data={extra.byStaftByDay.data}
        isLoading={extra.byStaftByDay.isLoading}
        isFetching={extra.byStaftByDay.isFetching}
        error={extra.byStaftByDay.error}
        onRetry={() => extra.byStaftByDay.refetch()}
      />

      {/* ROW 6 — Contexto operacional + tienda/NCF */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Recent Transactions */}
        <div className="bg-white rounded-sm border border-table-border">
          <div className="flex items-center gap-2 px-3 h-8 bg-table-header border-b border-table-border">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wide">
              Transacciones Recientes
            </span>
            <span className="ml-auto text-2xs text-text-muted">{recentTransactions.length}</span>
          </div>
          <div className="p-2 space-y-1">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        tx.taxpayerName && tx.taxpayerName !== 'Consumidor Final'
                          ? 'bg-green-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      {tx.taxpayerName && tx.taxpayerName !== 'Consumidor Final' ? (
                        <Building2 className="w-3 h-3 text-green-600" />
                      ) : (
                        <User className="w-3 h-3 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-text-primary font-medium">
                        #{tx.transNumber} · {tx.cfNumber}
                      </p>
                      <p className="text-2xs text-text-muted">
                        {tx.taxpayerName || 'Consumidor Final'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">
                      {formatCurrency(tx.total || 0)}
                    </p>
                    <p className="text-2xs text-text-muted">
                      {tx.transDate ? formatRelativeTime(tx.transDate) : 'Reciente'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-text-muted text-sm">No hay transacciones recientes</div>
            )}
          </div>
        </div>

        {/* TopProducts (tienda) + CfType apilados */}
        <div className="space-y-2">
          <div className="bg-white rounded-sm border border-table-border p-2">
            <TopProductsChart
              data={allTransactions}
              topProducts={topProducts}
              loading={false}
              error={legacyError}
            />
          </div>
          <div className="bg-white rounded-sm border border-table-border p-2">
            <CfTypePieChart data={cfTypeData} loading={false} error={legacyError} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-sm p-3 border border-table-border">
        <span className="text-sm font-semibold text-text-primary block mb-2">Acciones Rápidas</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { title: 'Usuarios', icon: Users, color: 'blue', onClick: () => navigate('/dashboard/users') },
            { title: 'Transacciones', icon: CreditCard, color: 'green', onClick: () => navigate('/dashboard/transactions') },
            { title: 'Reportes', icon: BarChart3, color: 'purple', onClick: () => navigate('/dashboard/reports') },
          ].map((action) => (
            <button
              key={action.title}
              onClick={action.onClick}
              className={`p-2 text-left bg-${action.color}-50 hover:bg-${action.color}-100 rounded-sm border border-${action.color}-200 transition-colors`}
            >
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
