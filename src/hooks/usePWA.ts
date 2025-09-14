import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  installApp: () => Promise<void>;
  updateAvailable: boolean;
  updateApp: () => void;
}

export const usePWA = (): PWAState => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') return;

    // Verificar si la app está en modo standalone
    const checkStandalone = () => {
      try {
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://');
        setIsStandalone(standalone);
        setIsInstalled(standalone);
      } catch (error) {
        console.warn('Error checking standalone mode:', error);
      }
    };

    checkStandalone();

    // Escuchar cambios en el modo de visualización
    let mediaQuery: MediaQueryList | null = null;
    let handleDisplayModeChange: (() => void) | null = null;
    
    try {
      mediaQuery = window.matchMedia('(display-mode: standalone)');
      handleDisplayModeChange = () => checkStandalone();
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    } catch (error) {
      console.warn('Error setting up display mode listener:', error);
    }

    // Manejar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      try {
        e.preventDefault();
        setInstallPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
      } catch (error) {
        console.warn('Error handling beforeinstallprompt:', error);
      }
    };

    // Manejar la instalación exitosa
    const handleAppInstalled = () => {
      try {
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        console.log('PWA instalada exitosamente');
      } catch (error) {
        console.warn('Error handling app installed:', error);
      }
    };

    // Escuchar cambios en el estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Escuchar actualizaciones del Service Worker
    const handleServiceWorkerUpdate = () => {
      setUpdateAvailable(true);
    };

    // Registrar event listeners
    try {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    } catch (error) {
      console.warn('Error adding event listeners:', error);
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);

          // Escuchar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  handleServiceWorkerUpdate();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Error registrando Service Worker:', error);
        });
    }

    return () => {
      try {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        if (mediaQuery && handleDisplayModeChange) {
          mediaQuery.removeEventListener('change', handleDisplayModeChange);
        }
      } catch (error) {
        console.warn('Error removing event listeners:', error);
      }
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!installPrompt) {
      throw new Error('No hay prompt de instalación disponible');
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuario aceptó la instalación');
        setIsInstalled(true);
        setIsInstallable(false);
      } else {
        console.log('Usuario rechazó la instalación');
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Error durante la instalación:', error);
      throw error;
    }
  };

  const updateApp = (): void => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    isOnline,
    installPrompt,
    installApp,
    updateAvailable,
    updateApp,
  };
};
