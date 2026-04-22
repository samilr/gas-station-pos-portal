import React, { useCallback, useEffect, ReactNode } from 'react';
import { hasPermission as roleHasPermission, Permission, Role } from '../config/permissions';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hydrateAuth, loginUser, logoutUser, AuthUser } from '../store/slices/authSlice';

// Re-export del tipo para mantener compatibilidad con imports existentes.
export type User = AuthUser;

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  isTokenExpired: () => boolean;
}

/**
 * Host del dispatch de hidratación al arranque. No provee contexto —
 * `useAuth` lee directamente del store. Se mantiene para no tener que cambiar
 * App.tsx y para concentrar la hidratación en un único punto del árbol.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export const useAuth = (): AuthContextType => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isLoading = useAppSelector((s) => s.auth.isLoading);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      const result = await dispatch(loginUser({ username, password })).unwrap();
      return result !== null;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutUser()).unwrap();
  }, [dispatch]);

  const checkPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return roleHasPermission(user.role as Role, permission as Permission);
    },
    [user]
  );

  const isTokenExpired = useCallback((): boolean => {
    const expiresIn = localStorage.getItem('tokenExpiresIn');
    if (!expiresIn) return true;
    return new Date() > new Date(expiresIn);
  }, []);

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    hasPermission: checkPermission,
    isTokenExpired,
  };
};
