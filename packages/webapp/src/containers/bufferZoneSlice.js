import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { figureProperties, lineProperties, locationProperties } from './locationSlice';
import { loginSelector, onLoadingFail, onLoadingStart, onLoadingSuccess } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

export const bufferZoneEnum = {
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
};

const bufferZoneProperties = [];
export const getLocationObjectFromBufferZone = (data) => {
  return {
    figure: {
      ...pick(data, figureProperties),
      line: pick(data, lineProperties),
    },
    buffer_zone: pick(data, bufferZoneProperties),
    ...pick(data, locationProperties),
  };
};
const getBufferZoneFromLocationObject = (location) => {
  return {
    farm_id: location.farm_id,
    name: location.name,
    ...pick(location.figure, figureProperties),
    ...pick(location.figure.line, lineProperties),
    ...pick(location.buffer_zone, bufferZoneProperties),
  };
};

const upsertOneBufferZoneWithLocation = (state, { payload: location }) => {
  bufferZoneAdapter.upsertOne(state, getBufferZoneFromLocationObject(location));
};
const upsertManyBufferZoneWithLocation = (state, { payload: locations }) => {
  bufferZoneAdapter.upsertMany(
    state,
    locations.map((location) => getBufferZoneFromLocationObject(location)),
  );
  onLoadingSuccess(state);
};

const bufferZoneAdapter = createEntityAdapter({
  selectId: (bufferZone) => bufferZone.location_id,
});

const bufferZoneSlice = createSlice({
  name: 'bufferZoneReducer',
  initialState: bufferZoneAdapter.getInitialState({
    loading: false,
    error: undefined,
    location_id: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingBufferZoneStart: onLoadingStart,
    onLoadingBufferZoneFail: onLoadingFail,
    getBufferZonesSuccess: upsertManyBufferZoneWithLocation,
    postBufferZoneSuccess: upsertOneBufferZoneWithLocation,
    deleteBufferZoneSuccess: bufferZoneAdapter.removeOne,
  },
});
export const {
  getBufferZonesSuccess,
  postBufferZoneSuccess,
  onLoadingBufferZoneStart,
  onLoadingBufferZoneFail,
  deleteBufferZoneSuccess,
} = bufferZoneSlice.actions;
export default bufferZoneSlice.reducer;

export const bufferZoneReducerSelector = (state) => state.entitiesReducer[bufferZoneSlice.name];

const bufferZoneSelectors = bufferZoneAdapter.getSelectors(
  (state) => state.entitiesReducer[bufferZoneSlice.name],
);

export const bufferZoneEntitiesSelector = bufferZoneSelectors.selectEntities;
export const bufferZonesSelector = createSelector(
  [bufferZoneSelectors.selectAll, loginSelector],
  (bufferZones, { farm_id }) => {
    return bufferZones.filter((bufferZone) => bufferZone.farm_id === farm_id);
  },
);

export const bufferZoneSelector = createSelector(
  bufferZoneReducerSelector,
  ({ location_id, entities }) => entities[location_id],
);

export const bufferZoneStatusSelector = createSelector(
  [bufferZoneReducerSelector],
  ({ loading, error, loaded }) => {
    return { loading, error, loaded };
  },
);
