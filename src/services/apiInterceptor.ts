// Interceptor para agregar headers automáticamente a todas las peticiones
export interface ApiRequestConfig {
  method: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ApiResponse<T = any> {
  successful: boolean;
  data: T;
  error?: string;
}

// Función para verificar si es un endpoint de login
const isLoginEndpoint = (url: string): boolean => {
  const loginPatterns = [
    '/auth/login',
    '/login',
    '/api/auth/login',
    '/api/login'
  ];
  return loginPatterns.some(pattern => url.includes(pattern));
};

// Función para obtener el token de autenticación
const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || localStorage.getItem('authToken');
};

// Función para construir headers base
const buildHeaders = (url: string, customHeaders?: Record<string, string>): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders
  };

  // Agregar X-site-ID a todas las peticiones
  headers['X-site-ID'] = 'PORTAL';

  // Agregar Authorization solo si no es un endpoint de login
  if (!isLoginEndpoint(url)) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Función interceptor principal
export const apiRequest = async <T = any>(
  url: string, 
  config: ApiRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const headers = buildHeaders(url, config.headers);
    
    const response = await fetch(url, {
      method: config.method,
      headers,
      body: config.body
    });

    const data = await response.json();

    // Si la respuesta no es exitosa, devolver el error de la API
    if (!response.ok) {
      return {
        successful: false,
        data: null as T,
        error: data.error || data.message || `HTTP error! status: ${response.status}`
      };
    }

    // Si la API responde con successful: false, devolver el error
    if (data.successful === false) {
      return {
        successful: false,
        data: null as T,
        error: data.error || data.message || 'Error desconocido de la API'
      };
    }

    // Respuesta exitosa
    return {
      successful: true,
      data: data.data || data
    };
  } catch (error) {
    console.error(`Error in API request to ${url}:`, error);
    return {
      successful: false,
      data: null as T,
      error: error instanceof Error ? error.message : 'Error de conexión'
    };
  }
};

// Funciones helper para métodos HTTP específicos
export const apiGet = async <T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { method: 'GET', headers });
};

export const apiPost = async <T = any>(
  url: string, 
  body?: any, 
  headers?: Record<string, string>
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { 
    method: 'POST', 
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
};

export const apiPut = async <T = any>(
  url: string, 
  body?: any, 
  headers?: Record<string, string>
): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { 
    method: 'PUT', 
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
};

export const apiDelete = async <T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> => {
  return apiRequest<T>(url, { method: 'DELETE', headers });
};
