import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { ROLE_PERMISSIONS, Role } from '../../config/permissions';
import { clearSelectedSite, fetchSites } from './siteSlice';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: Role;
  permissions: string[];
  staftId?: string;
  shift?: string;
  terminal?: string;
  site?: string;
  staftGroup?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
}

const ROLE_MAPPING: Record<string, Role> = {
  ADMIN: Role.ADMIN,
  MANAGER: Role.MANAGER,
  SUPERVISOR: Role.SUPERVISOR,
  AUDIT: Role.AUDIT,
};

const initialState: AuthState = {
  user: null,
  isLoading: true,
};

const clearLocalStorage = () => {
  localStorage.removeItem('adminUser');
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenExpiresIn');
};

export const hydrateAuth = createAsyncThunk<AuthUser | null, void>(
  'auth/hydrate',
  async (_, { dispatch }) => {
    const savedUser = localStorage.getItem('adminUser');
    const authToken = localStorage.getItem('authToken');

    if (!savedUser || !authToken) {
      clearLocalStorage();
      dispatch(clearSelectedSite());
      return null;
    }

    try {
      const expiresIn = localStorage.getItem('tokenExpiresIn');
      const isExpired = !expiresIn || new Date() > new Date(expiresIn);

      if (isExpired) {
        clearLocalStorage();
        dispatch(clearSelectedSite());
        return null;
      }

      const userData = JSON.parse(savedUser) as AuthUser;
      // Sesión válida: refrescar lista de sucursales.
      dispatch(fetchSites());
      return userData;
    } catch (error) {
      console.error('Error parsing saved user data:', error);
      clearLocalStorage();
      dispatch(clearSelectedSite());
      return null;
    }
  }
);

export const loginUser = createAsyncThunk<
  AuthUser | null,
  { username: string; password: string }
>('auth/login', async ({ username, password }, { dispatch }) => {
  try {
    const response = await authService.login({ username, password });

    if (!response.successful || !response.data) return null;

    const apiRole = response.data.role as string;
    const mappedRole = ROLE_MAPPING[apiRole] || Role.ACCOUNTANT;
    const permissions = [...(ROLE_PERMISSIONS[mappedRole] || [])];

    const userData: AuthUser = {
      id: response.data.staftId,
      name: response.data.user,
      username,
      role: mappedRole,
      permissions,
      staftId: response.data.staftId,
      shift: response.data.shift,
      terminal: response.data.terminal,
      site: response.data.site,
      staftGroup: response.data.staftGroup,
    };

    if (response.data.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
    }
    if (response.data.expiresIn) {
      localStorage.setItem('tokenExpiresIn', response.data.expiresIn.toString());
    }
    localStorage.setItem('adminUser', JSON.stringify(userData));

    // Login exitoso: limpiar selección previa y recargar sucursales.
    dispatch(clearSelectedSite());
    dispatch(fetchSites());

    return userData;
  } catch (error) {
    console.error('Error en login:', error);
    return null;
  }
});

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      clearLocalStorage();
      dispatch(clearSelectedSite());
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.user = null;
        state.isLoading = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
