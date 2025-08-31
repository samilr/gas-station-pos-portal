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
  staftId?: number;
  siteId?: string;
  terminalId?: number;
  shift?: number;
  staftGroupId?: number;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export interface IUser{
  user_id: string,
  username: string,
  name: string,
  staft_group_id: number,
  staft_group: string,
  created_by: string,
  password?: string,
  created_at: Date,
  role_id: string,
  role: string,
  staft_id: string,
  site_id: string,
  terminal_id: number,
  shift: number,
  active: number,  
  portal_access: boolean,
  email: string,
}

export const userService = {
  async getUsers(): Promise<UserResponse> {
    const response = await apiGet<IUser[]>(buildApiUrl('users'));
    return {
      successful: response.successful,
      data: response.data || []
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
