import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { figureProperties, lineProperties, locationProperties } from './locationSlice';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

export const creekEnum = {
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
  includes_riparian_buffer: 'includes_riparian_buffer',
  used_for_irrigation: 'used_for_irrigation',
  buffer_width: 'buffer_width',
  buffer_width_unit: 'buffer_width_unit',
};

const creekProperties = [
  'used_for_irrigation',
  'includes_riparian_buffer',
  'buffer_width',
  'buffer_width_unit',
];
export const getLocationObjectFromCreek = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      line: pick(data, lineProperties),
    },
    creek: pick(data, creekProperties),
    ...pick(data, locationProperties),
  };
};
const getCreekFromLocationObject = (location) => {
  return {
    farm_id: location.farm_id,
    name: location.name,
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.line, lineProperties),
    ...pick(location.creek, creekProperties),
  };
};

const upsertOneCreekWithLocation = (state, { payload: location }) => {
  creekAdapter.upsertOne(state, getCreekFromLocationObject(location));
};
const upsertManyCreekWithLocation = (state, { payload: locations }) => {
  creekAdapter.upsertMany(
    state,
    locations.map((location) => getCreekFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};

const creekAdapter = createEntityAdapter({
  selectId: (creek) => creek.location_id,
});

const creekSlice = createSlice({
  name: 'creekReducer',
  initialState: creekAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingCreekStart: onLoadingStart,
    onLoadingCreekFail: onLoadingFail,
    getCreeksSuccess: upsertManyCreekWithLocation,
    postCreekSuccess: upsertOneCreekWithLocation,
    deleteCreekSuccess: creekAdapter.removeOne,
  },
});
export const {
  getCreeksSuccess,
  postCreekSuccess,
  onLoadingCreekStart,
  onLoadingCreekFail,
  deleteCreekSuccess,
} = creekSlice.actions;
export default creekSlice.reducer;

export const creekReducerSelector = (state) => state.entitiesReducer[creekSlice.name];

const creekSelectors = creekAdapter.getSelectors((state) => state.entitiesReducer[creekSlice.name]);

export const creekEntitiesSelector = creekSelectors.selectEntities;
export const creeksSelector = createSelector(
  [creekSelectors.selectAll, loginSelector],
  (creeks, { farm_id }) => {
    return creeks.filter((creek) => creek.farm_id === farm_id);
  },
);

export const creekSelector = createSelector(
  creekReducerSelector,
  ({ location_id, entities }) => entities[location_id],
);

export const creekStatusSelector = createSelector(
  [creekReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
