# Guía de Despliegue - Configuración de Rutas SPA

Este proyecto es una Single Page Application (SPA) que utiliza React Router con `createBrowserRouter`. Para que funcione correctamente en servidores estáticos, es necesario configurar el servidor para que redirija todas las rutas al archivo `index.html`.

## Archivos de Configuración Incluidos

### 1. Azure Static Web Apps (`web.config`)
- **Ubicación**: `public/web.config`
- **Función**: Configura IIS para redirigir todas las rutas al `index.html`
- **Uso**: Se copia automáticamente al directorio raíz del build

### 2. Netlify (`_redirects`)
- **Ubicación**: `public/_redirects`
- **Función**: Configura Netlify para manejar rutas SPA
- **Uso**: Se copia automáticamente al directorio raíz del build

### 3. Apache (`.htaccess`)
- **Ubicación**: `public/.htaccess`
- **Función**: Configura Apache para redirigir rutas SPA
- **Uso**: Se copia automáticamente al directorio raíz del build

## Configuración Específica para Azure Static Web Apps

### Opción 1: Usar el archivo `web.config` (Recomendado)
El archivo `web.config` ya está configurado y se copiará automáticamente al build. No necesitas hacer nada adicional.

### Opción 2: Configuración en `staticwebapp.config.json`
Si prefieres usar la configuración nativa de Azure Static Web Apps, crea un archivo `staticwebapp.config.json` en la raíz del proyecto:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,jpeg,gif,svg}", "/css/*", "/js/*"]
  },
  "mimeTypes": {
    ".json": "application/json"
  }
}
```

### Opción 3: Configuración en el Portal de Azure
1. Ve a tu Azure Static Web App en el portal
2. Navega a "Configuration" en el menú lateral
3. Agrega una nueva configuración:
   - **Name**: `navigationFallback`
   - **Value**: `/index.html`

## Verificación del Despliegue

Después del despliegue, verifica que:

1. ✅ La aplicación carga correctamente en la ruta raíz (`/`)
2. ✅ La navegación entre rutas funciona sin recargar la página
3. ✅ Al recargar la página en cualquier ruta (ej: `/dashboard/users`), la aplicación carga correctamente
4. ✅ No aparecen errores 404 al recargar rutas específicas

## Comandos de Build

```bash
# Instalar dependencias
npm install

# Build para producción
npm run build

# El directorio `dist/` contendrá todos los archivos necesarios
```

## Solución de Problemas

### Error 404 al recargar rutas
- Verifica que el archivo `web.config` esté presente en la raíz del build
- Confirma que la configuración de Azure Static Web Apps esté activa

### La aplicación no carga
- Verifica que el archivo `index.html` esté en la raíz del build
- Confirma que las rutas de assets sean correctas

### Problemas de caché
- Limpia el caché del navegador
- Verifica que los headers de caché estén configurados correctamente

## Notas Adicionales

- Los archivos de configuración se copian automáticamente durante el build gracias a la configuración en `vite.config.ts`
- La configuración incluye compresión y headers de caché para optimizar el rendimiento
- Las rutas de API (que empiecen con `/api`) están excluidas de la redirección
