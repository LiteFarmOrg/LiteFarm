import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { areaProperties, figureProperties, locationProperties } from './constants';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util/pick';
import { getDateInputFormat } from '../util/moment';

const gardenProperties = ['station_id', 'organic_status', 'transition_date', 'location_id'];
export const getLocationObjectFromGarden = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      area: pick(data, areaProperties),
    },
    garden: {
      ...pick(data, gardenProperties),
      organic_history: { effective_date: getDateInputFormat(), organic_status: data.organic_status },
    },
    ...pick(data, locationProperties),
  };
};
const getGardenFromLocationObject = (location) => {
  return {
    ...pick(location, locationProperties),
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.area, areaProperties),
    ...pick(location.garden, gardenProperties),
  };
};

const upsertOneGardenWithLocation = (state, { payload: location }) => {
  gardenAdapter.upsertOne(state, getGardenFromLocationObject(location));
};
const upsertManyGardenWithLocation = (state, { payload: locations }) => {
  gardenAdapter.upsertMany(
    state,
    locations.map((location) => getGardenFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};
const softDeleteGarden = (state, { payload: location_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  gardenAdapter.updateOne(state, { id: location_id, changes: { deleted: true } });
};

const gardenAdapter = createEntityAdapter({
  selectId: (garden) => garden.location_id,
});

const gardenSlice = createSlice({
  name: 'gardenReducer',
  initialState: gardenAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingGardenStart: onLoadingStart,
    onLoadingGardenFail: onLoadingFail,
    getGardensSuccess: upsertManyGardenWithLocation,
    postGardenSuccess: upsertOneGardenWithLocation,
    editGardenSuccess: upsertOneGardenWithLocation,
    deleteGardenSuccess: softDeleteGarden,
  },
});
export const {
  getGardensSuccess,
  postGardenSuccess,
  editGardenSuccess,
  onLoadingGardenStart,
  onLoadingGardenFail,
  deleteGardenSuccess,
} = gardenSlice.actions;
export default gardenSlice.reducer;

export const gardenReducerSelector = (state) => state.entitiesReducer[gardenSlice.name];

const gardenSelectors = gardenAdapter.getSelectors(
  (state) => state.entitiesReducer[gardenSlice.name],
);

export const gardenEntitiesSelector = gardenSelectors.selectEntities;
export const gardensSelector = createSelector(
  [gardenSelectors.selectAll, loginSelector],
  (gardens, { farm_id }) => {
    return gardens.filter((garden) => garden.farm_id === farm_id && !garden.deleted);
  },
);

export const gardenSelector = (location_id) =>
  createSelector(gardenEntitiesSelector, (entities) => entities[location_id]);

export const gardenStatusSelector = createSelector(
  [gardenReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
