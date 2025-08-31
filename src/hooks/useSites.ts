import { useState, useEffect, useCallback } from 'react';
import { siteService } from '../services/siteService';
import { ISite, ICreateSiteDto, IUpdateSiteDto } from '../types/site';

// Datos de prueba para sucursales
const mockSites: ISite[] = [
  {
    site_id: 'SITE001',
    name: 'Sucursal Principal',
    site_number: 1,
    country_id: 'DO',
    currency_id: 'DOP',
    phone: '+1-809-555-0101',
    email: 'principal@empresa.com',
    address1: 'Av. Principal 123',
    address2: 'Santo Domingo',
    store_id: 'STORE001',
    manager_id: 101,
    head_office: true,
    pos: true,
    use_sector: true,
    product_list_type: true,
    pos_level_price: 1,
    pos_delivery_types: 'PICKUP',
    pos_delivery_type: true,
    pos_cash_fund: 1000.00,
    pos_is_restaurant: false,
    pos_use_tip: false,
    active: true,
    status: true
  },
  {
    site_id: 'SITE002',
    name: 'Sucursal Norte',
    site_number: 2,
    country_id: 'DO',
    currency_id: 'DOP',
    phone: '+1-809-555-0102',
    email: 'norte@empresa.com',
    address1: 'Calle Norte 456',
    address2: 'Santiago',
    store_id: 'STORE002',
    manager_id: 102,
    head_office: false,
    pos: true,
    use_sector: false,
    product_list_type: false,
    pos_level_price: 2,
    pos_delivery_types: 'DELIVERY',
    pos_delivery_type: true,
    pos_cash_fund: 500.00,
    pos_is_restaurant: true,
    pos_use_tip: true,
    active: true,
    status: true
  },
  {
    site_id: 'SITE003',
    name: 'Sucursal Este',
    site_number: 3,
    country_id: 'DO',
    currency_id: 'DOP',
    phone: '+1-809-555-0103',
    email: 'este@empresa.com',
    address1: 'Av. Este 789',
    address2: 'La Romana',
    store_id: 'STORE003',
    manager_id: 103,
    head_office: false,
    pos: false,
    use_sector: true,
    product_list_type: true,
    pos_level_price: 1,
    pos_delivery_types: 'PICKUP',
    pos_delivery_type: false,
    pos_cash_fund: 750.00,
    pos_is_restaurant: false,
    pos_use_tip: false,
    active: false,
    status: false
  }
];

export const useSites = () => {
  const [sites, setSites] = useState<ISite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await siteService.getAllSites();
      if (response.successful) {
        setSites(response.data || []);
      } else {
        setError('Error al cargar sucursales');
      }
    } catch (err) {
      // Si hay error de conexión, usar datos de prueba
      console.warn('Error cargando sucursales, usando datos de prueba:', err);
      setSites(mockSites);
      setError('Usando datos de prueba - Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSites = useCallback(async () => {
    await loadSites();
  }, [loadSites]);

  const createSite = useCallback(async (siteData: ICreateSiteDto) => {
    try {
      const response = await siteService.createSite(siteData);
      if (response.successful) {
        await loadSites(); // Recargar la lista
        return { successful: true };
      } else {
        return { successful: false, message: response.error };
      }
    } catch (err) {
      return { successful: false, message: 'Error al crear sucursal' };
    }
  }, [loadSites]);

  const updateSite = useCallback(async (siteId: string, siteData: IUpdateSiteDto) => {
    try {
      const response = await siteService.updateSite(siteId, siteData);
      if (response.successful) {
        await loadSites(); // Recargar la lista
        return { successful: true };
      } else {
        return { successful: false, message: response.error };
      }
    } catch (err) {
      return { successful: false, message: 'Error al actualizar sucursal' };
    }
  }, [loadSites]);

  const deleteSite = useCallback(async (siteId: string) => {
    try {
      const response = await siteService.deleteSite(siteId);
      if (response.successful) {
        await loadSites(); // Recargar la lista
        return { successful: true };
      } else {
        return { successful: false, message: response.error };
      }
    } catch (err) {
      return { successful: false, message: 'Error al eliminar sucursal' };
    }
  }, [loadSites]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  return {
    sites,
    loading,
    error,
    refreshSites,
    createSite,
    updateSite,
    deleteSite
  };
};
