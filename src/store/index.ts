import { configureStore } from '@reduxjs/toolkit';
import siteReducer, { SELECTED_SITE_STORAGE_KEY } from './slices/siteSlice';
import authReducer from './slices/authSlice';
import headerReducer from './slices/headerSlice';
import { api } from './api/baseApi';

export const store = configureStore({
  reducer: {
    site: siteReducer,
    auth: authReducer,
    header: headerReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

let lastPersistedSiteId: string | null | undefined;
store.subscribe(() => {
  const current = store.getState().site.selectedSiteId;
  if (current === lastPersistedSiteId) return;
  lastPersistedSiteId = current;
  try {
    if (current) {
      localStorage.setItem(SELECTED_SITE_STORAGE_KEY, current);
    } else {
      localStorage.removeItem(SELECTED_SITE_STORAGE_KEY);
    }
  } catch {
    // localStorage no disponible (modo privado, etc.) — ignorar
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
