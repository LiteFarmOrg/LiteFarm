import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { figureProperties, locationProperties, pointProperties } from './constants';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util/pick';

const sensorProperties = [
  'depth',
  'elevation',
  'external_id',
  'name',
  'location_id',
  'sensor_id',
  'partner_id',
];

const getSensorFromLocationObject = (location) => {
  const result = {
    ...pick(location, locationProperties),
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.point, pointProperties),
    ...pick(location.sensor, sensorProperties),
    sensor_reading_types: [],
  };
  console.log(result);
  return result;
};

const upsertOneSensorWithLocation = (state, { payload: location }) => {
  sensorAdapter.upsertOne(state, getSensorFromLocationObject(location));
};
const upsertManySensorWithLocation = (state, { payload: locations }) => {
  sensorAdapter.upsertMany(
    state,
    locations.map((location) => getSensorFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};
const softDeleteSensor = (state, { payload: location_id }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  sensorAdapter.updateOne(state, { id: location_id, changes: { deleted: true } });
};

const upsertSensorReadingTypes = (state, { payload: location_id, sensor_reading_types }) => {
  sensorAdapter.updateOne(state, { id: location_id, changes: { sensor_reading_types } });
};

const sensorAdapter = createEntityAdapter({
  selectId: (sensor) => sensor.location_id,
});

const sensorSlice = createSlice({
  name: 'sensorReducer',
  initialState: sensorAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingSensorStart: onLoadingStart,
    onLoadingSensorFail: onLoadingFail,
    getSensorSuccess: upsertManySensorWithLocation,
    postManySensorsSuccess: upsertManySensorWithLocation,
    postSensorSuccess: upsertOneSensorWithLocation,
    editSensorSuccess: upsertOneSensorWithLocation,
    deleteSensorSuccess: softDeleteSensor,
    onSensorReadingTypesSuccess: upsertSensorReadingTypes,
  },
});
export const {
  getSensorSuccess,
  postSensorSuccess,
  editSensorSuccess,
  onLoadingSensorStart,
  onLoadingSensorFail,
  deleteSensorSuccess,
  postManySensorsSuccess,
} = sensorSlice.actions;
export default sensorSlice.reducer;

export const sensorReducerSelector = (state) => state.entitiesReducer[sensorSlice.name];

const sensorSelectors = sensorAdapter.getSelectors(
  (state) => state.entitiesReducer[sensorSlice.name],
);

export const sensorEntitiesSelector = sensorSelectors.selectEntities;
export const sensorSelector = createSelector(
  [sensorSelectors.selectAll, loginSelector],
  (Sensor, { farm_id }) => {
    return Sensor.filter((Sensor) => Sensor.farm_id === farm_id && !Sensor.deleted);
  },
);

export const sensorsSelector = (location_id) =>
  createSelector(sensorEntitiesSelector, (entities) => entities[location_id]);

export const sensorStatusSelector = createSelector(
  [sensorReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
