// Script para limpiar el cache del Service Worker
// Ejecutar en la consola del navegador para forzar la actualización

console.log('🧹 Limpiando cache del Service Worker...');

// Limpiar todos los caches
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => {
        console.log('🗑️ Eliminando cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(() => {
    console.log('✅ Todos los caches eliminados');
    
    // Desregistrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          console.log('🔄 Desregistrando Service Worker:', registration.scope);
          registration.unregister();
        });
      }).then(() => {
        console.log('✅ Service Worker desregistrado');
        console.log('🔄 Recargando página...');
        window.location.reload();
      });
    }
  });
} else {
  console.log('❌ Cache API no disponible');
}
