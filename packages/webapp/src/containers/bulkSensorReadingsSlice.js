import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  sensorsReadingsOfTemperature: [],
  selectedSensorName: '',
};

const bulkSensorsReadingsSlice = createSlice({
  name: 'bulkSensorsReadingsReducer',
  initialState,
  reducers: {
    resetBulkSensorReadingsStates: (state, action) => {
      Object.assign(state, {
        loading: false,
        sensorsReadingsOfTemperature: [],
        selectedSensorName: '',
      });
    },
    bulkSensorReadingsLoading: (state, action) => {
      Object.assign(state, {
        loading: true,
        sensorsReadingsOfTemperature: [],
        selectedSensorName: '',
      });
    },
    bulkSensorReadingsSuccess: (state, { payload }) => {
      if (state.loading) {
        Object.assign(state, {
          loading: false,
          sensorsReadingsOfTemperature: payload?.sensorReadings,
          selectedSensorName: payload?.selectedSensorName,
        });
      }
    },
    bulkSensorReadingsFailure: (state, action) => {
      state.loading = true;
      state.sensorsReadingsOfTemperature = [];
      state.selectedSensorName = '';
    },
  },
});
export const {
  resetBulkSensorReadingsStates,
  bulkSensorReadingsLoading,
  bulkSensorReadingsSuccess,
  bulkSensorReadingsFailure,
} = bulkSensorsReadingsSlice.actions;
export default bulkSensorsReadingsSlice.reducer;
export const bulkSensorsReadingsSliceSelector = (state) => {
  return state?.entitiesReducer[bulkSensorsReadingsSlice.name];
};
