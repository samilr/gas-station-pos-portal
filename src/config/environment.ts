// Configuración de entorno
export const ENV_CONFIG = {
  // Ambiente actual - usar VITE_MODE personalizado o fallback a MODE
  NODE_ENV: import.meta.env.VITE_MODE || import.meta.env.MODE || 'development',
  
  // Verificar si estamos en desarrollo
  IS_DEV: (import.meta.env.VITE_MODE || import.meta.env.MODE) === 'development',
  
  // Verificar si estamos en producción
  IS_PROD: (import.meta.env.VITE_MODE || import.meta.env.MODE) === 'production',
  
  // Verificar si estamos en testing
  IS_TEST: (import.meta.env.VITE_MODE || import.meta.env.MODE) === 'test',
  
  // Configuración específica por ambiente
  DEVELOPMENT: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.125.23:5000/api',
    LOG_LEVEL: 'debug',
    ENABLE_MOCK_DATA: true,
  },
  
  PRODUCTION: {
    API_BASE_URL: 'https://gas-station-managment.azurewebsites.net/api',
    LOG_LEVEL: 'error',
    ENABLE_MOCK_DATA: false,
  },
  
  TEST: {
    API_BASE_URL: 'http://localhost:5274/api',
    LOG_LEVEL: 'warn',
    ENABLE_MOCK_DATA: true,
  }
};

// Función para obtener la configuración del ambiente actual
export const getCurrentEnvConfig = () => {
  switch (ENV_CONFIG.NODE_ENV) {
    case 'development':
      return ENV_CONFIG.DEVELOPMENT;
    case 'production':
      return ENV_CONFIG.PRODUCTION;
    case 'test':
      return ENV_CONFIG.TEST;
    default:
      return ENV_CONFIG.DEVELOPMENT;
  }
};

// Función para obtener la URL base de la API según el ambiente
export const getApiBaseUrl = (): string => {
  const envConfig = getCurrentEnvConfig();
  return envConfig.API_BASE_URL;
};

// Función para verificar si se deben usar datos mock
export const shouldUseMockData = (): boolean => {
  const envConfig = getCurrentEnvConfig();
  return envConfig.ENABLE_MOCK_DATA;
};

// Función para obtener el nivel de logging
export const getLogLevel = (): string => {
  const envConfig = getCurrentEnvConfig();
  return envConfig.LOG_LEVEL;
};
