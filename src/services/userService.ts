/**
 * Tipos para el dominio de usuarios.
 * Los métodos CRUD viven ahora en `src/store/api/usersApi.ts` (RTK Query).
 * La auth (login/logout/validateToken) vive en `authService` + `authSlice`.
 */

export interface IUser {
  connected: number;
  user_id: string;
  username: string;
  name: string;
  staft_group_id: number;
  staft_group: string;
  created_by: string;
  password?: string;
  role_id: string;
  role: string;
  staft_id: string;
  site_id: string;
  terminal_id: number;
  created_at: Date;
  shift: number;
  active: number;
  portal_access: number;
  email: string;
  updated_password_at?: Date;
  last_time_logged?: Date;
}
