import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sensorDataByLocationIds: {},
  loading: false,
  activeReadingTypes: [],
};

const bulkSensorsReadingsSlice = createSlice({
  name: 'bulkSensorsReadingsReducer',
  initialState,
  reducers: {
    resetBulkSensorReadingsStates: (state, action) => {
      Object.assign(state, {
        sensorDataByLocationIds: {},
        loading: false,
        activeReadingTypes: [],
      });
    },
    bulkSensorReadingsLoading: (state, action) => {
      Object.assign(state, {
        sensorDataByLocationIds: {},
        loading: true,
        activeReadingTypes: [],
      });
    },
    bulkSensorReadingsSuccess: (state, { payload }) => {
      if (state.loading) {
        Object.assign(state, {
          sensorDataByLocationIds: payload?.sensorDataByLocationIds,
          loading: false,
          activeReadingTypes: payload?.activeReadingTypes,
        });
      }
    },
    bulkSensorReadingsFailure: (state, action) => {
      state.sensorDataByLocationIds = {};
      state.loading = false;
      state.activeReadingTypes = [];
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
