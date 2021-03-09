import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

export const fieldEnum = {
  figure_id: 'figure_id',
  type: 'type',
  location_id: 'location_id',
  total_area: 'total_area',
  total_area_unit: 'total_area_unit',
  grid_points: 'grid_points',
  perimeter: 'perimeter',
  perimeter_unit: 'perimeter_unit',
  station_id: 'station_id',
  organic_status: 'organic_status',
  transition_date: 'transition_date',
};

const getFieldFromLocationObject = (location) => {
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
    ...pick(location.field, ['station_id', 'organic_status', 'transition_date']),
  };
};

const upsertOneFieldWithLocation = (state, { payload: location }) => {
  fieldAdapter.upsertOne(state, getFieldFromLocationObject(location));
};
const upsertManyFieldWithLocation = (state, { payload: locations }) => {
  fieldAdapter.upsertMany(
    state,
    locations.map((location) => getFieldFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};

const fieldAdapter = createEntityAdapter({
  selectId: (field) => field.location_id,
});

const fieldSlice = createSlice({
  name: 'fieldReducer',
  initialState: fieldAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingFieldStart: onLoadingStart,
    onLoadingFieldFail: onLoadingFail,
    getFieldsSuccess: upsertManyFieldWithLocation,
    postFieldSuccess: upsertOneFieldWithLocation,
    deleteFieldSuccess: fieldAdapter.removeOne,
  },
});
export const {
  getFieldsSuccess,
  postFieldSuccess,
  onLoadingFieldStart,
  onLoadingFieldFail,
  deleteFieldSuccess,
} = fieldSlice.actions;
export default fieldSlice.reducer;

export const fieldReducerSelector = (state) => state.entitiesReducer[fieldSlice.name];

const fieldSelectors = fieldAdapter.getSelectors((state) => state.entitiesReducer[fieldSlice.name]);

export const fieldEntitiesSelector = fieldSelectors.selectEntities;
export const fieldsSelector = createSelector(
  [fieldSelectors.selectAll, loginSelector],
  (fields, { farm_id }) => {
    return fields.filter((field) => field.farm_id === farm_id);
  },
);

export const fieldSelector = createSelector(
  fieldReducerSelector,
  ({ field_id, entities }) => entities[field_id],
);

export const fieldStatusSelector = createSelector(
  [fieldReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
