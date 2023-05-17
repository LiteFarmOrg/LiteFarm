import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { loginSelector } from '../userFarmSlice';

const initialState = {
  maxZoom: undefined,
  previousMaxZoom: undefined,
  retrievedPoints: [],
};

const mapCacheAdapter = createEntityAdapter({
  selectId: (farmState) => farmState.farm_id,
});

const mapCacheSlice = createSlice({
  name: 'mapCacheReducer',
  initialState: mapCacheAdapter.getInitialState(),
  reducers: {
    setMapCache: (state, { payload }) => {
      const { farm_id } = payload;
      const entity = state.entities[farm_id];
      if (entity?.maxZoom) {
        mapCacheAdapter.updateOne(state, {
          id: farm_id,
          changes: { previousMaxZoom: entity.maxZoom },
        });
      }
      mapCacheAdapter.upsertOne(state, payload);
    },
    setRetrievedPoints: (state, { payload }) => {
      const { farm_id, retrievedPoints } = payload;
      mapCacheAdapter.updateOne(state, { id: farm_id, changes: { retrievedPoints } });
    },
  },
});
export const { setMapCache, setRetrievedPoints } = mapCacheSlice.actions;
export default mapCacheSlice.reducer;

export const mapCacheReducerSelector = (state) => state.persistedStateReducer[mapCacheSlice.name];
const mapCacheSelectors = mapCacheAdapter.getSelectors(
  (state) => state.persistedStateReducer[mapCacheSlice.name],
);
export const mapCacheSelector = createSelector(
  [mapCacheSelectors.selectEntities, loginSelector],
  (mapCacheEntities, { farm_id }) => {
    return mapCacheEntities[farm_id] || initialState;
  },
);
