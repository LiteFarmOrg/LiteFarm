import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { areaProperties, figureProperties, locationProperties } from './constants';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

const fieldProperties = ['station_id', 'organic_status', 'transition_date'];
export const getLocationObjectFromField = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      area: pick(data, areaProperties),
    },
    field: pick(data, fieldProperties),
    ...pick(data, locationProperties),
  };
};
const getFieldFromLocationObject = (location) => {
  return {
    ...pick(location, locationProperties),
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.area, areaProperties),
    ...pick(location.field, fieldProperties),
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
    editFieldSuccess: upsertOneFieldWithLocation,
    deleteFieldSuccess: fieldAdapter.removeOne,
  },
});
export const {
  getFieldsSuccess,
  postFieldSuccess,
  editFieldSuccess,
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

export const fieldSelector = (location_id) =>
  createSelector(fieldEntitiesSelector, (entities) => entities[location_id]);

export const fieldStatusSelector = createSelector(
  [fieldReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
