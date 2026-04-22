import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HeaderState {
  subtitle: string;
}

const initialState: HeaderState = {
  subtitle: '',
};

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    setSubtitle(state, action: PayloadAction<string>) {
      state.subtitle = action.payload;
    },
  },
});

export const { setSubtitle } = headerSlice.actions;
export default headerSlice.reducer;
