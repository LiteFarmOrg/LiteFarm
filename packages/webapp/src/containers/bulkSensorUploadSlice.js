import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  isBulkUploadSuccessful: false,
};

const bulkSensorsUploadSlice = createSlice({
  name: 'bulkSensorsUploadReducer',
  initialState,
  reducers: {
    bulkSensorsUploadLoading: (state, action) => {
      state.loading = true;
      state.isBulkUploadSuccessful = false;
    },
    bulkSensorsUploadSuccess: (state, { payload }) => {
      if (state.loading) {
        state.loading = false;
        state.isBulkUploadSuccessful = true;
        Object.assign(state, payload);
      }
    },
    bulkSensorsUploadFailure: (state, action) => {
      state.loading = false;
      state.isBulkUploadSuccessful = false;
    },
    bulkSensorsUploadReInit: (state, action) => {
      state.loading = false;
      state.isBulkUploadSuccessful = false;
    },
  },
});
export const {
  bulkSensorsUploadLoading,
  bulkSensorsUploadSuccess,
  bulkSensorsUploadFailure,
  bulkSensorsUploadReInit,
} = bulkSensorsUploadSlice.actions;
export default bulkSensorsUploadSlice.reducer;
export const bulkSensorsUploadSliceSelector = (state) =>
  state?.entitiesReducer[bulkSensorsUploadSlice.name];
