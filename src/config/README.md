# Configuración de la API

Este directorio contiene la configuración global de la aplicación, incluyendo la configuración de la API.

## Archivos de configuración

### `api.ts`
Configuración principal de la API con:
- URL base de la API
- Headers por defecto
- Timeout y reintentos
- Endpoints específicos
- Funciones helper para manejo de errores

### `environment.ts`
Configuración específica por ambiente:
- Desarrollo: `http://localhost:3000/api`
- Producción: `https://isladominicana-pos-mobile-api.azurewebsites.net/api`
- Testing: `http://localhost:3000/api`

## Uso

### Importar la configuración
```typescript
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api';
import { getApiBaseUrl, shouldUseMockData } from '../config/environment';
```

### Construir URLs de la API
```typescript
// Construir URL completa
const url = buildApiUrl('/trans'); // https://isladominicana-pos-mobile-api.azurewebsites.net/api/trans

// Obtener URL base
const baseUrl = getApiBaseUrl();
```

### Obtener headers con autenticación
```typescript
const token = localStorage.getItem('authToken');
const headers = getAuthHeaders(token);
```

### Manejar errores de la API
```typescript
try {
  // ... código de la API
} catch (error) {
  const errorMessage = handleApiError(error);
  console.error(errorMessage);
}
```

## Variables de entorno

Copia el archivo `env.example` a `.env` en la raíz del proyecto:

```bash
cp env.example .env
```

### Variables disponibles
- `NODE_ENV`: Ambiente (development, production, test)
- `VITE_API_BASE_URL`: URL base de la API (opcional)
- `VITE_ENABLE_MOCK_DATA`: Habilitar datos mock en desarrollo
- `VITE_LOG_LEVEL`: Nivel de logging
- `VITE_API_TIMEOUT`: Timeout de la API en milisegundos
- `VITE_API_MAX_RETRIES`: Número máximo de reintentos

## Configuración por defecto

### Desarrollo
- URL: `http://localhost:3000/api`
- Mock data: Habilitado
- Log level: Debug

### Producción
- URL: `https://isladominicana-pos-mobile-api.azurewebsites.net/api`
- Mock data: Deshabilitado
- Log level: Error

### Testing
- URL: `http://localhost:3000/api`
- Mock data: Habilitado
- Log level: Warn

## Personalización

Para cambiar la URL de la API en producción, modifica el archivo `src/config/environment.ts`:

```typescript
PRODUCTION: {
  API_BASE_URL: 'https://tu-nueva-api.com/api',
  LOG_LEVEL: 'error',
  ENABLE_MOCK_DATA: false,
}
```

## Beneficios

1. **Centralización**: Toda la configuración de la API está en un lugar
2. **Flexibilidad**: Diferentes configuraciones por ambiente
3. **Mantenibilidad**: Fácil de cambiar y actualizar
4. **Reutilización**: Funciones helper para uso común
5. **Seguridad**: Manejo centralizado de headers y autenticación
6. **Debugging**: Mejor manejo de errores y logging
