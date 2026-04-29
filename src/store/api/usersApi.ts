import { api } from './baseApi';
import { IUser } from '../../services/userService';

interface CreateUserRequest {
  username: string;
  name: string;
  email?: string;
  password: string;
  roleId: number;
  portalAccess: boolean;
  staftId: number;
  siteId: string;
  terminalId: number;
  shift: number;
  staftGroupId: number;
}

interface UpdateUserRequest {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  roleId?: number;
  portalAccess?: boolean;
  active?: 0 | 1;
  staftId?: number;
  siteId?: string;
  terminalId?: number;
  shift?: number;
  staftGroupId?: number;
}

const normalizeUser = (raw: any): IUser => ({
  ...raw,
  user_id: raw.user_id ?? raw.userId,
  staft_id: raw.staft_id ?? (raw.staftId != null ? String(raw.staftId) : ''),
  staft_group: raw.staft_group ?? raw.staftGroup,
  staft_group_id: raw.staft_group_id ?? raw.staftGroupId,
  site_id: raw.site_id ?? raw.siteId,
  terminal_id: raw.terminal_id ?? raw.terminalId,
  created_at: raw.created_at ?? raw.createdAt,
  created_by: raw.created_by ?? raw.createdBy,
  portal_access: raw.portal_access ?? (raw.portalAccess ? 1 : 0),
  role_id: raw.role_id ?? raw.roleId,
  updated_password_at: raw.updated_password_at ?? raw.updatedPasswordAt,
  last_time_logged: raw.last_time_logged ?? raw.lastTimeLogged,
});

const extractUserList = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: unknown[] }).data;
  }
  return [];
};

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<IUser[], void>({
      query: () => 'users',
      transformResponse: (response: unknown) => extractUserList(response).map(normalizeUser),
      providesTags: (result) =>
        result
          ? [
              ...result.map((u) => ({ type: 'User' as const, id: u.user_id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),

    getUserByStaftId: build.query<IUser | null, string>({
      query: (staftId) => `users/staft/${staftId}`,
      transformResponse: (response: unknown) => {
        if (!response) return null;
        const nested = (response as { data?: unknown }).data;
        const raw = nested ?? response;
        return raw ? normalizeUser(raw) : null;
      },
      providesTags: (_r, _e, staftId) => [{ type: 'User', id: `STAFT-${staftId}` }],
    }),

    createUser: build.mutation<unknown, CreateUserRequest>({
      query: (body) => ({ url: 'users', method: 'POST', body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: build.mutation<unknown, { userId: string; body: UpdateUserRequest }>({
      query: ({ userId, body }) => ({ url: `users/${userId}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'User', id: arg.userId },
        { type: 'User', id: 'LIST' },
      ],
    }),

    deleteUser: build.mutation<unknown, string>({
      query: (userId) => ({ url: `users/${userId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListUsersQuery,
  useGetUserByStaftIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
