import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  isBulkUploadSuccessful: false,
  validationErrors: [],
  success: [],
  errorSensors: [],
  showTransitionModal: false,
};

const bulkSensorsUploadSlice = createSlice({
  name: 'bulkSensorsUploadReducer',
  initialState,
  reducers: {
    resetSensorsBulkUploadStates: (state, action) => {
      Object.assign(state, {
        loading: false,
        isBulkUploadSuccessful: false,
        validationErrors: [],
        success: [],
        errorSensors: [],
        showTransitionModal: false,
      });
    },
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
    bulkSensorsUploadFailure: (state, { payload }) => {
      const { success, errorSensors } = payload;
      state.loading = false;
      state.isBulkUploadSuccessful = false;
      state.success = success;
      state.errorSensors = errorSensors;
      state.validationErrors = [];
    },
    bulkSensorsUploadValidationFailure: (state, { payload }) => {
      state.loading = false;
      state.isBulkUploadSuccessful = false;
      Object.assign(state, { validationErrors: payload });
    },
    switchToAsyncSensorUpload: (state, { payload }) => {
      Object.assign(state, {
        loading: false,
        isBulkUploadSuccessful: false,
        showTransitionModal: payload,
        validationErrors: [],
      });
    },
    bulkSensorsUploadReInit: (state, action) => {
      state.loading = false;
      state.isBulkUploadSuccessful = false;
    },
  },
});
export const {
  resetSensorsBulkUploadStates,
  bulkSensorsUploadLoading,
  bulkSensorsUploadSuccess,
  bulkSensorsUploadFailure,
  bulkSensorsUploadValidationFailure,
  switchToAsyncSensorUpload,
  bulkSensorsUploadReInit,
} = bulkSensorsUploadSlice.actions;
export default bulkSensorsUploadSlice.reducer;
export const bulkSensorsUploadSliceSelector = (state) =>
  state?.entitiesReducer[bulkSensorsUploadSlice.name];
