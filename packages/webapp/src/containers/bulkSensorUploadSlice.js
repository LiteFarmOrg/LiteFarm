import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loaded: false,
  loading: false,
};

const bulkSensorsUploadSlice = createSlice({
  name: 'bulkSensorsUploadReducer',
  initialState,
  reducers: {
    bulkSensorsUploadLoading: (state, action) => {
      state.loading = true;
    },
    bulkSensorsUploadSuccess: (state, { payload }) => {
      if (state.loading) {
        state.loading = false;
        state.loaded = true;
        Object.assign(state, payload);
      }
    },
    bulkSensorsUploadFailure: (state, action) => {
      state.loading = false;
      state.loaded = true;
    },
    patchBulkSensorsUploadSuccess: (state, { payload }) => {
      state.loading = false;
      Object.assign(state, payload);
    },
    patchBulkSensorsUploadFailure: (state, action) => {
      state.loading = false;
    },
  },
});
export const {
  bulkSensorsUploadLoading,
  bulkSensorsUploadSuccess,
  bulkSensorsUploadFailure,
  patchBulkSensorsUploadSuccess,
  patchBulkSensorsUploadFailure,
} = bulkSensorsUploadSlice.actions;
export default bulkSensorsUploadSlice.reducer;
export const bulkSensorsUploadSliceSelector = (state) =>
  state?.entitiesReducer[bulkSensorsUploadSlice.name];
