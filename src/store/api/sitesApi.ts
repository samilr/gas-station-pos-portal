import { api } from './baseApi';
import { ISite, ICreateSiteDto, IUpdateSiteDto } from '../../types/site';

/**
 * Mutations de sites via RTK Query. La lista de sites se gestiona en `siteSlice`
 * (es estado global del selector), no aquí. Después de cada mutation, el hook
 * `useSites` re-dispatcha `fetchSites()` para sincronizar la lista global.
 */
export const sitesApi = api.injectEndpoints({
  endpoints: (build) => ({
    createSite: build.mutation<ISite, ICreateSiteDto>({
      query: (body) => ({ url: 'sites', method: 'POST', body }),
      invalidatesTags: [{ type: 'Site', id: 'LIST' }],
    }),

    updateSite: build.mutation<ISite, { siteId: string; body: IUpdateSiteDto }>({
      query: ({ siteId, body }) => ({ url: `sites/${siteId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Site', id: arg.siteId },
        { type: 'Site', id: 'LIST' },
      ],
    }),

    deleteSite: build.mutation<boolean, string>({
      query: (siteId) => ({ url: `sites/${siteId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, siteId) => [
        { type: 'Site', id: siteId },
        { type: 'Site', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateSiteMutation,
  useUpdateSiteMutation,
  useDeleteSiteMutation,
} = sitesApi;
