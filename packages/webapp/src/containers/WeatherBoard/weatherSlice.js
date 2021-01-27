import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { loginSelector } from '../userFarmSlice';

const getWeather = (payload) => {
  const { city, date, farm_id, humidity, iconName, temperature, wind, measurement } = payload;
  return { city, date, farm_id, humidity, iconName, temperature, wind, measurement };
};

const weatherAdapter = createEntityAdapter({
  selectId: (weather) => weather.farm_id,
});

const updateWeather = (state, { payload }) => {
  weatherAdapter.upsertOne(state, {
    ...getWeather(payload),
    lastActiveDatetime: new Date().getTime(),
    loading: false,
    error: null,
    loaded: true,
  });
};

const weatherSlice = createSlice({
  name: 'weatherReducer',
  initialState: weatherAdapter.getInitialState(),
  reducers: {
    onLoadingWeatherStart: (state, { payload: farm_id }) => {
      weatherAdapter.upsertOne(state, { farm_id, loading: true });
    },
    onLoadingWeatherFail: (state, { payload: { farm_id, error } }) => {
      weatherAdapter.upsertOne(state, { farm_id, loading: false, loaded: true, error });
    },
    getWeatherSuccess: updateWeather,
  },
});
export const {
  onLoadingWeatherStart,
  onLoadingWeatherFail,
  getWeatherSuccess,
} = weatherSlice.actions;
export default weatherSlice.reducer;

export const weatherReducerSelector = (state) => state.entitiesReducer[weatherSlice.name];
const weatherSelectors = weatherAdapter.getSelectors(
  (state) => state.entitiesReducer[weatherSlice.name],
);
export const weatherSelector = createSelector(
  [weatherSelectors.selectEntities, loginSelector],
  (weatherEntities, { farm_id }) => {
    return weatherEntities[farm_id] || {};
  },
);
