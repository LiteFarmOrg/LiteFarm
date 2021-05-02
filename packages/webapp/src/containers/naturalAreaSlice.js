import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
import { areaProperties, figureProperties, locationProperties } from './constants';

const naturalAreaProperties = ['location_id'];
export const getLocationObjectFromNaturalArea = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      area: pick(data, areaProperties),
    },
    natural_area: pick(data, naturalAreaProperties),
    ...pick(data, locationProperties),
  };
};
const getNaturalAreaFromLocationObject = (location) => {
  return {
    ...pick(location, locationProperties),
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.area, areaProperties),
    ...pick(location.natural_area, naturalAreaProperties),
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
    editNaturalAreaSuccess: upsertOneNaturalAreaWithLocation,
    deleteNaturalAreaSuccess: naturalAreaAdapter.removeOne,
  },
});
export const {
  getNaturalAreasSuccess,
  postNaturalAreaSuccess,
  editNaturalAreaSuccess,
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

export const naturalAreaSelector = (location_id) =>
  createSelector(naturalAreaEntitiesSelector, (entities) => entities[location_id]);

export const naturalAreaStatusSelector = createSelector(
  [naturalAreaReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
