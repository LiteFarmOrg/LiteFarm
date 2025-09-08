import { createSlice, createAction } from '@reduxjs/toolkit';

export const serviceWorkerMessageReceived = createAction(
  'offlineDetector/serviceWorkerMessageReceived',
);

const initialState = {
  isOffline: false,
};

const hookFormPersistSlice = createSlice({
  name: 'offlineDetectorReducer',
  initialState,
  reducers: {
    updateOfflineStatus: (state, { payload }: { payload: boolean }) => {
      state.isOffline = payload;
    },
  },
});
export const { updateOfflineStatus } = hookFormPersistSlice.actions;
export default hookFormPersistSlice.reducer;
