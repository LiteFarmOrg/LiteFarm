/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const addManySensorReadings = (state, { payload: sensorReadings }) => {
  mapSensorAdapter.upsertMany(state, sensorReadings);
};

const mapSensorAdapter = createEntityAdapter({
  selectId: (sensorReading) => sensorReading.reading_id,
});

const mapSensorSlice = createSlice({
  name: 'mapSensorReducer',
  initialState: mapSensorAdapter.getInitialState({
    loading: false,
    loaded: false,
    error: undefined,
  }),
  reducers: {
    onLoadingSensorReadingStart: (state) => {
      state.loading = true;
    },
    onLoadingSensorReadingFail: (state, { payload: error }) => {
      state.loading = false;
      state.error = error;
      state.loaded = true;
    },
    getSensorReadingSuccess: (state, { payload: sensorReadings }) => {
      addManySensorReadings(state, { payload: sensorReadings });
      state.loading = false;
      state.loaded = true;
      state.error = null;
    },
  },
});

export const { onLoadingSensorReadingStart, onLoadingSensorReadingFail, getSensorReadingSuccess } =
  mapSensorSlice.actions;
export default mapSensorSlice.reducer;

export const mapSensorReducerSelector = (state) => state.persistedStateReducer[mapSensorSlice.name];

const mapSensorSelectors = mapSensorAdapter.getSelectors(
  (state) => state.persistedStateReducer[mapSensorSlice.name],
);

export const mapSensorSelector = createSelector(
  [mapSensorSelectors.selectEntities],
  (mapSensorEntities) => {
    return mapSensorEntities;
  },
);
