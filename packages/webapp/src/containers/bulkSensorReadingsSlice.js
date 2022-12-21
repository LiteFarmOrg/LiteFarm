import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  sensorsReadings: {},
  selectedSensorName: '',
  latestMinTemperature: null,
  latestMaxTemperature: null,
  nearestStationName: '',
  lastUpdatedReadingsTime: '',
  predictedXAxisLabel: '',
  xAxisLabel: {},
  activeReadingTypes: [],
};

const bulkSensorsReadingsSlice = createSlice({
  name: 'bulkSensorsReadingsReducer',
  initialState,
  reducers: {
    resetBulkSensorReadingsStates: (state, action) => {
      Object.assign(state, {
        loading: false,
        sensorsReadings: {},
        selectedSensorName: '',
        latestMinTemperature: null,
        latestMaxTemperature: null,
        nearestStationName: '',
        lastUpdatedReadingsTime: '',
        predictedXAxisLabel: '',
        xAxisLabel: {},
        activeReadingTypes: [],
      });
    },
    bulkSensorReadingsLoading: (state, action) => {
      Object.assign(state, {
        loading: true,
        sensorsReadings: {},
        selectedSensorName: '',
        latestMinTemperature: null,
        latestMaxTemperature: null,
        nearestStationName: '',
        lastUpdatedReadingsTime: '',
        predictedXAxisLabel: '',
        xAxisLabel: {},
        activeReadingTypes: [],
      });
    },
    bulkSensorReadingsSuccess: (state, { payload }) => {
      if (state.loading) {
        Object.assign(state, {
          loading: false,
          sensorsReadings: payload?.sensorReadings,
          selectedSensorName: payload?.selectedSensorName,
          latestMinTemperature: payload?.latestTemperatureReadings?.tempMin,
          latestMaxTemperature: payload?.latestTemperatureReadings?.tempMax,
          nearestStationName: payload?.nearestStationName,
          lastUpdatedReadingsTime: payload?.lastUpdatedReadingsTime,
          predictedXAxisLabel: payload?.predictedXAxisLabel,
          xAxisLabel: payload?.xAxisLabel,
          activeReadingTypes: payload?.activeReadingTypes,
        });
      }
    },
    bulkSensorReadingsFailure: (state, action) => {
      state.loading = true;
      state.sensorsReadings = {};
      state.selectedSensorName = '';
      state.nearestStationName = '';
      state.lastUpdatedReadingsTime = '';
      state.predictedXAxisLabel = '';
      state.xAxisLabel = {};
      state.activeReadingTypes = [];
      (state.latestMinTemperature = null), (state.latestMaxTemperature = null);
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
