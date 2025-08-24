import { getApiBaseUrl } from './environment';

// Configuración global de la API
export const API_CONFIG = {
  // URL base de la API (se obtiene dinámicamente según el ambiente)
  get BASE_URL() {
    return getApiBaseUrl();
  },
  
  // Timeout para las peticiones (en milisegundos)
  TIMEOUT: 30000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints específicos
  ENDPOINTS: {
    TRANSACTIONS: '/trans',
    USERS: '/users',
    PRODUCTS: '/products',
    REPORTS: '/reports',
  },
  
  // Configuración de reintentos
  RETRY_CONFIG: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 segundo
  },
  
  // Configuración de caché
  CACHE_CONFIG: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5 minutos
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  // Asegurar que el endpoint comience con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
};

// Función helper para obtener headers con autenticación
export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers = { ...API_CONFIG.DEFAULT_HEADERS };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Función helper para manejar errores de API
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Error de respuesta del servidor
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;
    
    switch (status) {
      case 400:
        return `Error de validación: ${message || 'Datos incorrectos'}`;
      case 401:
        return 'No autorizado. Por favor, inicie sesión nuevamente.';
      case 403:
        return 'Acceso denegado. No tiene permisos para esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 500:
        return 'Error interno del servidor. Intente más tarde.';
      default:
        return `Error del servidor (${status}): ${message || 'Error desconocido'}`;
    }
  } else if (error.request) {
    // Error de red
    return 'Error de conexión. Verifique su conexión a internet.';
  } else {
    // Error de la aplicación
    return error.message || 'Error desconocido';
  }
};
