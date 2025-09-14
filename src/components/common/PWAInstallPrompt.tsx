import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import toast from 'react-hot-toast';

interface PWAInstallPromptProps {
  className?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isStandalone, isOnline, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // No mostrar si ya está instalada o en modo standalone
  if (isInstalled || isStandalone || !isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      await installApp();
      toast.success('¡Aplicación instalada exitosamente!');
    } catch (error) {
      console.error('Error instalando PWA:', error);
      toast.error('Error al instalar la aplicación');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Recordar la decisión por 7 días
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Verificar si el usuario ya rechazó la instalación recientemente
  React.useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 ${className}`}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Instalar ISLADOM POS</h3>
                  <p className="text-xs opacity-90">Acceso rápido desde tu dispositivo</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Smartphone className="w-4 h-4" />
                <span>Acceso directo desde la pantalla de inicio</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Monitor className="w-4 h-4" />
                <span>Experiencia de aplicación nativa</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span>Funciona online y offline</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-orange-500" />
                    <span>Modo offline disponible</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2"
              >
                {isInstalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Instalando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Instalar</span>
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
              >
                Ahora no
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente para mostrar actualizaciones disponibles
export const PWAUpdatePrompt: React.FC = () => {
  const { updateAvailable, updateApp } = usePWA();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!updateAvailable) return null;

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      updateApp();
    } catch (error) {
      console.error('Error actualizando PWA:', error);
      toast.error('Error al actualizar la aplicación');
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Actualización disponible</h3>
                  <p className="text-xs opacity-90">Nueva versión lista para instalar</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Hay una nueva versión de ISLADOM POS disponible con mejoras y correcciones.
            </p>

            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Actualizar ahora</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
