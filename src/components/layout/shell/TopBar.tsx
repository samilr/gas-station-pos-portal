import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, User, Shield, HelpCircle, AlertCircle, Info, CheckCircle, Loader2, RefreshCw, Clock, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { sectionTitles, menuItems } from './menuConfig';

interface TopBarProps {
  activeSection: string;
}

const TopBar: React.FC<TopBarProps> = ({ activeSection }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  // Live clock (updates every second)
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  const handleRefresh = () => {
    // Dispatch a custom event so sections can listen and refresh their data
    window.dispatchEvent(new CustomEvent('app:refresh'));
    // Fallback: force reload the current route's data by revisiting
    navigate(location.pathname, { replace: true });
  };

  // Build breadcrumb from activeSection
  const buildBreadcrumb = () => {
    const topLevel = activeSection.split('.')[0];
    let moduleItem = menuItems.find(item => item.id === topLevel);
    if (!moduleItem) {
      moduleItem = menuItems.find(item =>
        item.subItems?.some(sub => sub.id === activeSection)
      );
    }
    const moduleLabel = moduleItem?.label;
    const subItemLabel = activeSection.includes('.')
      ? sectionTitles[activeSection] || activeSection.split('.')[1]
      : null;
    return { moduleLabel, subItemLabel };
  };

  const { moduleLabel, subItemLabel } = buildBreadcrumb();

  // Format time in Santo Domingo timezone
  const timeString = currentTime.toLocaleTimeString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const dateString = currentTime.toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: 'short',
  });

  return (
    <header className="h-10 bg-white border-b border-gray-200 flex items-center px-3 flex-shrink-0 z-10">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0">
        <span className="text-md font-semibold text-text-primary whitespace-nowrap">
          {moduleLabel || sectionTitles[activeSection] || 'Portal'}
        </span>
        {subItemLabel && (
          <>
            <ChevronRight className="w-3 h-3 text-text-muted flex-shrink-0" />
            <span className="text-sm text-text-secondary truncate">{subItemLabel}</span>
          </>
        )}
      </div>

      {/* Center spacer */}
      <div className="flex-1" />

      {/* Right: functional widgets */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Connection status */}
        <div
          className="flex items-center gap-1 text-xs text-text-secondary px-2 h-7 rounded-sm border border-gray-200"
          title={isOnline ? 'Conectado' : 'Sin conexión'}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="hidden md:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="hidden md:inline">Offline</span>
            </>
          )}
        </div>

        {/* Live clock */}
        <div className="flex items-center gap-1.5 text-xs text-text-secondary px-2 h-7 rounded-sm border border-gray-200 font-mono" title="Hora local (Santo Domingo)">
          <Clock className="w-3 h-3 text-text-muted" />
          <span className="hidden sm:inline text-text-muted">{dateString}</span>
          <span className="font-semibold text-text-primary">{timeString}</span>
        </div>

        {/* Refresh current page */}
        <button
          onClick={handleRefresh}
          className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-gray-100 transition-colors"
          title="Recargar datos (F5)"
        >
          <RefreshCw className="w-[14px] h-[14px] text-text-secondary" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-gray-100 transition-colors relative"
            title="Notificaciones"
          >
            <Bell className="w-[14px] h-[14px] text-text-secondary" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1 w-72 bg-white border border-gray-200 rounded-sm shadow-lg z-50">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-text-primary">Notificaciones</h3>
                  <span className="text-2xs text-text-muted">3 nuevas</span>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <div className="flex items-start gap-2 p-1.5 hover:bg-gray-50 rounded-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Sistema actualizado</p>
                      <p className="text-2xs text-text-muted">Hace 5 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-1.5 hover:bg-gray-50 rounded-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Mantenimiento programado</p>
                      <p className="text-2xs text-text-muted">Hace 1 hora</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-1.5 hover:bg-gray-50 rounded-sm">
                    <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Nuevo usuario registrado</p>
                      <p className="text-2xs text-text-muted">Hace 2 horas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="relative h-[22px] w-[22px] bg-blue-600 rounded-full flex items-center justify-center ml-1"
            title={user?.name}
          >
            <span className="text-white text-2xs font-medium">{userInitial}</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-sm shadow-lg z-50">
              <div className="p-1.5">
                <div className="px-2 py-1.5 border-b border-gray-100">
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-2xs text-text-muted">{user?.role}</p>
                </div>
                <div className="py-0.5">
                  <button
                    onClick={() => { navigate('/dashboard/users/profile'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary hover:bg-gray-50 rounded-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    Mi Perfil
                  </button>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary hover:bg-gray-50 rounded-sm">
                    <Shield className="w-3.5 h-3.5" />
                    Seguridad
                  </button>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary hover:bg-gray-50 rounded-sm">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Ayuda
                  </button>
                  <div className="border-t border-gray-100 my-0.5" />
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-sm disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5" />
                    )}
                    {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
