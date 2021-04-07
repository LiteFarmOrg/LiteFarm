import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
import { areaProperties, figureProperties, locationProperties } from './constants';

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
    ...pick(location, locationProperties),
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
    editResidenceSuccess: upsertOneResidenceWithLocation,
    deleteResidenceSuccess: residenceAdapter.removeOne,
  },
});
export const {
  getResidencesSuccess,
  postResidenceSuccess,
  editResidenceSuccess,
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

export const residenceSelector = (location_id) =>
  createSelector(residenceEntitiesSelector, (entities) => entities[location_id]);

export const residenceStatusSelector = createSelector(
  [residenceReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
