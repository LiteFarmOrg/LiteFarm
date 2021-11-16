import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { figureProperties, lineProperties, locationProperties } from './constants';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util/pick';

export const watercourseEnum = {
  farm_id: 'farm_id',
  name: 'name',
  figure_id: 'figure_id',
  type: 'type',
  location_id: 'location_id',
  notes: 'notes',
  length: 'length',
  width: 'width',
  line_points: 'line_points',
  length_unit: 'length_unit',
  width_unit: 'width_unit',
  includes_riparian_buffer: 'includes_riparian_buffer',
  used_for_irrigation: 'used_for_irrigation',
  buffer_width: 'buffer_width',
  buffer_width_unit: 'buffer_width_unit',
};

const watercourseProperties = [
  'used_for_irrigation',
  'includes_riparian_buffer',
  'buffer_width',
  'buffer_width_unit',
  'location_id',
];
export const getLocationObjectFromWatercourse = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      line: pick(data, lineProperties),
    },
    watercourse: pick(data, watercourseProperties),
    ...pick(data, locationProperties),
  };
};
const getWatercourseFromLocationObject = (location) => {
  return {
    ...pick(location, locationProperties),
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.line, lineProperties),
    ...pick(location.watercourse, watercourseProperties),
  };
};

const upsertOneWatercourseWithLocation = (state, { payload: location }) => {
  watercourseAdapter.upsertOne(state, getWatercourseFromLocationObject(location));
};
const upsertManyWatercourseWithLocation = (state, { payload: locations }) => {
  watercourseAdapter.upsertMany(
    state,
    locations.map((location) => getWatercourseFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};
const softDeleteWatercourse = (state, { payload: location_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  watercourseAdapter.updateOne(state, { id: location_id, changes: { deleted: true } });
};

const watercourseAdapter = createEntityAdapter({
  selectId: (watercourse) => watercourse.location_id,
});

const watercourseSlice = createSlice({
  name: 'watercourseReducer',
  initialState: watercourseAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingWatercourseStart: onLoadingStart,
    onLoadingWatercourseFail: onLoadingFail,
    getWatercoursesSuccess: upsertManyWatercourseWithLocation,
    postWatercourseSuccess: upsertOneWatercourseWithLocation,
    editWatercourseSuccess: upsertOneWatercourseWithLocation,
    deleteWatercourseSuccess: softDeleteWatercourse,
  },
});
export const {
  getWatercoursesSuccess,
  postWatercourseSuccess,
  editWatercourseSuccess,
  onLoadingWatercourseStart,
  onLoadingWatercourseFail,
  deleteWatercourseSuccess,
} = watercourseSlice.actions;
export default watercourseSlice.reducer;

export const watercourseReducerSelector = (state) => state.entitiesReducer[watercourseSlice.name];

const watercourseSelectors = watercourseAdapter.getSelectors(
  (state) => state.entitiesReducer[watercourseSlice.name],
);

export const watercourseEntitiesSelector = watercourseSelectors.selectEntities;
export const watercoursesSelector = createSelector(
  [watercourseSelectors.selectAll, loginSelector],
  (watercourses, { farm_id }) => {
    return watercourses.filter(
      (watercourse) => watercourse.farm_id === farm_id && !watercourse.deleted,
    );
  },
);

export const watercourseSelector = (location_id) =>
  createSelector(watercourseEntitiesSelector, (entities) => entities[location_id]);

export const watercourseStatusSelector = createSelector(
  [watercourseReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
