import { useState, useEffect, useCallback } from 'react';
import { terminalService, ITerminal } from '../services/terminalService';

// Datos de prueba para terminales
const mockTerminals: ITerminal[] = [
  {
    siteId: 'SITE001',
    terminalId: 1,
    name: 'Terminal Principal',
    terminalType: 1,
    sectorId: 1,
    productList: 1,
    useCustomerDisplay: true,
    openCashDrawer: true,
    printDevice: 1,
    cashFund: 1000.00,
    connected: true,
    lastConnectionTime: new Date('2024-01-15T10:30:00'),
    lastConnectionHostname: 'PC-001',
    lastConnectionUsername: 'usuario1',
    connectedTime: new Date('2024-01-15T08:00:00'),
    connectedHostname: 'PC-001',
    connectedUsername: 'usuario1',
    connectedStaftId: 101,
    active: true,
    productListType: 1,
    fuelIslandId: null,
    fuelIslandEnabled: false,
  },
  {
    siteId: 'SITE001',
    terminalId: 2,
    name: 'Terminal Secundaria',
    terminalType: 2,
    sectorId: 2,
    productList: 2,
    useCustomerDisplay: false,
    openCashDrawer: true,
    printDevice: 2,
    cashFund: 500.00,
    connected: false,
    lastConnectionTime: new Date('2024-01-14T16:45:00'),
    lastConnectionHostname: 'PC-002',
    lastConnectionUsername: 'usuario2',
    connectedTime: undefined,
    connectedHostname: undefined,
    connectedUsername: undefined,
    connectedStaftId: undefined,
    active: true,
    productListType: 1,
    fuelIslandId: null,
    fuelIslandEnabled: false,
  },
  {
    siteId: 'SITE002',
    terminalId: 1,
    name: 'Terminal Norte',
    terminalType: 1,
    sectorId: 1,
    productList: 1,
    useCustomerDisplay: true,
    openCashDrawer: true,
    printDevice: 1,
    cashFund: 750.00,
    connected: true,
    lastConnectionTime: new Date('2024-01-15T11:15:00'),
    lastConnectionHostname: 'PC-003',
    lastConnectionUsername: 'usuario3',
    connectedTime: new Date('2024-01-15T09:00:00'),
    connectedHostname: 'PC-003',
    connectedUsername: 'usuario3',
    connectedStaftId: 103,
    active: true,
    productListType: 2,
    fuelIslandId: null,
    fuelIslandEnabled: false,
  },
  {
    siteId: 'SITE002',
    terminalId: 2,
    name: 'Terminal Sur',
    terminalType: 3,
    sectorId: 3,
    productList: 3,
    useCustomerDisplay: false,
    openCashDrawer: false,
    printDevice: 3,
    cashFund: 300.00,
    connected: false,
    lastConnectionTime: undefined,
    lastConnectionHostname: undefined,
    lastConnectionUsername: undefined,
    connectedTime: undefined,
    connectedHostname: undefined,
    connectedUsername: undefined,
    connectedStaftId: undefined,
    active: false,
    productListType: 1,
    fuelIslandId: null,
    fuelIslandEnabled: false,
  },
  {
    siteId: 'SITE003',
    terminalId: 1,
    name: 'Terminal Express',
    terminalType: 1,
    sectorId: 1,
    productList: 1,
    useCustomerDisplay: true,
    openCashDrawer: true,
    printDevice: 1,
    cashFund: 1200.00,
    connected: true,
    lastConnectionTime: new Date('2024-01-15T12:00:00'),
    lastConnectionHostname: 'PC-004',
    lastConnectionUsername: 'usuario4',
    connectedTime: new Date('2024-01-15T07:30:00'),
    connectedHostname: 'PC-004',
    connectedUsername: 'usuario4',
    connectedStaftId: 104,
    active: true,
    productListType: 1,
    fuelIslandId: null,
    fuelIslandEnabled: false,
  }
];

export const useTerminals = () => {
  const [terminals, setTerminals] = useState<ITerminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTerminals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await terminalService.getTerminals();
      if (response.successful) {
        setTerminals(response.data || []);
      } else {
        setError('Error al cargar terminales');
      }
    } catch (err) {
      // Si hay error de conexión, usar datos de prueba
      console.warn('Error cargando terminales, usando datos de prueba:', err);
      setTerminals(mockTerminals);
      setError('Usando datos de prueba - Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTerminals = useCallback(async () => {
    await loadTerminals();
  }, [loadTerminals]);

  useEffect(() => {
    loadTerminals();
  }, [loadTerminals]);

  return {
    terminals,
    loading,
    error,
    refreshTerminals
  };
};
