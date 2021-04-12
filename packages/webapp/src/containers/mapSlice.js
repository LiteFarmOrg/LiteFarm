import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  successMessage: null,
  canShowSuccessHeader: false,
  canShowSelection: false,
  locations: [],
  showOverlappedLocations: [],
  resetOverlappedLocations: false,
};

const mapLocationReducer = createSlice({
  name: 'mapLocationReducer',
  initialState,
  reducers: {
    setSuccessMessage: (state, { payload: [locationType, action] }) => {
      state.successMessage = `${locationType}${action}`;
    },
    canShowSuccessHeader: (state, { payload: showHeader }) => {
      state.canShowSuccessHeader = showHeader;
    },
    canShowSelection: (state, { payload: showSelection }) => {
      state.canShowSelection = showSelection;
    },
    locations: (state, { payload: locationData }) => {
      state.locations = locationData;
    },
    showOverlappedLocations: (state, { payload: overlappedLocations }) => {
      state.showOverlappedLocations = overlappedLocations;
    },
    resetOverlappedLocations: (state, { payload: reset }) => {
      state.resetOverlappedLocations = reset;
    },
  },
});

export const {
  setSuccessMessage,
  canShowSuccessHeader,
  showOverlappedLocations,
  canShowSelection,
  locations,
  resetOverlappedLocations,
} = mapLocationReducer.actions;
export default mapLocationReducer.reducer;
export const locationInfoSelector = (state) => state?.tempStateReducer[mapLocationReducer.name];
export const setSuccessMessageSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].successMessage;
export const setShowSuccessHeaderSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].canShowSuccessHeader;
export const setOverlappedLocationsSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].storeOverlappedLocations;
export const canShowSelectionSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].canShowSelection;
export const locationsSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].locations;
export const resetOverlappedLocationsSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].resetOverlappedLocations;
