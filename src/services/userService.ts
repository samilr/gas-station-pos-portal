import { buildApiUrl } from "../config/api";

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

const API_BASE_URL = buildApiUrl(''); 

export const userService = {
  async getUsers(): Promise<UserResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UserResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
    }
  },

  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error validando token:', error);
      return false;
    }
  },

  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UserResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  },

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<UserResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UserResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  },

  async deleteUser(userId: string): Promise<UserResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UserResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }
};
