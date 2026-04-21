import { useState, useEffect, useCallback } from 'react';
import { siteService } from '../services/siteService';
import { ISite, ICreateSiteDto, IUpdateSiteDto } from '../types/site';

// Datos de prueba para sucursales
const mockSites: ISite[] = [
  {
    siteId: 'SITE001',
    name: 'Sucursal Principal',
    siteNumber: 1,
    countryId: 'DO',
    currencyId: 'DOP',
    phone: '+1-809-555-0101',
    email: 'principal@empresa.com',
    address1: 'Av. Principal 123',
    address2: 'Santo Domingo',
    storeId: 'STORE001',
    managerId: 101,
    headOffice: true,
    pos: true,
    useSector: true,
    productListType: 1,
    posLevelPrice: 1,
    posDeliveryTypes: 'PICKUP',
    posDeliveryType: true,
    posCashFund: 1000.00,
    posIsRestaurant: false,
    posUseTip: false,
    active: true,
    status: 1
  },
  {
    siteId: 'SITE002',
    name: 'Sucursal Norte',
    siteNumber: 2,
    countryId: 'DO',
    currencyId: 'DOP',
    phone: '+1-809-555-0102',
    email: 'norte@empresa.com',
    address1: 'Calle Norte 456',
    address2: 'Santiago',
    storeId: 'STORE002',
    managerId: 102,
    headOffice: false,
    pos: true,
    useSector: false,
    productListType: 0,
    posLevelPrice: 2,
    posDeliveryTypes: 'DELIVERY',
    posDeliveryType: true,
    posCashFund: 500.00,
    posIsRestaurant: true,
    posUseTip: true,
    active: true,
    status: 1
  },
  {
    siteId: 'SITE003',
    name: 'Sucursal Este',
    siteNumber: 3,
    countryId: 'DO',
    currencyId: 'DOP',
    phone: '+1-809-555-0103',
    email: 'este@empresa.com',
    address1: 'Av. Este 789',
    address2: 'La Romana',
    storeId: 'STORE003',
    managerId: 103,
    headOffice: false,
    pos: false,
    useSector: true,
    productListType: 1,
    posLevelPrice: 1,
    posDeliveryTypes: 'PICKUP',
    posDeliveryType: false,
    posCashFund: 750.00,
    posIsRestaurant: false,
    posUseTip: false,
    active: false,
    status: 0
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
