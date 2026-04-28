import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { siteService } from '../../services/siteService';
import { ISite } from '../../types/site';

const SELECTED_SITE_STORAGE_KEY = 'selectedSiteId';

/**
 * Valor centinela que representa "todas las sucursales".
 * Los hooks de data lo tratan como "no filtrar" (equivalente a null).
 * El SiteSelector lo usa para distinguir "elegí TODAS" de "aún no inicializado".
 */
export const ALL_SITES = '__ALL__';

export type SelectedSiteValue = string | null;

export interface SiteState {
  sites: ISite[];
  selectedSiteId: SelectedSiteValue;
  loading: boolean;
  error: string | null;
}

const readPersistedSiteId = (): string | null => {
  try {
    const raw = localStorage.getItem(SELECTED_SITE_STORAGE_KEY);
    return raw && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
};

const initialState: SiteState = {
  sites: [],
  selectedSiteId: readPersistedSiteId(),
  loading: false,
  error: null,
};

export const fetchSites = createAsyncThunk<ISite[], void, { rejectValue: string }>(
  'site/fetchSites',
  async (_, { rejectWithValue }) => {
    try {
      const res = await siteService.getAllSites();
      if (!res.successful) {
        return rejectWithValue(res.error || 'Error al cargar sucursales');
      }
      return res.data || [];
    } catch (err) {
      return rejectWithValue((err as Error)?.message || 'Error de conexión');
    }
  }
);

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setSelectedSite(state, action: PayloadAction<string | null>) {
      state.selectedSiteId = action.payload;
    },
    clearSelectedSite(state) {
      state.selectedSiteId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSites.fulfilled, (state, action) => {
        state.loading = false;
        state.sites = action.payload;
        // Si el sitio persistido ya no existe en la lista, limpiarlo
        if (
          state.selectedSiteId &&
          !action.payload.some((s) => s.siteId === state.selectedSiteId)
        ) {
          state.selectedSiteId = null;
        }
      })
      .addCase(fetchSites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error al cargar sucursales';
      });
  },
});

export const { setSelectedSite, clearSelectedSite } = siteSlice.actions;

export { SELECTED_SITE_STORAGE_KEY };

export default siteSlice.reducer;
