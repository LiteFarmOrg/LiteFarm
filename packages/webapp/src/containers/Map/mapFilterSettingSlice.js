import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { loginSelector } from '../userFarmSlice';
import { areaSelector, lineSelector, pointSelector } from '../locationSlice';

const initialState = {
  field: true,
  garden: true,
  barn: true,
  ceremonial_area: true,
  greenhouse: true,
  surface_water: true,
  natural_area: true,
  residence: true,
  buffer_zone: true,
  watercourse: true,
  fence: true,
  gate: true,
  water_valve: true,
  farm_site_boundary: true,
  map_background: true,
  label: true,
};

const mapFilterSettingAdapter = createEntityAdapter({
  selectId: (farmState) => farmState.farm_id,
});

const mapFilterSettingSlice = createSlice({
  name: 'mapFilterSettingReducer',
  initialState: mapFilterSettingAdapter.getInitialState(),
  reducers: {
    setMapFilterSetting: (state, { payload }) => {
      mapFilterSettingAdapter.upsertOne(
        state,
        !state.ids.includes(payload.farm_id) ? { ...initialState, ...payload } : payload,
      );
    },
    setMapFilterShowAll: (state, { payload: farm_id }) => {
      mapFilterSettingAdapter.upsertOne(state, {
        farm_id,
        ...initialState,
        map_background: state.entities[farm_id] ? state.entities[farm_id].map_background : true,
      });
    },
    setMapFilterHideAll: (state, { payload: farm_id }) => {
      const offState = { ...initialState };
      for (const key in offState) {
        offState[key] = false;
      }
      mapFilterSettingAdapter.upsertOne(state, {
        farm_id,
        ...offState,
        map_background: state.entities[farm_id] ? state.entities[farm_id].map_background : true,
      });
    },
  },
});
export const {
  setMapFilterSetting,
  setMapFilterShowAll,
  setMapFilterHideAll,
} = mapFilterSettingSlice.actions;
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
export const availableFilterSettingsSelector = createSelector(
  [areaSelector, lineSelector, pointSelector],
  (area, line, point) => {
    return {
      area: Object.keys(area).filter((key) => area[key].length),
      line: Object.keys(line).filter((key) => line[key].length),
      point: Object.keys(point).filter((key) => point[key].length),
    };
  },
);
