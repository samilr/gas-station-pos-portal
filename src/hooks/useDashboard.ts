import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { transactionService } from '../services/transactionService';
import { logService } from '../services/logService';
import { siteService } from '../services/siteService';
import { terminalService } from '../services/terminalService';
import { hostService } from '../services/deviceService';
import { getCurrentSantoDomingoDate } from '../utils/transactionUtils';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalSales: number;
  totalSites: number;
  activeSites: number;
  totalTerminals: number;
  activeTerminals: number;
  totalDevices: number;
  activeDevices: number;
  totalActions: number;
  totalErrors: number;
  recentTransactions: any[];
  recentActions: any[];
  recentErrors: any[];
  loading: boolean;
  error: string | null;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalSales: 0,
    totalSites: 0,
    activeSites: 0,
    totalTerminals: 0,
    activeTerminals: 0,
    totalDevices: 0,
    activeDevices: 0,
    totalActions: 0,
    totalErrors: 0,
    recentTransactions: [],
    recentActions: [],
    recentErrors: [],
    loading: true,
    error: null
  });

  const loadDashboardData = async () => {
    setStats(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Obtener fecha de hoy en zona horaria de Santo Domingo
      const todayDate = getCurrentSantoDomingoDate();
      // Cargar datos en paralelo
      const [
        usersResponse,
        transactionsResponse,
        actionLogsResponse,
        errorLogsResponse,
        sitesResponse,
        terminalsResponse,
        devicesResponse
      ] = await Promise.allSettled([
        userService.getUsers(),
        transactionService.getTransactions({
          startDate: todayDate,
          endDate: todayDate
        }),
        logService.getActionLogs(),
        logService.getErrorLogs(),
        siteService.getAllSites(),
        terminalService.getTerminals(),
        hostService.getHosts()
      ]);

      // Procesar usuarios
      let totalUsers = 0;
      let activeUsers = 0;
      if (usersResponse.status === 'fulfilled' && usersResponse.value.successful) {
        const users = usersResponse.value.data || [];
        totalUsers = users.length;
        activeUsers = users.filter(user => user.active === 1).length;
      }

      // Procesar transacciones
      let totalTransactions = 0;
      let totalSales = 0;
      let recentTransactions: any[] = [];
      if (transactionsResponse.status === 'fulfilled') {
        const transactions = transactionsResponse.value || [];
        totalTransactions = transactions.length;
        totalSales = transactions.reduce((sum, trans) => sum + (trans.total || 0), 0);
        // Ordenar por fecha más reciente y tomar las últimas 5
        recentTransactions = transactions
          .sort((a, b) => new Date(b.transDate || 0).getTime() - new Date(a.transDate || 0).getTime())
          .slice(0, 5);
      }

      // Procesar logs de acciones
      let totalActions = 0;
      let recentActions: any[] = [];
      if (actionLogsResponse.status === 'fulfilled' && actionLogsResponse.value.successful) {
        const actions = actionLogsResponse.value.data || [];
        totalActions = actions.length;
        // Ordenar por fecha más reciente y tomar las últimas 5
        recentActions = actions
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 5);
      }

      // Procesar logs de errores
      let totalErrors = 0;
      let recentErrors: any[] = [];
      if (errorLogsResponse.status === 'fulfilled' && errorLogsResponse.value.successful) {
        const errors = errorLogsResponse.value.data || [];
        totalErrors = errors.length;
        // Ordenar por fecha más reciente y tomar los últimos 5
        recentErrors = errors
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 5);
      }

      // Procesar sitios
      let totalSites = 0;
      let activeSites = 0;
      if (sitesResponse.status === 'fulfilled' && sitesResponse.value.successful) {
        const sites = sitesResponse.value.data || [];
        totalSites = sites.length;
        activeSites = sites.filter(site => site.active).length;
      }

      // Procesar terminales
      let totalTerminals = 0;
      let activeTerminals = 0;
      if (terminalsResponse.status === 'fulfilled' && terminalsResponse.value.successful) {
        const terminals = terminalsResponse.value.data || [];
        totalTerminals = terminals.length;
        activeTerminals = terminals.filter(terminal => terminal.active).length;
      }

      // Procesar dispositivos
      let totalDevices = 0;
      let activeDevices = 0;
      if (devicesResponse.status === 'fulfilled' && devicesResponse.value.successful) {
        const devices = devicesResponse.value.data || [];
        totalDevices = devices.length;
        activeDevices = devices.filter(device => device.active).length;
      }

      setStats({
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
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Error al cargar los datos del dashboard'
      }));
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    ...stats,
    refresh: loadDashboardData
  };
};
