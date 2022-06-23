import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  sensorsReadingsOfTemperature: [],
};

const bulkSensorsReadingsSlice = createSlice({
  name: 'bulkSensorsReadingsReducer',
  initialState,
  reducers: {
    resetBulkSensorReadingsStates: (state, action) => {
      Object.assign(state, {
        loading: false,
        sensorsReadingsOfTemperature: [],
      });
    },
    bulkSensorReadingsLoading: (state, action) => {
      Object.assign(state, {
        loading: true,
        sensorsReadingsOfTemperature: [],
      });
    },
    bulkSensorReadingsSuccess: (state, { payload }) => {
      if (state.loading) {
        Object.assign(state, {
          loading: false,
          sensorsReadingsOfTemperature: payload,
        });
      }
    },
    bulkSensorReadingsFailure: (state, action) => {
      state.loading = true;
      state.sensorsReadingsOfTemperature = [];
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
