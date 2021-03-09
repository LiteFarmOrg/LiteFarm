import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

export const groundwaterEnum = {
  figure_id: 'figure_id',
  type: 'type',
  location_id: 'location_id',
  total_area: 'total_area',
  total_area_unit: 'total_area_unit',
  grid_points: 'grid_points',
  perimeter: 'perimeter',
  perimeter_unit: 'perimeter_unit',
  user_for_irrigation: 'user_for_irrigation',
};

const getGroundwaterFromLocationObject = (location) => {
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
    ...pick(location.groundwater, ['user_for_irrigation']),
  };
};

const upsertOneGroundwaterWithLocation = (state, { payload: location }) => {
  groundwaterAdapter.upsertOne(state, getGroundwaterFromLocationObject(location));
};
const upsertManyGroundwaterWithLocation = (state, { payload: locations }) => {
  groundwaterAdapter.upsertMany(
    state,
    locations.map((location) => getGroundwaterFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};

const groundwaterAdapter = createEntityAdapter({
  selectId: (groundwater) => groundwater.location_id,
});

const groundwaterSlice = createSlice({
  name: 'groundwaterReducer',
  initialState: groundwaterAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingGroundwaterStart: onLoadingStart,
    onLoadingGroundwaterFail: onLoadingFail,
    getGroundwatersSuccess: upsertManyGroundwaterWithLocation,
    postGroundwaterSuccess: upsertOneGroundwaterWithLocation,
    deleteGroundwaterSuccess: groundwaterAdapter.removeOne,
  },
});
export const {
  getGroundwatersSuccess,
  postGroundwaterSuccess,
  onLoadingGroundwaterStart,
  onLoadingGroundwaterFail,
  deleteGroundwaterSuccess,
} = groundwaterSlice.actions;
export default groundwaterSlice.reducer;

export const groundwaterReducerSelector = (state) => state.entitiesReducer[groundwaterSlice.name];

const groundwaterSelectors = groundwaterAdapter.getSelectors(
  (state) => state.entitiesReducer[groundwaterSlice.name],
);

export const groundwaterEntitiesSelector = groundwaterSelectors.selectEntities;
export const groundwatersSelector = createSelector(
  [groundwaterSelectors.selectAll, loginSelector],
  (groundwaters, { farm_id }) => {
    return groundwaters.filter((groundwater) => groundwater.farm_id === farm_id);
  },
);

export const groundwaterSelector = createSelector(
  groundwaterReducerSelector,
  ({ groundwater_id, entities }) => entities[groundwater_id],
);

export const groundwaterStatusSelector = createSelector(
  [groundwaterReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
