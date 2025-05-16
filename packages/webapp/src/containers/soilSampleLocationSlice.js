/*
 *  Copyright 2025 LiteFarm.org
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
import { figureProperties, locationProperties, pointProperties } from './constants';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util/pick';

const soilSampleLocationProperties = ['location_id'];
export const getLocationObjectFromSoilSampleLocation = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      point: pick(data, pointProperties),
    },
    soil_sample_location: pick(data, soilSampleLocationProperties),
    ...pick(data, locationProperties),
  };
};
const getSoilSampleLocationFromLocationObject = (location) => {
  return {
    ...pick(location, locationProperties),
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.point, pointProperties),
    ...pick(location.soil_sample_location, soilSampleLocationProperties),
  };
};

const upsertOneSoilSampleLocationWithLocation = (state, { payload: location }) => {
  soilSampleLocationAdapter.upsertOne(state, getSoilSampleLocationFromLocationObject(location));
};
const upsertManySoilSampleLocationWithLocation = (state, { payload: locations }) => {
  soilSampleLocationAdapter.upsertMany(
    state,
    locations.map((location) => getSoilSampleLocationFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};
const softDeleteSoilSampleLocation = (state, { payload: location_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  soilSampleLocationAdapter.updateOne(state, { id: location_id, changes: { deleted: true } });
};

const soilSampleLocationAdapter = createEntityAdapter({
  selectId: (soil_sample_location) => soil_sample_location.location_id,
});

const soilSampleLocationSlice = createSlice({
  name: 'soilSampleLocationReducer',
  initialState: soilSampleLocationAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingSoilSampleLocationStart: onLoadingStart,
    onLoadingSoilSampleLocationFail: onLoadingFail,
    getSoilSampleLocationsSuccess: upsertManySoilSampleLocationWithLocation,
    postSoilSampleLocationSuccess: upsertOneSoilSampleLocationWithLocation,
    editSoilSampleLocationSuccess: upsertOneSoilSampleLocationWithLocation,
    deleteSoilSampleLocationSuccess: softDeleteSoilSampleLocation,
  },
});
export const {
  getSoilSampleLocationsSuccess,
  postSoilSampleLocationSuccess,
  editSoilSampleLocationSuccess,
  onLoadingSoilSampleLocationStart,
  onLoadingSoilSampleLocationFail,
  deleteSoilSampleLocationSuccess,
} = soilSampleLocationSlice.actions;
export default soilSampleLocationSlice.reducer;

export const soilSampleLocationReducerSelector = (state) =>
  state.entitiesReducer[soilSampleLocationSlice.name];

const soilSampleLocationSelectors = soilSampleLocationAdapter.getSelectors(
  (state) => state.entitiesReducer[soilSampleLocationSlice.name],
);

export const soilSampleLocationEntitiesSelector = soilSampleLocationSelectors.selectEntities;
export const soilSampleLocationsSelector = createSelector(
  [soilSampleLocationSelectors.selectAll, loginSelector],
  (soilSampleLocations, { farm_id }) => {
    return soilSampleLocations.filter(
      (soil_sample_location) =>
        soil_sample_location.farm_id === farm_id && !soil_sample_location.deleted,
    );
  },
);

export const soilSampleLocationSelector = (location_id) =>
  createSelector(soilSampleLocationEntitiesSelector, (entities) => entities[location_id]);

export const soilSampleLocationStatusSelector = createSelector(
  [soilSampleLocationReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
