import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

export const greenhouseEnum = {
  figure_id: 'figure_id',
  type: 'type',
  location_id: 'location_id',
  total_area: 'total_area',
  total_area_unit: 'total_area_unit',
  grid_points: 'grid_points',
  perimeter: 'perimeter',
  perimeter_unit: 'perimeter_unit',
  organic_status: 'organic_status',
};

const getGreenhouseFromLocationObject = (location) => {
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
    ...pick(location.greenhouse, ['organic_status']),
  };
};

const upsertOneGreenhouseWithLocation = (state, { payload: location }) => {
  greenhouseAdapter.upsertOne(state, getGreenhouseFromLocationObject(location));
};
const upsertManyGreenhouseWithLocation = (state, { payload: locations }) => {
  greenhouseAdapter.upsertMany(
    state,
    locations.map((location) => getGreenhouseFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};

const greenhouseAdapter = createEntityAdapter({
  selectId: (greenhouse) => greenhouse.location_id,
});

const greenhouseSlice = createSlice({
  name: 'greenhouseReducer',
  initialState: greenhouseAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingGreenhouseStart: onLoadingStart,
    onLoadingGreenhouseFail: onLoadingFail,
    getGreenhousesSuccess: upsertManyGreenhouseWithLocation,
    postGreenhouseSuccess: upsertOneGreenhouseWithLocation,
    deleteGreenhouseSuccess: greenhouseAdapter.removeOne,
  },
});
export const {
  getGreenhousesSuccess,
  postGreenhouseSuccess,
  onLoadingGreenhouseStart,
  onLoadingGreenhouseFail,
  deleteGreenhouseSuccess,
} = greenhouseSlice.actions;
export default greenhouseSlice.reducer;

export const greenhouseReducerSelector = (state) => state.entitiesReducer[greenhouseSlice.name];

const greenhouseSelectors = greenhouseAdapter.getSelectors(
  (state) => state.entitiesReducer[greenhouseSlice.name],
);

export const greenhouseEntitiesSelector = greenhouseSelectors.selectEntities;
export const greenhousesSelector = createSelector(
  [greenhouseSelectors.selectAll, loginSelector],
  (greenhouses, { farm_id }) => {
    return greenhouses.filter((greenhouse) => greenhouse.farm_id === farm_id);
  },
);

export const greenhouseSelector = createSelector(
  greenhouseReducerSelector,
  ({ greenhouse_id, entities }) => entities[greenhouse_id],
);

export const greenhouseStatusSelector = createSelector(
  [greenhouseReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
