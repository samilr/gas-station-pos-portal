import { useListUsersQuery } from '../store/api/usersApi';
import { getErrorMessage } from '../store/api/baseApi';

export const useUsers = () => {
  const { data, isLoading, error, refetch } = useListUsersQuery();

  return {
    users: data ?? [],
    loading: isLoading,
    error: getErrorMessage(error, 'Error al cargar usuarios'),
    refreshUsers: refetch,
  };
};
