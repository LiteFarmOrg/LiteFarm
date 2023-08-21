import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { areaProperties, figureProperties, locationProperties } from './constants';
import { pick } from '../util/pick';

const ceremonialProperties = ['location_id'];
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
    ...pick(location, locationProperties),

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
const softDeleteCeremonial = (state, { payload: location_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  ceremonialAdapter.updateOne(state, { id: location_id, changes: { deleted: true } });
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
    deleteCeremonialSuccess: softDeleteCeremonial,
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
    return ceremonials.filter(
      (ceremonial) => ceremonial.farm_id === farm_id && !ceremonial.deleted,
    );
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
