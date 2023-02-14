import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

const initialState = {
  sensorsReadings: {},
  selectedSensorName: '',
  latestMinTemperature: null,
  latestMaxTemperature: null,
  nearestStationName: '',
  lastUpdatedReadingsTime: {},
  predictedXAxisLabel: '',
  xAxisLabel: {},
  activeReadingTypes: [],
};

const sensorReadingAdapter = createEntityAdapter({
  selectId: (sensorReading) => sensorReading.reading_id,
});

const bulkSensorsReadingsSlice = createSlice({
  name: 'bulkSensorsReadingsReducer',
  initialState: sensorReadingAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
    ...initialState,
  }),
  reducers: {
    resetBulkSensorReadingsStates: (state, { payload }) => {
      state.loading = false;
      state.error = null;
      state.loaded = true;
      state.sensorsReadings = {};
      state.selectedSensorName = '';
      state.latestMinTemperature = null;
      state.latestMaxTemperature = null;
      state.nearestStationName = '';
      state.lastUpdatedReadingsTime = {};
      state.predictedXAxisLabel = '';
      state.xAxisLabel = {};
      state.activeReadingTypes = [];
    },
    bulkSensorReadingsLoading: (state, { payload }) => {
      state.loading = true;
      state.error = null;
      state.loaded = false;
      state.sensorsReadings = {};
      state.selectedSensorName = '';
      state.latestMinTemperature = null;
      state.latestMaxTemperature = null;
      state.nearestStationName = '';
      state.lastUpdatedReadingsTime = {};
      state.predictedXAxisLabel = '';
      state.xAxisLabel = {};
      state.activeReadingTypes = [];
    },
    bulkSensorReadingsSuccess: (state, { payload }) => {
      state.loading = false;
      state.error = null;
      state.sensorsReadings = payload?.sensorReadings;
      state.selectedSensorName = payload?.selectedSensorName;
      state.latestMinTemperature = payload?.latestTemperatureReadings?.tempMin;
      state.latestMaxTemperature = payload?.latestTemperatureReadings?.tempMax;
      state.nearestStationName = payload?.nearestStationName;
      state.lastUpdatedReadingsTime = payload?.lastUpdatedReadingsTime;
      state.predictedXAxisLabel = payload?.predictedXAxisLabel;
      state.xAxisLabel = payload?.xAxisLabel;
      state.activeReadingTypes = payload?.activeReadingTypes;
      state.loaded = true;
    },
    bulkSensorReadingsFailure: (state, { payload: error }) => {
      state.loading = false;
      state.error = error;
      state.loaded = true;
      state.sensorsReadings = {};
      state.selectedSensorName = '';
      state.latestMinTemperature = null;
      state.latestMaxTemperature = null;
      state.nearestStationName = '';
      state.lastUpdatedReadingsTime = {};
      state.predictedXAxisLabel = '';
      state.xAxisLabel = {};
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
