import { useEffect } from 'react';
import { ICreateSiteDto, IUpdateSiteDto } from '../types/site';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSites } from '../store/slices/siteSlice';
import {
  useCreateSiteMutation,
  useUpdateSiteMutation,
  useDeleteSiteMutation,
} from '../store/api/sitesApi';
import { getErrorMessage } from '../store/api/baseApi';

/**
 * La lista de sites vive en `siteSlice` (es estado global compartido con el
 * selector del header). Este hook orquesta fetch + mutations.
 */
export const useSites = () => {
  const dispatch = useAppDispatch();
  const { sites, loading, error } = useAppSelector((s) => s.site);

  const [createMut] = useCreateSiteMutation();
  const [updateMut] = useUpdateSiteMutation();
  const [deleteMut] = useDeleteSiteMutation();

  useEffect(() => {
    if (sites.length === 0 && !loading) {
      dispatch(fetchSites());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshSites = async () => {
    await dispatch(fetchSites()).unwrap();
  };

  const createSite = async (siteData: ICreateSiteDto) => {
    try {
      await createMut(siteData).unwrap();
      await dispatch(fetchSites());
      return { successful: true };
    } catch (err) {
      return { successful: false, message: getErrorMessage(err, 'Error al crear sucursal') ?? undefined };
    }
  };

  const updateSite = async (siteId: string, siteData: IUpdateSiteDto) => {
    try {
      await updateMut({ siteId, body: siteData }).unwrap();
      await dispatch(fetchSites());
      return { successful: true };
    } catch (err) {
      return { successful: false, message: getErrorMessage(err, 'Error al actualizar sucursal') ?? undefined };
    }
  };

  const deleteSite = async (siteId: string) => {
    try {
      await deleteMut(siteId).unwrap();
      await dispatch(fetchSites());
      return { successful: true };
    } catch (err) {
      return { successful: false, message: getErrorMessage(err, 'Error al eliminar sucursal') ?? undefined };
    }
  };

  return {
    sites,
    loading,
    error,
    refreshSites,
    createSite,
    updateSite,
    deleteSite,
  };
};
