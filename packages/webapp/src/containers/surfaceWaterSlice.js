import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
import { areaProperties, figureProperties, locationProperties } from './constants';

const surfaceWaterProperties = ['used_for_irrigation'];
export const getLocationObjectFromSurfaceWater = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      area: pick(data, areaProperties),
    },
    surface_water: pick(data, surfaceWaterProperties),
    ...pick(data, locationProperties),
  };
};
const getSurfaceWaterFromLocationObject = (location) => {
  return {
    farm_id: location.farm_id,
    name: location.name,
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.area, areaProperties),
    ...pick(location.surface_water, surfaceWaterProperties),
  };
};

const upsertOneSurfaceWaterWithLocation = (state, { payload: location }) => {
  surfaceWaterAdapter.upsertOne(state, getSurfaceWaterFromLocationObject(location));
};
const upsertManySurfaceWaterWithLocation = (state, { payload: locations }) => {
  surfaceWaterAdapter.upsertMany(
    state,
    locations.map((location) => getSurfaceWaterFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};

const surfaceWaterAdapter = createEntityAdapter({
  selectId: (surfaceWater) => surfaceWater.location_id,
});

const surfaceWaterSlice = createSlice({
  name: 'surfaceWaterReducer',
  initialState: surfaceWaterAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingSurfaceWaterStart: onLoadingStart,
    onLoadingSurfaceWaterFail: onLoadingFail,
    getSurfaceWatersSuccess: upsertManySurfaceWaterWithLocation,
    postSurfaceWaterSuccess: upsertOneSurfaceWaterWithLocation,
    editSurfaceWaterSuccess: upsertOneSurfaceWaterWithLocation,
    deleteSurfaceWaterSuccess: surfaceWaterAdapter.removeOne,
  },
});
export const {
  getSurfaceWatersSuccess,
  postSurfaceWaterSuccess,
  editSurfaceWaterSuccess,
  onLoadingSurfaceWaterStart,
  onLoadingSurfaceWaterFail,
  deleteSurfaceWaterSuccess,
} = surfaceWaterSlice.actions;
export default surfaceWaterSlice.reducer;

export const surfaceWaterReducerSelector = (state) => state.entitiesReducer[surfaceWaterSlice.name];

const surfaceWaterSelectors = surfaceWaterAdapter.getSelectors(
  (state) => state.entitiesReducer[surfaceWaterSlice.name],
);

export const surfaceWaterEntitiesSelector = surfaceWaterSelectors.selectEntities;
export const surfaceWatersSelector = createSelector(
  [surfaceWaterSelectors.selectAll, loginSelector],
  (surfaceWaters, { farm_id }) => {
    return surfaceWaters.filter((surfaceWater) => surfaceWater.farm_id === farm_id);
  },
);

export const surfaceWaterSelector = createSelector(
  surfaceWaterReducerSelector,
  ({ location_id, entities }) => entities[location_id],
);

export const surfaceWaterStatusSelector = createSelector(
  [surfaceWaterReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
