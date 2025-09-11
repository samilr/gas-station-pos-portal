# Instrucciones de Despliegue - Solución de Rutas SPA

## Problema Solucionado
✅ **Error 404 al recargar rutas**: Cuando recargas la página en rutas como `/dashboard/users`, el servidor no encuentra la ruta.

## Solución Implementada
Se han creado archivos de configuración del servidor que redirigen todas las rutas al `index.html`:

### Archivos Creados:
- `public/web.config` - Para Azure Static Web Apps
- `public/_redirects` - Para Netlify  
- `public/htaccess.txt` - Para Apache (se renombra a `.htaccess` en el build)

### Configuración Actualizada:
- `vite.config.ts` - Configurado para copiar los archivos de configuración correctamente

## Pasos para Desplegar:

1. **Hacer build:**
   ```bash
   npm run build
   ```

2. **Desplegar el contenido de la carpeta `dist/` a tu servidor**

3. **Verificar que funciona:**
   - Navega a cualquier ruta (ej: `/dashboard/users`)
   - Recarga la página
   - Debe cargar correctamente sin error 404

## Para Azure Static Web Apps:
El archivo `web.config` se copiará automáticamente y configurará IIS para manejar las rutas SPA.

¡Listo! Tu aplicación ahora manejará correctamente las recargas de página en cualquier ruta.
