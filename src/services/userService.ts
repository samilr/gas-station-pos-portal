import { buildApiUrl } from "../config/api";
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from "./apiInterceptor";

interface UserResponse {
  successful: boolean;
  data: IUser[];
}

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
  active?: boolean;
  connected?: boolean;
  staftId?: number;
  siteId?: string;
  terminalId?: number;
  shift?: number;
  staftGroupId?: number;
}


export interface IUser{
  connected: number;
  user_id: string;
  username: string;
  name: string;
  staft_group_id: number;
  staft_group: string;
  created_by: string;
  password?: string;
  role_id: string;
  role: string;
  staft_id: string;
  site_id: string;
  terminal_id: number;
  created_at: Date;
  shift: number;
  active: number;
  portal_access: number;
  email: string;
  updated_password_at?: Date;
  last_time_logged?: Date;
}

// Normaliza campos camelCase de la API a snake_case interno
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

export const userService = {
  async getUsers(): Promise<UserResponse> {
    const response = await apiGet<any[]>(buildApiUrl('users'));
    return {
      successful: response.successful,
      data: (response.data || []).map(normalizeUser),
    };
  },

  async getUserByStaftId(staftId: string): Promise<ApiResponse<IUser>> {
    const response = await apiGet<any>(buildApiUrl(`users/staft/${staftId}`));
    return {
      ...response,
      data: response.data ? normalizeUser(response.data) : response.data,
    };
  },

  async logout(): Promise<void> {
    const response = await apiPost(buildApiUrl('auth/logout'));
    if (!response.successful) {
      console.warn('Error en logout:', response.error);
    }
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
  },

  async validateToken(): Promise<boolean> {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return false;

    const response = await apiGet(buildApiUrl('auth/validate'));
    return response.successful;
  },

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<IUser[]>> {
    return await apiPost<IUser[]>(buildApiUrl('users'), userData);
  },

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<IUser[]>> {
    return await apiPut<IUser[]>(buildApiUrl(`users/${userId}`), userData);
  },

  async deleteUser(userId: string): Promise<ApiResponse<IUser[]>> {
    return await apiDelete<IUser[]>(buildApiUrl(`users/${userId}`));
  }
};
