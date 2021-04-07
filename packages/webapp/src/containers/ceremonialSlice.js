import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
import { areaProperties, figureProperties, locationProperties } from './constants';

const ceremonialProperties = [];
export const getLocationObjectFromCeremonial = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      area: pick(data, areaProperties),
    },
    ceremonial_area: pick(data, ceremonialProperties),
    ...pick(data, locationProperties),
  };
};
const getCeremonialFromLocationObject = (location) => {
  return {
    farm_id: location.farm_id,
    name: location.name,
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.area, areaProperties),
    ...pick(location.ceremonial_area, ceremonialProperties),
  };
};

const upsertOneCeremonialWithLocation = (state, { payload: location }) => {
  ceremonialAdapter.upsertOne(state, getCeremonialFromLocationObject(location));
};
const upsertManyCeremonialWithLocation = (state, { payload: locations }) => {
  ceremonialAdapter.upsertMany(
    state,
    locations.map((location) => getCeremonialFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};

const ceremonialAdapter = createEntityAdapter({
  selectId: (ceremonial) => ceremonial.location_id,
});

const ceremonialSlice = createSlice({
  name: 'ceremonialReducer',
  initialState: ceremonialAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingCeremonialStart: onLoadingStart,
    onLoadingCeremonialFail: onLoadingFail,
    getCeremonialsSuccess: upsertManyCeremonialWithLocation,
    postCeremonialSuccess: upsertOneCeremonialWithLocation,
    editCeremonialSuccess: upsertOneCeremonialWithLocation,
    deleteCeremonialSuccess: ceremonialAdapter.removeOne,
  },
});
export const {
  getCeremonialsSuccess,
  postCeremonialSuccess,
  editCeremonialSuccess,
  onLoadingCeremonialStart,
  onLoadingCeremonialFail,
  deleteCeremonialSuccess,
} = ceremonialSlice.actions;
export default ceremonialSlice.reducer;

export const ceremonialReducerSelector = (state) => state.entitiesReducer[ceremonialSlice.name];

const ceremonialSelectors = ceremonialAdapter.getSelectors(
  (state) => state.entitiesReducer[ceremonialSlice.name],
);

export const ceremonialEntitiesSelector = ceremonialSelectors.selectEntities;
export const ceremonialsSelector = createSelector(
  [ceremonialSelectors.selectAll, loginSelector],
  (ceremonials, { farm_id }) => {
    return ceremonials.filter((ceremonial) => ceremonial.farm_id === farm_id);
  },
);

export const ceremonialSelector = (location_id) =>
  createSelector(ceremonialEntitiesSelector, (entities) => entities[location_id]);

export const ceremonialStatusSelector = createSelector(
  [ceremonialReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
