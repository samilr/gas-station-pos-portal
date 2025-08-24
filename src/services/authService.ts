import { buildApiUrl } from "../config/api";

interface LoginResponse {
  successful: boolean;
  data: {
    user: string;
    staftId: string;
    shift: string;
    role: string;
    terminal: string;
    site: string;
    staftGroup: string;
    accessToken: string;
    expiresIn: Date | null;
  };
}

interface LoginCredentials {
  username: string;
  password: string;
}

const API_BASE_URL = buildApiUrl(''); 

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error en login:', error);
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
  }
};
