import { useState, useEffect, useCallback } from 'react';
import { logService } from '../services/logService';
import { IActionLog, IErrorLog } from '../types/logs';

// Datos de prueba para logs de acciones
const mockActionLogs: IActionLog[] = [
  {
    actionId: 1,
    staft_id: 101,
    site_id: 'SITE001',
    action: 'LOGIN',
    description: 'Usuario inició sesión exitosamente',
    ip_address: '192.168.1.100',
    device_id: 'DEV001',
    terminal_id: 1,
    latitude: '18.4861',
    longitude: '-69.9312',
    created_at: new Date('2024-01-15T14:30:00Z') // UTC, se mostrará como 10:30 hora local
  },
  {
    actionId: 2,
    staft_id: 102,
    site_id: 'SITE001',
    action: 'SALE_CREATED',
    description: 'Nueva venta creada - Terminal 1',
    ip_address: '192.168.1.101',
    device_id: 'DEV002',
    terminal_id: 1,
    latitude: '18.4861',
    longitude: '-69.9312',
    created_at: new Date('2024-01-15T14:25:00Z') // UTC, se mostrará como 10:25 hora local
  },
  {
    actionId: 3,
    staft_id: 103,
    site_id: 'SITE002',
    action: 'USER_CREATED',
    description: 'Nuevo usuario creado: vendedor2',
    ip_address: '192.168.1.102',
    device_id: 'DEV003',
    terminal_id: 2,
    latitude: '18.4861',
    longitude: '-69.9312',
    created_at: new Date('2024-01-15T14:20:00Z') // UTC, se mostrará como 10:20 hora local
  },
  {
    actionId: 4,
    staft_id: 101,
    site_id: 'SITE001',
    action: 'LOGIN_FAILED',
    description: 'Intento de inicio de sesión fallido',
    ip_address: '192.168.1.100',
    device_id: 'DEV001',
    terminal_id: 1,
    latitude: '18.4861',
    longitude: '-69.9312',
    created_at: new Date('2024-01-15T14:15:00Z') // UTC, se mostrará como 10:15 hora local
  },
  {
    actionId: 5,
    staft_id: 102,
    site_id: 'SITE001',
    action: 'PRODUCT_UPDATED',
    description: 'Producto actualizado: Gasolina Premium',
    ip_address: '192.168.1.101',
    device_id: 'DEV002',
    terminal_id: 1,
    latitude: '18.4861',
    longitude: '-69.9312',
    created_at: new Date('2024-01-15T14:10:00Z') // UTC, se mostrará como 10:10 hora local
  }
];

// Datos de prueba para logs de errores
const mockErrorLogs: IErrorLog[] = [
  {
    error_id: 1,
    staft_id: 101,
    site_id: 'SITE001',
    error_code: 'AUTH_001',
    message: 'Token de autenticación expirado',
    stacktrace: 'Error: Token expired at AuthMiddleware.verifyToken',
    context: 'Authentication middleware',
    device_id: 'DEV001',
    terminal_id: 1,
    latitude: '18.4861',
    longitude: '-69.9312',
    created_at: new Date('2024-01-15T14:30:00Z'), // UTC, se mostrará como 10:30 hora local
    ip_address: '192.168.1.100'
  },
  {
    error_id: 2,
    staft_id: 102,
    site_id: 'SITE001',
    error_code: 'DB_002',
    message: 'Error de conexión a la base de datos',
    stacktrace: 'Error: Connection timeout at Database.connect',
    context: 'Database connection',
    device_id: 'DEV002',
    terminal_id: 1,
    latitude: '18.4861',
    longitude: '-69.9312',
    created_at: new Date('2024-01-15T14:25:00Z'), // UTC, se mostrará como 10:25 hora local
    ip_address: '192.168.1.101'
  },
  {
    error_id: 3,
    staft_id: 103,
    site_id: 'SITE002',
    error_code: 'API_003',
    message: 'Parámetros inválidos en la solicitud',
    stacktrace: 'Error: Invalid parameters at ValidationMiddleware.validate',
    context: 'API validation',
    device_id: 'DEV003',
    terminal_id: 2,
    latitude: '18.4861',
    longitude: '-69.9312',
    created_at: new Date('2024-01-15T10:20:00'),
    ip_address: '192.168.1.102'
  },
  {
    error_id: 4,
    staft_id: 104,
    site_id: 'SITE002',
    error_code: 'SYS_004',
    message: 'Error interno del servidor',
    stacktrace: 'Error: Internal server error at ErrorHandler.handleError',
    context: 'System error',
    device_id: 'DEV004',
    terminal_id: 2,
    latitude: '18.4861',
    longitude: '-69.9312',
    created_at: new Date('2024-01-15T10:15:00'),
    ip_address: '192.168.1.103'
  },
  {
    error_id: 5,
    staft_id: 105,
    site_id: 'SITE003',
    error_code: 'AUTH_005',
    message: 'Usuario no autorizado para esta acción',
    stacktrace: 'Error: Unauthorized at AuthMiddleware.checkPermission',
    context: 'Authorization check',
    device_id: 'DEV005',
    terminal_id: 3,
    latitude: '18.4861',
    longitude: '-69.9312',
    created_at: new Date('2024-01-15T10:10:00'),
    ip_address: '192.168.1.104'
  }
];

