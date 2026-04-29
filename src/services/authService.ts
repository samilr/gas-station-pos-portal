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
  },

  async forgotPassword(email: string): Promise<{ successful: boolean; message?: string; error?: string }> {
    try {
      const response = await apiPost<{ successful: boolean; message: string }>(
        buildApiUrl('auth/forgot-password'),
        { email }
      );
      return {
        successful: response.successful,
        message: response.data?.message,
        error: response.error,
      };
    } catch (error) {
      return { successful: false, error: 'Error de conexión. Intenta nuevamente.' };
    }
  },

  async validateOtp(email: string, code: string): Promise<{ successful: boolean; error?: string }> {
    try {
      const response = await apiPost<{ successful: boolean; message: string }>(
        buildApiUrl('auth/validate-otp'),
        { email, code }
      );
      return {
        successful: response.successful,
        error: response.successful ? undefined : (response.error || 'Código OTP inválido.'),
      };
    } catch (error) {
      return { successful: false, error: 'Error de conexión. Intenta nuevamente.' };
    }
  },

  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ successful: boolean; error?: string }> {
    try {
      const response = await apiPost(
        buildApiUrl('auth/reset-password'),
        { email, code, newPassword }
      );
      return {
        successful: response.successful,
        error: response.successful ? undefined : (response.error || 'No se pudo restablecer la contraseña.'),
      };
    } catch (error) {
      return { successful: false, error: 'Error de conexión. Intenta nuevamente.' };
    }
  },
};
