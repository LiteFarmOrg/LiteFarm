import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { areaProperties, figureProperties, locationProperties } from './constants';
import { pick } from '../util/pick';

const farmSiteBoundaryProperties = ['location_id'];
export const getLocationObjectFromFarmSiteBoundary = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      area: pick(data, areaProperties),
    },
    farm_site_boundary: pick(data, farmSiteBoundaryProperties),
    ...pick(data, locationProperties),
  };
};
const getFarmSiteBoundaryFromLocationObject = (location) => {
  return {
    ...pick(location, locationProperties),

    ...pick(location.figure, figureProperties),
    ...pick(location.figure.area, areaProperties),
    ...pick(location.farm_site_boundary, farmSiteBoundaryProperties),
  };
};

const upsertOneFarmSiteBoundaryWithLocation = (state, { payload: location }) => {
  farmSiteBoundaryAdapter.upsertOne(state, getFarmSiteBoundaryFromLocationObject(location));
};
const upsertManyFarmSiteBoundaryWithLocation = (state, { payload: locations }) => {
  farmSiteBoundaryAdapter.upsertMany(
    state,
    locations.map((location) => getFarmSiteBoundaryFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};
const softDeleteFarmSiteBoundary = (state, { payload: location_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  farmSiteBoundaryAdapter.updateOne(state, { id: location_id, changes: { deleted: true } });
};

const farmSiteBoundaryAdapter = createEntityAdapter({
  selectId: (farmSiteBoundary) => farmSiteBoundary.location_id,
});

const farmSiteBoundarySlice = createSlice({
  name: 'farmSiteBoundaryReducer',
  initialState: farmSiteBoundaryAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingFarmSiteBoundaryStart: onLoadingStart,
    onLoadingFarmSiteBoundaryFail: onLoadingFail,
    getFarmSiteBoundarysSuccess: upsertManyFarmSiteBoundaryWithLocation,
    postFarmSiteBoundarySuccess: upsertOneFarmSiteBoundaryWithLocation,
    editFarmSiteBoundarySuccess: upsertOneFarmSiteBoundaryWithLocation,
    deleteFarmSiteBoundarySuccess: softDeleteFarmSiteBoundary,
  },
});
export const {
  getFarmSiteBoundarysSuccess,
  postFarmSiteBoundarySuccess,
  editFarmSiteBoundarySuccess,
  onLoadingFarmSiteBoundaryStart,
  onLoadingFarmSiteBoundaryFail,
  deleteFarmSiteBoundarySuccess,
} = farmSiteBoundarySlice.actions;
export default farmSiteBoundarySlice.reducer;

export const farmSiteBoundaryReducerSelector = (state) =>
  state.entitiesReducer[farmSiteBoundarySlice.name];

const farmSiteBoundarySelectors = farmSiteBoundaryAdapter.getSelectors(
  (state) => state.entitiesReducer[farmSiteBoundarySlice.name],
);

export const farmSiteBoundaryEntitiesSelector = farmSiteBoundarySelectors.selectEntities;
export const farmSiteBoundarysSelector = createSelector(
  [farmSiteBoundarySelectors.selectAll, loginSelector],
  (farmSiteBoundarys, { farm_id }) => {
    return farmSiteBoundarys.filter(
      (farmSiteBoundary) => farmSiteBoundary.farm_id === farm_id && !farmSiteBoundary.deleted,
    );
  },
);

export const farmSiteBoundarySelector = (location_id) =>
  createSelector(farmSiteBoundaryEntitiesSelector, (entities) => entities[location_id]);

export const farmSiteBoundaryStatusSelector = createSelector(
  [farmSiteBoundaryReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
