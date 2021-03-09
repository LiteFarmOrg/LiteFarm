import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

export const naturalAreaEnum = {
  figure_id: 'figure_id',
  type: 'type',
  location_id: 'location_id',
  total_area: 'total_area',
  total_area_unit: 'total_area_unit',
  grid_points: 'grid_points',
  perimeter: 'perimeter',
  perimeter_unit: 'perimeter_unit',
};

const getNaturalAreaFromLocationObject = (location) => {
  return {
    farm_id: location.farm_id,
    name: location.name,
    ...pick(location.figure, ['figure_id', 'type', 'location_id']),
    ...pick(location.figure.area, [
      'total_area',
      'total_area_unit',
      'grid_points',
      'perimeter',
      'perimeter_unit',
    ]),
    ...pick(location.naturalArea, []),
  };
};

const upsertOneNaturalAreaWithLocation = (state, { payload: location }) => {
  naturalAreaAdapter.upsertOne(state, getNaturalAreaFromLocationObject(location));
};
const upsertManyNaturalAreaWithLocation = (state, { payload: locations }) => {
  naturalAreaAdapter.upsertMany(
    state,
    locations.map((location) => getNaturalAreaFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};

const naturalAreaAdapter = createEntityAdapter({
  selectId: (naturalArea) => naturalArea.location_id,
});

const naturalAreaSlice = createSlice({
  name: 'naturalAreaReducer',
  initialState: naturalAreaAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingNaturalAreaStart: onLoadingStart,
    onLoadingNaturalAreaFail: onLoadingFail,
    getNaturalAreasSuccess: upsertManyNaturalAreaWithLocation,
    postNaturalAreaSuccess: upsertOneNaturalAreaWithLocation,
    deleteNaturalAreaSuccess: naturalAreaAdapter.removeOne,
  },
});
export const {
  getNaturalAreasSuccess,
  postNaturalAreaSuccess,
  onLoadingNaturalAreaStart,
  onLoadingNaturalAreaFail,
  deleteNaturalAreaSuccess,
} = naturalAreaSlice.actions;
export default naturalAreaSlice.reducer;

export const naturalAreaReducerSelector = (state) => state.entitiesReducer[naturalAreaSlice.name];

const naturalAreaSelectors = naturalAreaAdapter.getSelectors(
  (state) => state.entitiesReducer[naturalAreaSlice.name],
);

export const naturalAreaEntitiesSelector = naturalAreaSelectors.selectEntities;
export const naturalAreasSelector = createSelector(
  [naturalAreaSelectors.selectAll, loginSelector],
  (naturalAreas, { farm_id }) => {
    return naturalAreas.filter((naturalArea) => naturalArea.farm_id === farm_id);
  },
);

export const naturalAreaSelector = createSelector(
  naturalAreaReducerSelector,
  ({ naturalArea_id, entities }) => entities[naturalArea_id],
);

export const naturalAreaStatusSelector = createSelector(
  [naturalAreaReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
