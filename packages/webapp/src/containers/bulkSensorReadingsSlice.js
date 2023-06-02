import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sensorDataByLocationIds: {},
  loading: false,
};

const bulkSensorsReadingsSlice = createSlice({
  name: 'bulkSensorsReadingsReducer',
  initialState,
  reducers: {
    resetBulkSensorReadingsStates: (state, action) => {
      Object.assign(state, {
        sensorDataByLocationIds: {},
        loading: false,
      });
    },
    bulkSensorReadingsLoading: (state, action) => {
      Object.assign(state, {
        sensorDataByLocationIds: {},
        loading: true,
      });
    },
    bulkSensorReadingsSuccess: (state, { payload }) => {
      if (state.loading) {
        Object.assign(state, {
          sensorDataByLocationIds: payload?.sensorDataByLocationIds,
          loading: false,
        });
      }
    },
    bulkSensorReadingsFailure: (state, action) => {
      state.sensorDataByLocationIds = {};
      state.loading = false;
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
