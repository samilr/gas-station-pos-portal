import { api, unwrapArray } from './baseApi';
import {
  FuelIsland,
  CreateFuelIslandRequest,
  UpdateFuelIslandRequest,
} from '../../services/fuelIslandService';
import { Dispenser } from '../../services/dispensersConfigService';

type Filters = { siteId?: string };

const buildQuery = (filters?: Filters): string => {
  const qs = new URLSearchParams();
  if (filters?.siteId) qs.append('siteId', filters.siteId);
  const s = qs.toString();
  return s ? `?${s}` : '';
};

export const fuelIslandsApi = api.injectEndpoints({
  endpoints: (build) => ({
    listFuelIslands: build.query<FuelIsland[], Filters | void>({
      query: (filters) => `fuel-islands${buildQuery(filters || undefined)}`,
      transformResponse: unwrapArray<FuelIsland>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((f) => ({ type: 'FuelIsland' as const, id: f.fuelIslandId })),
              { type: 'FuelIsland' as const, id: 'LIST' },
            ]
          : [{ type: 'FuelIsland' as const, id: 'LIST' }],
    }),

    getUnassignedDispensers: build.query<Dispenser[], string | void>({
      query: (siteId) => `fuel-islands/unassigned-dispensers${siteId ? `?siteId=${siteId}` : ''}`,
      transformResponse: unwrapArray<Dispenser>,
      providesTags: [{ type: 'FuelIsland', id: 'UNASSIGNED' }],
    }),

    createFuelIsland: build.mutation<unknown, CreateFuelIslandRequest>({
      query: (body) => ({ url: 'fuel-islands', method: 'POST', body }),
      invalidatesTags: [
        { type: 'FuelIsland', id: 'LIST' },
        { type: 'FuelIsland', id: 'UNASSIGNED' },
      ],
    }),

    updateFuelIsland: build.mutation<unknown, { id: number; body: UpdateFuelIslandRequest }>({
      query: ({ id, body }) => ({ url: `fuel-islands/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'FuelIsland', id: arg.id },
        { type: 'FuelIsland', id: 'LIST' },
      ],
    }),

    deleteFuelIsland: build.mutation<unknown, number>({
      query: (id) => ({ url: `fuel-islands/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'FuelIsland', id },
        { type: 'FuelIsland', id: 'LIST' },
        { type: 'FuelIsland', id: 'UNASSIGNED' },
      ],
    }),

    assignDispensersToIsland: build.mutation<unknown, { id: number; dispenserIds: number[] }>({
      query: ({ id, dispenserIds }) => ({
        url: `fuel-islands/${id}/dispensers`,
        method: 'POST',
        body: { dispenserIds },
      }),
      invalidatesTags: [
        { type: 'FuelIsland', id: 'LIST' },
        { type: 'FuelIsland', id: 'UNASSIGNED' },
      ],
    }),

    unassignDispenserFromIsland: build.mutation<unknown, { islandId: number; dispenserId: number }>({
      query: ({ islandId, dispenserId }) => ({
        url: `fuel-islands/${islandId}/dispensers/${dispenserId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'FuelIsland', id: 'LIST' },
        { type: 'FuelIsland', id: 'UNASSIGNED' },
      ],
    }),
  }),
});

export const {
  useListFuelIslandsQuery,
  useGetUnassignedDispensersQuery,
  useCreateFuelIslandMutation,
  useUpdateFuelIslandMutation,
  useDeleteFuelIslandMutation,
  useAssignDispensersToIslandMutation,
  useUnassignDispenserFromIslandMutation,
} = fuelIslandsApi;