export const useActionLogs = () => {
  const [actionLogs, setActionLogs] = useState<IActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  const loadActionLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await logService.getActionLogs({
        startDate: startDateFilter,
        endDate: endDateFilter
      });
      if (response.successful) {
        setActionLogs(response.data || []);
      } else {
        setError('Error al cargar logs de acciones');
      }
    } catch (err) {
      // Si hay error de conexión, usar datos de prueba
      console.warn('Error cargando logs de acciones, usando datos de prueba:', err);
      setActionLogs(mockActionLogs);
      setError('Usando datos de prueba - Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  }, [startDateFilter, endDateFilter]);

  const refreshActionLogs = useCallback(async () => {
    await loadActionLogs();
  }, [loadActionLogs]);

  const loadActionLogsWithDates = useCallback(async (startDate: string, endDate: string) => {
    setStartDateFilter(startDate);
    setEndDateFilter(endDate);
  }, []);

  useEffect(() => {
    loadActionLogs();
  }, [loadActionLogs]);

  return {
    actionLogs,
    loading,
    error,
    startDateFilter,
    endDateFilter,
    setStartDateFilter,
    setEndDateFilter,
    refreshActionLogs,
    loadActionLogsWithDates
  };
};

export const useErrorLogs = () => {
  const [errorLogs, setErrorLogs] = useState<IErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  const loadErrorLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await logService.getErrorLogs({
        startDate: startDateFilter,
        endDate: endDateFilter
      });
      if (response.successful) {
        setErrorLogs(response.data || []);
      } else {
        setError('Error al cargar logs de errores');
      }
    } catch (err) {
      // Si hay error de conexión, usar datos de prueba
      console.warn('Error cargando logs de errores, usando datos de prueba:', err);
      setErrorLogs(mockErrorLogs);
      setError('Usando datos de prueba - Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  }, [startDateFilter, endDateFilter]);

  const refreshErrorLogs = useCallback(async () => {
    await loadErrorLogs();
  }, [loadErrorLogs]);

  const loadErrorLogsWithDates = useCallback(async (startDate: string, endDate: string) => {
    setStartDateFilter(startDate);
    setEndDateFilter(endDate);
  }, []);

  const resolveError = useCallback(async (errorId: string, resolvedBy: string) => {
    try {
      const response = await logService.resolveError(errorId, resolvedBy);
      if (response.successful) {
        // Actualizar el estado local
        setErrorLogs(prev => prev.map(log => 
          log.error_id.toString() === errorId 
            ? { ...log, resolved: true, resolved_by: resolvedBy, resolved_at: new Date() }
            : log
        ));
        return true;
      } else {
        setError('Error al marcar como resuelto');
        return false;
      }
    } catch (err) {
      setError('Error al marcar como resuelto');
      return false;
    }
  }, []);

  useEffect(() => {
    loadErrorLogs();
  }, [loadErrorLogs]);

  return {
    errorLogs,
    loading,
    error,
    startDateFilter,
    endDateFilter,
    setStartDateFilter,
    setEndDateFilter,
    refreshErrorLogs,
    loadErrorLogsWithDates,
    resolveError
  };
};
