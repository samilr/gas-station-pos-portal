import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User, Settings, Shield, HelpCircle, AlertCircle, Info, CheckCircle, Loader2 } from 'lucide-react';
import { sectionTitles } from './menuConfig';

interface TopBarProps {
  activeSection: string;
}

const TopBar: React.FC<TopBarProps> = ({ activeSection }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const title = sectionTitles[activeSection] || 'Portal Administrativo';
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        searchRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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

  return (
    <header className="h-10 bg-white border-b border-gray-200 flex items-center px-3 flex-shrink-0 z-10">
      {/* Left: title */}
      <div className="flex-shrink-0">
        <span className="text-md font-semibold text-text-primary">{title}</span>
      </div>

      {/* Center: search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-[280px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar y conectar  ⌘K"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 pl-7 pr-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
          />
        </div>
      </div>

      {/* Right: icons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-gray-100 transition-colors relative"
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

        {/* Settings */}
        <button
          onClick={() => navigate('/dashboard/settings/general')}
          className="h-7 w-7 flex items-center justify-center rounded-sm hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-[14px] h-[14px] text-text-secondary" />
        </button>

        {/* User avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="relative h-[22px] w-[22px] bg-blue-600 rounded-full flex items-center justify-center ml-1"
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
