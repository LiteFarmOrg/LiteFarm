import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  isBulkUploadSuccessful: false,
  validationErrors: [],
};

const bulkSensorsUploadSlice = createSlice({
  name: 'bulkSensorsUploadReducer',
  initialState,
  reducers: {
    bulkSensorsUploadLoading: (state, action) => {
      state.loading = true;
      state.isBulkUploadSuccessful = false;
      state.validationErrors = [];
    },
    bulkSensorsUploadSuccess: (state, { payload }) => {
      if (state.loading) {
        state.loading = false;
        state.isBulkUploadSuccessful = true;
        state.validationErrors = [];
        Object.assign(state, payload);
      }
    },
    bulkSensorsUploadFailure: (state, action) => {
      state.loading = false;
      state.isBulkUploadSuccessful = false;
      state.validationErrors = [];
    },
    bulkSensorsUploadValidationFailure: (state, { payload }) => {
      state.loading = false;
      state.isBulkUploadSuccessful = false;
      console.log('payload', payload);
      Object.assign(state, { validationErrors: payload });
    },
  },
});
export const {
  bulkSensorsUploadLoading,
  bulkSensorsUploadSuccess,
  bulkSensorsUploadFailure,
  bulkSensorsUploadValidationFailure,
} = bulkSensorsUploadSlice.actions;
export default bulkSensorsUploadSlice.reducer;
export const bulkSensorsUploadSliceSelector = (state) =>
  state?.entitiesReducer[bulkSensorsUploadSlice.name];
