import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  successMessage: null,
  canShowSuccessHeader: false,
};

const mapLocationReducer = createSlice({
  name: 'mapLocationReducer',
  initialState,
  reducers: {
    setLocationData: (state, { payload: location }) => {
      Object.assign(state, location);
    },
    setSuccessMessage: (state, { payload: [locationType, action] }) => {
      state.successMessage = `${locationType}${action}`;
    },
    canShowSuccessHeader: (state, { payload: showHeader }) => {
      state.canShowSuccessHeader = showHeader;
    },
    resetLocationData: (state) => initialState,
  },
});

export const {
  setLocationData,
  setSuccessMessage,
  canShowSuccessHeader,
  resetLocationData,
} = mapLocationReducer.actions;
export default mapLocationReducer.reducer;
export const locationInfoSelector = (state) => state?.tempStateReducer[mapLocationReducer.name];
export const setSuccessMessageSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].successMessage;
export const setShowSuccessHeaderSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].canShowSuccessHeader;
