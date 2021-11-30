import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { areaProperties, figureProperties, locationProperties } from './constants';
import { pick } from '../util/pick';
import { getDateInputFormat } from '../util/moment';

const greenHouseProperties = [
  'organic_status',
  'transition_date',
  'supplemental_lighting',
  'co2_enrichment',
  'greenhouse_heated',
  'location_id',
];
export const getLocationObjectFromGreenHouse = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      area: pick(data, areaProperties),
    },
    greenhouse: {
      ...pick(data, greenHouseProperties),
      organic_history: { effective_date: getDateInputFormat(), organic_status: data.organic_status },
    },
    ...pick(data, locationProperties),
  };
};
const getGreenhouseFromLocationObject = (location) => {
  return {
    ...pick(location, locationProperties),
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.area, areaProperties),
    ...pick(location.greenhouse, greenHouseProperties),
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
const softDeleteGreenhouse = (state, { payload: location_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  greenhouseAdapter.updateOne(state, { id: location_id, changes: { deleted: true } });
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
    editGreenhouseSuccess: upsertOneGreenhouseWithLocation,
    deleteGreenhouseSuccess: softDeleteGreenhouse,
  },
});
export const {
  getGreenhousesSuccess,
  postGreenhouseSuccess,
  editGreenhouseSuccess,
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
    return greenhouses.filter(
      (greenhouse) => greenhouse.farm_id === farm_id && !greenhouse.deleted,
    );
  },
);

export const greenhouseSelector = (location_id) =>
  createSelector(greenhouseEntitiesSelector, (entities) => entities[location_id]);

export const greenhouseStatusSelector = createSelector(
  [greenhouseReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
