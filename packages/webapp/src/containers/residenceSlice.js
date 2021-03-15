import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
import { areaProperties, figureProperties, locationProperties } from './constants';

export const residenceEnum = {
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
const residenceProperties = [];
export const getLocationObjectFromResidence = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      area: pick(data, areaProperties),
    },
    residence: pick(data, residenceProperties),
    ...pick(data, locationProperties),
  };
};
const getResidenceFromLocationObject = (location) => {
  return {
    farm_id: location.farm_id,
    name: location.name,
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.area, areaProperties),
    ...pick(location.residence, residenceProperties),
  };
};

const upsertOneResidenceWithLocation = (state, { payload: location }) => {
  residenceAdapter.upsertOne(state, getResidenceFromLocationObject(location));
};
const upsertManyResidenceWithLocation = (state, { payload: locations }) => {
  residenceAdapter.upsertMany(
    state,
    locations.map((location) => getResidenceFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};

const residenceAdapter = createEntityAdapter({
  selectId: (residence) => residence.location_id,
});

const residenceSlice = createSlice({
  name: 'residenceReducer',
  initialState: residenceAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingResidenceStart: onLoadingStart,
    onLoadingResidenceFail: onLoadingFail,
    getResidencesSuccess: upsertManyResidenceWithLocation,
    postResidenceSuccess: upsertOneResidenceWithLocation,
    deleteResidenceSuccess: residenceAdapter.removeOne,
  },
});
export const {
  getResidencesSuccess,
  postResidenceSuccess,
  onLoadingResidenceStart,
  onLoadingResidenceFail,
  deleteResidenceSuccess,
} = residenceSlice.actions;
export default residenceSlice.reducer;

export const residenceReducerSelector = (state) => state.entitiesReducer[residenceSlice.name];

const residenceSelectors = residenceAdapter.getSelectors(
  (state) => state.entitiesReducer[residenceSlice.name],
);

export const residenceEntitiesSelector = residenceSelectors.selectEntities;
export const residencesSelector = createSelector(
  [residenceSelectors.selectAll, loginSelector],
  (residences, { farm_id }) => {
    return residences.filter((residence) => residence.farm_id === farm_id);
  },
);

export const residenceSelector = createSelector(
  residenceReducerSelector,
  ({ location_id, entities }) => entities[location_id],
);

export const residenceStatusSelector = createSelector(
  [residenceReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
