import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { loginSelector } from '../userFarmSlice';

const initialState = {
  addDrawer: false,
};

const mapAddDrawerAdapter = createEntityAdapter({
  selectId: (farmState) => farmState.farm_id,
});

const mapAddDrawerSlice = createSlice({
  name: 'mapAddDrawerReducer',
  initialState: mapAddDrawerAdapter.getInitialState(),
  reducers: {
    setMapAddDrawerShow: (state, { payload: farm_id }) => {
      mapAddDrawerAdapter.upsertOne(state, { farm_id, addDrawer: true });
    },
    setMapAddDrawerHide: (state, { payload: farm_id }) => {
      mapAddDrawerAdapter.upsertOne(state, { farm_id, addDrawer: false });
    },
  },
});
export const { setMapAddDrawerShow, setMapAddDrawerHide } = mapAddDrawerSlice.actions;
export default mapAddDrawerSlice.reducer;

export const mapAddDrawerReducerSelector = (state) => state.entitiesReducer[mapAddDrawerSlice.name];
const mapAddDrawerSelectors = mapAddDrawerAdapter.getSelectors(
  (state) => state.entitiesReducer[mapAddDrawerSlice.name],
);
export const mapAddDrawerSelector = createSelector(
  [mapAddDrawerSelectors.selectEntities, loginSelector],
  (mapAddDrawerEntities, { farm_id }) => {
    return mapAddDrawerEntities[farm_id] || initialState;
  },
);
