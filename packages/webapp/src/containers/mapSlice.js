import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  successMessage: null,
  showSuccessHeader: false,
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
    showSuccessHeader: (state, { payload: showHeader }) => {
      state.showSuccessHeader = showHeader;
    },
    resetLocationData: (state) => initialState,
  },
});

export const {
  setLocationData,
  setSuccessMessage,
  showSuccessHeader,
  resetLocationData,
} = mapLocationReducer.actions;
export default mapLocationReducer.reducer;
export const locationInfoSelector = (state) => state?.tempStateReducer[mapLocationReducer.name];
export const setSuccessMessageSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].successMessage;
export const setShowSuccessHeaderSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].showSuccessHeader;
