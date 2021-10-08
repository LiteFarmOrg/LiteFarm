import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { figureProperties, locationProperties, pointProperties } from './constants';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util/pick';

const waterValveProperties = ['source', 'flow_rate', 'flow_rate_unit', 'location_id'];
export const getLocationObjectFromWaterValve = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      point: pick(data, pointProperties),
    },
    water_valve: pick(data, waterValveProperties),
    ...pick(data, locationProperties),
  };
};
const getWaterValveFromLocationObject = (location) => {
  return {
    ...pick(location, locationProperties),
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.point, pointProperties),
    ...pick(location.water_valve, waterValveProperties),
  };
};

const upsertOneWaterValveWithLocation = (state, { payload: location }) => {
  waterValveAdapter.upsertOne(state, getWaterValveFromLocationObject(location));
};
const upsertManyWaterValveWithLocation = (state, { payload: locations }) => {
  waterValveAdapter.upsertMany(
    state,
    locations.map((location) => getWaterValveFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};
const softDeleteWaterValve = (state, { payload: location_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  waterValveAdapter.updateOne(state, { id: location_id, changes: { deleted: true } });
};

const waterValveAdapter = createEntityAdapter({
  selectId: (waterValve) => waterValve.location_id,
});

const waterValveSlice = createSlice({
  name: 'waterValveReducer',
  initialState: waterValveAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingWaterValveStart: onLoadingStart,
    onLoadingWaterValveFail: onLoadingFail,
    getWaterValvesSuccess: upsertManyWaterValveWithLocation,
    postWaterValveSuccess: upsertOneWaterValveWithLocation,
    editWaterValveSuccess: upsertOneWaterValveWithLocation,
    deleteWaterValveSuccess: softDeleteWaterValve,
  },
});
export const {
  getWaterValvesSuccess,
  postWaterValveSuccess,
  editWaterValveSuccess,
  onLoadingWaterValveStart,
  onLoadingWaterValveFail,
  deleteWaterValveSuccess,
} = waterValveSlice.actions;
export default waterValveSlice.reducer;

export const waterValveReducerSelector = (state) => state.entitiesReducer[waterValveSlice.name];

const waterValveSelectors = waterValveAdapter.getSelectors(
  (state) => state.entitiesReducer[waterValveSlice.name],
);

export const waterValveEntitiesSelector = waterValveSelectors.selectEntities;
export const waterValvesSelector = createSelector(
  [waterValveSelectors.selectAll, loginSelector],
  (waterValves, { farm_id }) => {
    return waterValves.filter(
      (waterValve) => waterValve.farm_id === farm_id && !waterValve.deleted,
    );
  },
);

export const waterValveSelector = (location_id) =>
  createSelector(waterValveEntitiesSelector, (entities) => entities[location_id]);

export const waterValveStatusSelector = createSelector(
  [waterValveReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
