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

const addManySensorReadingTypes = (state, { payload: sensorReadingsTypes }) => {
  sensorReadingTypesAdapter.upsertMany(state, sensorReadingsTypes);
};

const sensorReadingTypesAdapter = createEntityAdapter({
  selectId: (sensorReadingType) => sensorReadingType.location_id,
});

const sensorReadingTypesSlice = createSlice({
  name: 'sensorReadingTypesReducer',
  initialState: sensorReadingTypesAdapter.getInitialState({
    loading: false,
    loaded: false,
    error: undefined,
  }),
  reducers: {
    onLoadingSensorReadingTypesStart: (state) => {
      state.loading = true;
    },
    onLoadingSensorReadingTypesFail: (state, { payload: error }) => {
      state.loading = false;
      state.error = error;
      state.loaded = true;
    },
    getSensorReadingTypesSuccess: (state, { payload: sensorReadingsTypes }) => {
      addManySensorReadingTypes(state, { payload: sensorReadingsTypes });
      state.loading = false;
      state.loaded = true;
      state.error = null;
    },
  },
});

export const {
  onLoadingSensorReadingTypesStart,
  onLoadingSensorReadingTypesFail,
  getSensorReadingTypesSuccess,
} = sensorReadingTypesSlice.actions;
export default sensorReadingTypesSlice.reducer;

export const sensorReadingTypesReducerSelector = (state) =>
  state.persistedStateReducer[sensorReadingTypesSlice.name];

const sensorReadingTypesSelectors = sensorReadingTypesAdapter.getSelectors(
  (state) => state.persistedStateReducer[sensorReadingTypesSlice.name],
);

export const sensorReadingTypesSelector = createSelector(
  [sensorReadingTypesSelectors.selectEntities],
  (sensorReadingTypesEntities) => {
    return sensorReadingTypesEntities;
  },
);

export const sensorReadingTypesByLocationSelector = (locationId) => {
  return createSelector(
    [sensorReadingTypesSelectors.selectEntities],
    (sensorReadingTypesEntities) => {
      return sensorReadingTypesEntities[locationId];
    },
  );
};
