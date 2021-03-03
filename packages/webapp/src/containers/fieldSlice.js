import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

const getFieldFromLocationObject = (location) => {
  return {
    ...pick(location.figure, ['figure_id', 'type', 'location_id']),
    ...pick(location.figure.area, ['total_area', 'grid_points', 'perimeter']),
    ...pick(location.field, [
      'station_id',
      'organic_status',
      'transition_date',
      'main_color',
      'hover_color',
      'line_type',
    ]),
  };
};

const upsertOneFieldWithLocation = (state, { payload }) => {
  fieldAdapter.upsertOne(state, getFieldFromLocationObject(payload));
};

const fieldAdapter = createEntityAdapter({
  selectId: (field) => field.location_id,
});

const fieldSlice = createSlice({
  name: 'fieldReducer',
  initialState: fieldAdapter.getInitialState({
    loading: false,
    error: undefined,
    field_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingFieldStart: onLoadingStart,
    onLoadingFieldFail: onLoadingFail,
    onLoadingFieldSuccess: onLoadingSuccess,
    addOneField: upsertOneFieldWithLocation,
    deleteFieldSuccess: fieldAdapter.removeOne,
  },
});
export const {
  addOneField,
  onLoadingFieldStart,
  onLoadingFieldFail,
  deleteFieldSuccess,
  onLoadingFieldSuccess,
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
