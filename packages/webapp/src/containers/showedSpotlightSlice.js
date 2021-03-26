import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const initialState = {
  loaded: false,
  loading: false,
  map: false,
  draw_area: false,
  draw_line: false,
  drop_point: false,
  adjust_area: false,
  adjust_line: false,
};

const showedSpotlightSlice = createSlice({
  name: 'showedSpotlightReducer',
  initialState,
  reducers: {
    spotlightLoading: (state, action) => {
      state.loading = true;
    },
    getSpotlightFlagsSuccess: (state, { payload }) => {
      if (state.loading) {
        state.loading = false;
        Object.assign(state, payload);
      }
    },
    getSpotlightFlagsFailure: (state, action) => {
      state.loading = false;
    },
    patchSpotlightFlagsSuccess: (state, { payload }) => {
      if (state.loading) {
        state.loading = false;
        Object.assign(state, payload);
      }
    },
    patchSpotlightFlagsFailure: (state, action) => {
      state.loading = false;
    },
  },
});
export const {
  spotlightLoading,
  getSpotlightFlagsSuccess,
  getSpotlightFlagsFailure,
  patchSpotlightFlagsSuccess,
  patchSpotlightFlagsFailure,
} = showedSpotlightSlice.actions;
export default showedSpotlightSlice.reducer;
export const showedSpotlightSelector = (state) => state?.entitiesReducer[showedSpotlightSlice.name];
