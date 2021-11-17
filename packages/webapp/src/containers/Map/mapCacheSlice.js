import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { loginSelector } from '../userFarmSlice';

const initialState = {
  maxZoom: undefined,
};

const mapCacheAdapter = createEntityAdapter({
  selectId: (farmState) => farmState.farm_id,
});

const mapCacheSlice = createSlice({
  name: 'mapCacheReducer',
  initialState: mapCacheAdapter.getInitialState(),
  reducers: {
    setMapCache: (state, { payload }) => {
      mapCacheAdapter.upsertOne(
        state,
        payload,
      );
    },
  },
});
export const {
  setMapCache,
} = mapCacheSlice.actions;
export default mapCacheSlice.reducer;

export const mapCacheReducerSelector = (state) =>
  state.persistedStateReducer[mapCacheSlice.name];
const mapCacheSelectors = mapCacheAdapter.getSelectors(
  (state) => state.persistedStateReducer[mapCacheSlice.name],
);
export const mapCacheSelector = createSelector(
  [mapCacheSelectors.selectEntities, loginSelector],
  (mapCacheEntities, { farm_id }) => {
    return mapCacheEntities[farm_id] || initialState;
  },
);
