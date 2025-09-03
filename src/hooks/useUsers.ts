import { useState, useEffect } from 'react';
import { userService, IUser } from '../services/userService';

// Datos mock para pruebas
const mockUsers: IUser[] = [
  {
    user_id: '1',
    created_at: new Date(),
    username: 'admin',
    name: 'Administrador del Sistema',
    staft_group_id: 1,
    staft_group: 'Administración',
    created_by: 'system',
    role_id: '1',
    role: 'admin',
    staft_id: 'ADM001',
    site_id: 'SITE001',
    terminal_id: 1,
    shift: 1,
    active: 1,
    portal_access:true,
    email: 'admin@sistema.com'
  },
  {
    user_id: '2',
    username: 'manager1',
    created_at: new Date(),
    name: 'Juan Pérez',
    staft_group_id: 2,
    staft_group: 'Ventas',
    created_by: 'admin',
    role_id: '2',
    role: 'MANAGER',
    staft_id: 'VEN001',
    site_id: 'SITE001',
    terminal_id: 2,
    shift: 1,
    active: 1,
    portal_access: true,
    email: 'juan.perez@empresa.com'
  },
  {
    user_id: '3',
    username: 'supervisor1',
    created_at: new Date(),
    name: 'María García',
    staft_group_id: 3,
    staft_group: 'Soporte',
    created_by: 'admin',
    role_id: '3',
    role: 'SUPERVISOR',
    staft_id: 'SOP001',
    site_id: 'SITE001',
    terminal_id: 3,
    shift: 2,
    active: 1,
    portal_access: true,
    email: 'maria.garcia@empresa.com'
  },
  {
    user_id: '4',
    username: 'auditor1',
    created_at: new Date(),
    name: 'Carlos López',
    staft_group_id: 2,
    staft_group: 'Ventas',
    created_by: 'admin',
    role_id: '2',
    role: 'AUDITOR',
    staft_id: 'VEN002',
    site_id: 'SITE001',
    terminal_id: 2,
    shift: 1,
    active: 0,
    portal_access: true,
    email: 'carlos.lopez@empresa.com'
  }
];

export const useUsers = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers();
      if (response.successful && Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.successful && !Array.isArray(response.data)) {
        setError('Formato de respuesta inválido - usando datos de prueba');
        setUsers(mockUsers);
      } else {
        setError('Error al cargar usuarios - usando datos de prueba');
        setUsers(mockUsers);
      }
    } catch (err) {
      console.log('Error al cargar usuarios del API, usando datos mock:', err);
      setError('Error de conexión - usando datos de prueba');
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refreshUsers = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    refreshUsers
  };
};
