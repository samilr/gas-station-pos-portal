import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

// Mapeo de roles de la API a roles del proyecto
const ROLE_MAPPING = {
  'ADMIN': 'Super Admin',
  'SELLER': 'Viewer',
  'MANAGER': 'Editor',
  'SUPERVISOR': 'Supervisor',
  'CONFIGURATION': 'Configuration'
} as const;

// Permisos por rol
const ROLE_PERMISSIONS = {
  'ADMIN': [
    // Usuarios
    'users.view', 'users.create', 'users.edit', 'users.delete',
    // Analytics y Transacciones
    'analytics.view', 'transactions.view', 'transactions.edit',
    // Base de datos y Seguridad
    'database.view', 'database.edit', 'security.view', 'security.edit',
    // Reportes y Notificaciones
    'reports.view', 'reports.create', 'notifications.view', 'notifications.edit',
    // Configuración
    'settings.view', 'settings.edit',
    // Productos
    'products.view', 'products.create', 'products.edit', 'products.delete',
    // Sitios
    'sites.view', 'sites.create', 'sites.edit', 'sites.delete',
    // Terminales
    'terminals.view', 'terminals.create', 'terminals.edit', 'terminals.delete',
    // Dispositivos
    'devices.view', 'devices.create', 'devices.edit', 'devices.delete',
    // Logs
    'logs.view', 'actionlogs.view', 'errorlogs.view'
  ],
  'SELLER': [
    'analytics.view', 'reports.view', 'products.view'
  ],
  'MANAGER': [
    // Usuarios
    'users.view', 'users.create', 'users.edit',
    // Analytics y Transacciones
    'analytics.view', 'transactions.view', 'transactions.edit', 
    // Reportes y Notificaciones
    'reports.view', 'reports.create', 'notifications.view',
    // Productos
    'products.view', 'products.create', 'products.edit',
    // Sitios
    'sites.view', 'sites.create', 'sites.edit',
    // Terminales
    'terminals.view', 'terminals.create', 'terminals.edit',
    // Dispositivos
    'devices.view', 'devices.create', 'devices.edit',
    // Logs
    'logs.view', 'actionlogs.view', 'errorlogs.view'
  ],
  'SUPERVISOR': [
    // Usuarios
    'users.view', 'users.create', 'users.edit',
    // Analytics y Transacciones
    'analytics.view', 'transactions.view', 'transactions.edit',
    // Reportes y Notificaciones
    'reports.view', 'reports.create',
    // Productos
    'products.view', 'products.create', 'products.edit',
    // Sitios
    'sites.view', 'sites.create', 'sites.edit',
    // Terminales
    'terminals.view', 'terminals.create', 'terminals.edit',
    // Dispositivos
    'devices.view', 'devices.create', 'devices.edit',
    // Logs
    'logs.view', 'actionlogs.view', 'errorlogs.view'
  ],
  'CONFIGURATION': [
    // Configuración
    'settings.view', 'settings.edit',
    // Base de datos y Seguridad
    'database.view', 'database.edit', 'security.view', 'security.edit',
    // Sitios
    'sites.view', 'sites.create', 'sites.edit', 'sites.delete',
    // Terminales
    'terminals.view', 'terminals.create', 'terminals.edit', 'terminals.delete',
    // Dispositivos
    'devices.view', 'devices.create', 'devices.edit', 'devices.delete',
    // Logs
    'logs.view', 'actionlogs.view', 'errorlogs.view'
  ]
} as const;

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  permissions: string[];
  staftId?: string;
  shift?: string;
  terminal?: string;
  site?: string;
  staftGroup?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ username, password });
      
      if (response.successful && response.data) {
        const apiRole = response.data.role as keyof typeof ROLE_MAPPING;
        const mappedRole = ROLE_MAPPING[apiRole] || apiRole;
        const permissions = [...(ROLE_PERMISSIONS[apiRole] || [])];
        
        // Crear objeto de usuario con los datos de la API
        const userData: User = {
          id: response.data.staftId,
          name: response.data.user,
          username: username,
          role: mappedRole,
          permissions: permissions,
          staftId: response.data.staftId,
          shift: response.data.shift,
          terminal: response.data.terminal,
          site: response.data.site,
          staftGroup: response.data.staftGroup,
        };
        
        setUser(userData);
        
        // Guardar accessToken en localStorage
        if (response.data.accessToken) {
          localStorage.setItem('authToken', response.data.accessToken);
        }
        
        // Guardar información de expiración si está disponible
        if (response.data.expiresIn) {
          localStorage.setItem('tokenExpiresIn', response.data.expiresIn.toISOString());
        }
        
        localStorage.setItem('adminUser', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('adminUser');
      localStorage.removeItem('tokenExpiresIn');
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const isTokenExpired = (): boolean => {
    const expiresIn = localStorage.getItem('tokenExpiresIn');
    if (!expiresIn) return true;
    
    const expirationDate = new Date(expiresIn);
    return new Date() > expirationDate;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    hasPermission,
    isTokenExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};