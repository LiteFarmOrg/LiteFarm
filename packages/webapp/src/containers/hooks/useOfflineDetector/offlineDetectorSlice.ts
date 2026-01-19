import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOffline: false,
};

const offlineDetectorSlice = createSlice({
  name: 'offlineDetectorReducer',
  initialState,
  reducers: {
    updateOfflineStatus: (state, { payload }: { payload: boolean }) => {
      state.isOffline = payload;
    },
  },
});
export const { updateOfflineStatus } = offlineDetectorSlice.actions;
export default offlineDetectorSlice.reducer;
