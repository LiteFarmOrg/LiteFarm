import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
import { areaProperties, figureProperties, locationProperties } from './constants';

const greenHouseProperties = [
  'organic_status',
  'transition_date',
  'supplemental_lighting',
  'co2_enrichment',
  'greenhouse_heated',
];
export const getLocationObjectFromGreenHouse = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      area: pick(data, areaProperties),
    },
    greenhouse: pick(data, greenHouseProperties),
    ...pick(data, locationProperties),
  };
};
const getGreenhouseFromLocationObject = (location) => {
  return {
    farm_id: location.farm_id,
    name: location.name,
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
    deleteGreenhouseSuccess: greenhouseAdapter.removeOne,
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
    return greenhouses.filter((greenhouse) => greenhouse.farm_id === farm_id);
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
