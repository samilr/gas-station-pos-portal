import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Asegurar que los archivos de configuración del servidor se copien al build
    rollupOptions: {
      output: {
        // Mantener la estructura de archivos para los archivos de configuración del servidor
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) {
            return `assets/[name]-[hash][extname]`;
          }
          
          if (/\.(web\.config|htaccess\.txt|_redirects|staticwebapp\.config\.json|manifest\.json|browserconfig\.xml|sw\.js|offline\.html)$/i.test(assetInfo.name)) {
            // Renombrar htaccess.txt a .htaccess en el build
            if (assetInfo.name === 'htaccess.txt') {
              return '.htaccess';
            }
            return `[name][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    }
  },
  // Configuración para PWA
  server: {
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
  preview: {
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
});
