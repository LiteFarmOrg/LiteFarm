import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { figureProperties, lineProperties, locationProperties } from './locationSlice';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

export const fenceEnum = {
  farm_id: 'farm_id',
  name: 'name',
  figure_id: 'figure_id',
  type: 'type',
  location_id: 'location_id',
  length: 'length',
  width: 'width',
  line_points: 'line_points',
  length_unit: 'length_unit',
  width_unit: 'width_unit',
  pressure_treated: 'pressure_treated',
};

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
    farm_id: location.farm_id,
    name: location.name,
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

export const fenceSelector = createSelector(
  fenceReducerSelector,
  ({ location_id, entities }) => entities[location_id],
);

export const fenceStatusSelector = createSelector(
  [fenceReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
