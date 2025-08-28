import { useState, useEffect, useCallback } from 'react';
import { terminalService, ITerminal } from '../services/terminalService';

// Datos de prueba para terminales
const mockTerminals: ITerminal[] = [
  {
    site_id: 'SITE001',
    terminal_id: 1,
    name: 'Terminal Principal',
    terminal_type: 1,
    sector_id: 1,
    product_list: 1,
    use_customer_display: true,
    open_cash_drawer: true,
    print_device: 1,
    cash_fund: 1000.00,
    connected: true,
    last_connection_time: new Date('2024-01-15T10:30:00'),
    last_connection_hostname: 'PC-001',
    last_connection_username: 'usuario1',
    connected_time: new Date('2024-01-15T08:00:00'),
    connected_hostname: 'PC-001',
    connected_username: 'usuario1',
    connected_staft_id: 101,
    active: true,
    product_list_type: 1
  },
  {
    site_id: 'SITE001',
    terminal_id: 2,
    name: 'Terminal Secundaria',
    terminal_type: 2,
    sector_id: 2,
    product_list: 2,
    use_customer_display: false,
    open_cash_drawer: true,
    print_device: 2,
    cash_fund: 500.00,
    connected: false,
    last_connection_time: new Date('2024-01-14T16:45:00'),
    last_connection_hostname: 'PC-002',
    last_connection_username: 'usuario2',
    connected_time: undefined,
    connected_hostname: undefined,
    connected_username: undefined,
    connected_staft_id: undefined,
    active: true,
    product_list_type: 1
  },
  {
    site_id: 'SITE002',
    terminal_id: 1,
    name: 'Terminal Norte',
    terminal_type: 1,
    sector_id: 1,
    product_list: 1,
    use_customer_display: true,
    open_cash_drawer: true,
    print_device: 1,
    cash_fund: 750.00,
    connected: true,
    last_connection_time: new Date('2024-01-15T11:15:00'),
    last_connection_hostname: 'PC-003',
    last_connection_username: 'usuario3',
    connected_time: new Date('2024-01-15T09:00:00'),
    connected_hostname: 'PC-003',
    connected_username: 'usuario3',
    connected_staft_id: 103,
    active: true,
    product_list_type: 2
  },
  {
    site_id: 'SITE002',
    terminal_id: 2,
    name: 'Terminal Sur',
    terminal_type: 3,
    sector_id: 3,
    product_list: 3,
    use_customer_display: false,
    open_cash_drawer: false,
    print_device: 3,
    cash_fund: 300.00,
    connected: false,
    last_connection_time: undefined,
    last_connection_hostname: undefined,
    last_connection_username: undefined,
    connected_time: undefined,
    connected_hostname: undefined,
    connected_username: undefined,
    connected_staft_id: undefined,
    active: false,
    product_list_type: 1
  },
  {
    site_id: 'SITE003',
    terminal_id: 1,
    name: 'Terminal Express',
    terminal_type: 1,
    sector_id: 1,
    product_list: 1,
    use_customer_display: true,
    open_cash_drawer: true,
    print_device: 1,
    cash_fund: 1200.00,
    connected: true,
    last_connection_time: new Date('2024-01-15T12:00:00'),
    last_connection_hostname: 'PC-004',
    last_connection_username: 'usuario4',
    connected_time: new Date('2024-01-15T07:30:00'),
    connected_hostname: 'PC-004',
    connected_username: 'usuario4',
    connected_staft_id: 104,
    active: true,
    product_list_type: 1
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

