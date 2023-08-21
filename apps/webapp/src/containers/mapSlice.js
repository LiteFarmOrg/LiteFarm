import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  successMessage: null,
  canShowSuccessHeader: false,
  canShowSelection: false,
  locations: [],
  zoomLevel: null,
  position: null,
};

const mapLocationReducer = createSlice({
  name: 'mapLocationReducer',
  initialState,
  reducers: {
    setSuccessMessage: (state, { payload: [locationType, action] }) => {
      state.successMessage = `${locationType} ${action?.toString()?.toLowerCase()}`;
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
    setZoomLevel: (state, { payload: zoom }) => {
      state.zoomLevel = zoom;
    },
    setPosition: (state, { payload: pos }) => {
      state.position = pos;
    },
    setSelected: (state, { payload: location }) => {
      state.selected = location;
    },
  },
});

export const {
  setSuccessMessage,
  canShowSuccessHeader,
  canShowSelection,
  locations,
  setZoomLevel,
  setPosition,
  setSelected,
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
export const mapLocationsSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].locations;
export const setZoomLevelSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].zoomLevel;
export const setPositionSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].position;
export const setSelectedSelector = (state) =>
  state?.tempStateReducer[mapLocationReducer.name].selected;
