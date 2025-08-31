import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePersistentAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  return { isInitialized };
};
