import { buildApiUrl } from "../config/api";
import { apiPost, apiGet } from "./apiInterceptor";

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

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiPost<LoginResponse['data']>(
        buildApiUrl('auth/login'),
        credentials
      );

      if (!response.successful) {
        throw new Error(response.error || 'Error en login');
      }

      return {
        successful: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const response = await apiPost(buildApiUrl('auth/logout'));
      
      if (!response.successful) {
        console.warn('Error en logout:', response.error);
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('adminUser');
    }
  },

  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) return false;

      const response = await apiGet(buildApiUrl('auth/validate'));
      return response.successful;
    } catch (error) {
      console.error('Error validando token:', error);
      return false;
    }
  }
};
