import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { loginSelector } from '../userFarmSlice';

const initialState = {
  field: true,
  barn: true,
  ceremonial_area: true,
  greenhouse: true,
  ground_water: true,
  natural_area: true,
  buffer_zone: true,
  creek: true,
  fence: true,
  gate: true,
  water_valve: true,
  farm_bound: true,
  map_background: true,
};

const mapFilterSettingAdapter = createEntityAdapter({
  selectId: (farmState) => farmState.farm_id,
});

const mapFilterSettingSlice = createSlice({
  name: 'mapFilterSettingReducer',
  initialState: mapFilterSettingAdapter.getInitialState(),
  reducers: {
    setMapFilterSetting: (state, { payload }) => {
      if (!state.hasOwnProperty(payload.farm_id)) {
        Object.assign(state, initialState);
      }
      mapFilterSettingAdapter.upsertOne(state, payload);
    },
  },
});
export const { setMapFilterSetting } = mapFilterSettingSlice.actions;
export default mapFilterSettingSlice.reducer;

export const mapFilterSettingReducerSelector = (state) =>
  state.persistedStateReducer[mapFilterSettingSlice.name];
const mapFilterSettingSelectors = mapFilterSettingAdapter.getSelectors(
  (state) => state.persistedStateReducer[mapFilterSettingSlice.name],
);
export const mapFilterSettingSelector = createSelector(
  [mapFilterSettingSelectors.selectEntities, loginSelector],
  (mapFilterSettingEntities, { farm_id }) => {
    return mapFilterSettingEntities[farm_id] || initialState;
  },
);
