import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { figureProperties, lineProperties, locationProperties } from './constants';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

const fenceProperties = ['pressure_treated'];
export const getLocationObjectFromFence = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      line: pick(data, lineProperties),
    },
    fence: pick(data, fenceProperties),
    ...pick(data, locationProperties),
  };
};
const getFenceFromLocationObject = (location) => {
  return {
    ...pick(location, locationProperties),
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.line, lineProperties),
    ...pick(location.fence, fenceProperties),
  };
};

const upsertOneFenceWithLocation = (state, { payload: location }) => {
  fenceAdapter.upsertOne(state, getFenceFromLocationObject(location));
};
const upsertManyFenceWithLocation = (state, { payload: locations }) => {
  fenceAdapter.upsertMany(
    state,
    locations.map((location) => getFenceFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};

const fenceAdapter = createEntityAdapter({
  selectId: (fence) => fence.location_id,
});

const fenceSlice = createSlice({
  name: 'fenceReducer',
  initialState: fenceAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingFenceStart: onLoadingStart,
    onLoadingFenceFail: onLoadingFail,
    getFencesSuccess: upsertManyFenceWithLocation,
    postFenceSuccess: upsertOneFenceWithLocation,
    deleteFenceSuccess: fenceAdapter.removeOne,
  },
});
export const {
  getFencesSuccess,
  postFenceSuccess,
  onLoadingFenceStart,
  onLoadingFenceFail,
  deleteFenceSuccess,
} = fenceSlice.actions;
export default fenceSlice.reducer;

export const fenceReducerSelector = (state) => state.entitiesReducer[fenceSlice.name];

const fenceSelectors = fenceAdapter.getSelectors((state) => state.entitiesReducer[fenceSlice.name]);

export const fenceEntitiesSelector = fenceSelectors.selectEntities;
export const fencesSelector = createSelector(
  [fenceSelectors.selectAll, loginSelector],
  (fences, { farm_id }) => {
    return fences.filter((fence) => fence.farm_id === farm_id);
  },
);

export const fenceSelector = (location_id) =>
  createSelector(fenceEntitiesSelector, (entities) => entities[location_id]);

export const fenceStatusSelector = createSelector(
  [fenceReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
