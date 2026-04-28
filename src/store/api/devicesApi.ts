import { api, unwrapArray } from './baseApi';
import { IHost } from '../../services/deviceService';

interface CreateHostRequest {
  name: string;
  description?: string;
  ipAddress?: string;
  siteId?: string;
  deviceId?: string;
  active: boolean;
  hostTypeId?: number;
}

interface UpdateHostRequest {
  name?: string;
  description?: string;
  ipAddress?: string;
  siteId?: string;
  deviceId?: string;
  active?: boolean;
  hostTypeId?: number;
}

export const devicesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listDevices: build.query<IHost[], void>({
      query: () => 'hosts',
      transformResponse: unwrapArray<IHost>,
      providesTags: (result) =>
        result
          ? [
              ...result.map((h) => ({ type: 'Device' as const, id: h.hostId })),
              { type: 'Device' as const, id: 'LIST' },
            ]
          : [{ type: 'Device' as const, id: 'LIST' }],
    }),

    createDevice: build.mutation<unknown, CreateHostRequest>({
      query: (body) => ({ url: 'hosts', method: 'POST', body }),
      invalidatesTags: [{ type: 'Device', id: 'LIST' }],
    }),

    updateDevice: build.mutation<unknown, { hostId: number; body: UpdateHostRequest }>({
      query: ({ hostId, body }) => ({ url: `hosts/${hostId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Device', id: arg.hostId },
        { type: 'Device', id: 'LIST' },
      ],
    }),

    deleteDevice: build.mutation<unknown, number>({
      query: (hostId) => ({ url: `hosts/${hostId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, hostId) => [
        { type: 'Device', id: hostId },
        { type: 'Device', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListDevicesQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
} = devicesApi;
