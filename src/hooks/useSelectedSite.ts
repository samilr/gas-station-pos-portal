import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { ALL_SITES } from '../store/slices/siteSlice';
import { ISite } from '../types/site';

/**
 * ID de sucursal para FILTROS de data. Retorna `null` cuando:
 *  - no hay sucursal seleccionada (no inicializado), o
 *  - el usuario eligió "TODAS" (ALL_SITES).
 * Los 20+ hooks de data interpretan `null` como "no filtrar por siteId".
 */
export const useSelectedSiteId = (): string | null => {
  const raw = useAppSelector((s) => s.site.selectedSiteId);
  if (!raw || raw === ALL_SITES) return null;
  return raw;
};

/**
 * Valor RAW del store — incluye el sentinel `ALL_SITES`.
 * Úsalo en el SiteSelector para distinguir "TODAS" de "no inicializado".
 */
export const useSelectedSiteIdRaw = (): string | null =>
  useAppSelector((s) => s.site.selectedSiteId);

export const useSelectedSite = (): ISite | null => {
  const selectedSiteId = useAppSelector((s) => s.site.selectedSiteId);
  const sites = useAppSelector((s) => s.site.sites);
  return useMemo(
    () => sites.find((s) => s.siteId === selectedSiteId) ?? null,
    [sites, selectedSiteId]
  );
};
