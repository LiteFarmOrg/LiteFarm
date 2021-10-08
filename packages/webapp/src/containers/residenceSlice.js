import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { areaProperties, figureProperties, locationProperties } from './constants';
import { pick } from '../util/pick';

const residenceProperties = ['location_id'];
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
const softDeleteResidence = (state, { payload: location_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  residenceAdapter.updateOne(state, { id: location_id, changes: { deleted: true } });
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
    deleteResidenceSuccess: softDeleteResidence,
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
    return residences.filter((residence) => residence.farm_id === farm_id && !residence.deleted);
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
