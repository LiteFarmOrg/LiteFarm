import { createSlice } from '@reduxjs/toolkit';

export const initialState = {};

const mapLocationReducer = createSlice({
  name: 'mapLocationReducer',
  initialState,
  reducers: {
    setLocationData: (state, { payload: location }) => {
      Object.assign(state, location);
    },
    resetLocationData: (state) => initialState,
  },
});

export const { setLocationData, resetLocationData } = mapLocationReducer.actions;
export default mapLocationReducer.reducer;
export const locationInfoSelector = (state) => state?.tempStateReducer[mapLocationReducer.name];
