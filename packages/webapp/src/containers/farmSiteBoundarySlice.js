import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
import { areaProperties, figureProperties, locationProperties } from './locationSlice';

export const farmSiteBoundaryEnum = {
  farm_id: 'farm_id',
  name: 'name',
  figure_id: 'figure_id',
  type: 'type',
  location_id: 'location_id',
  total_area: 'total_area',
  total_area_unit: 'total_area_unit',
  grid_points: 'grid_points',
  perimeter: 'perimeter',
  perimeter_unit: 'perimeter_unit',
};
const farmSiteBoundaryProperties = [];
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
    farm_id: location.farm_id,
    name: location.name,
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
    deleteFarmSiteBoundarySuccess: farmSiteBoundaryAdapter.removeOne,
  },
});
export const {
  getFarmSiteBoundarysSuccess,
  postFarmSiteBoundarySuccess,
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
    return farmSiteBoundarys.filter((farmSiteBoundary) => farmSiteBoundary.farm_id === farm_id);
  },
);

export const farmSiteBoundarySelector = createSelector(
  farmSiteBoundaryReducerSelector,
  ({ location_id, entities }) => entities[location_id],
);

export const farmSiteBoundaryStatusSelector = createSelector(
  [farmSiteBoundaryReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
