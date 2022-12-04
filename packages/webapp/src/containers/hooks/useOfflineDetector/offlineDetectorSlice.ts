import { createSlice } from '@reduxjs/toolkit';

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
const isOfflineSelector = (state: any) =>
  state?.tempStateReducer[hookFormPersistSlice.name].isOffline as boolean;
