import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
import { areaProperties, figureProperties, locationProperties } from './locationSlice';

export const ceremonialEnum = {
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
    deleteCeremonialSuccess: ceremonialAdapter.removeOne,
  },
});
export const {
  getCeremonialsSuccess,
  postCeremonialSuccess,
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

export const ceremonialSelector = createSelector(
  ceremonialReducerSelector,
  ({ location_id, entities }) => entities[location_id],
);

export const ceremonialStatusSelector = createSelector(
  [ceremonialReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
