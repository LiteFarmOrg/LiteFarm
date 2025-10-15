import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

export const initialState = {
  showHelpRequestModal: undefined,
  loading: false,
  values: { 1: 10, 2: 20, 3: 30, 4: 40 },
};

const homeSlice = createSlice({
  name: 'homeReducer',
  initialState,
  reducers: {
    postHelpRequestSuccess: (state) => {
      state.showHelpRequestModal = true;
    },
    dismissHelpRequestModal: (state) => {
      state.showHelpRequestModal = false;
    },
    startSendHelp: (state) => {
      state.loading = true;
    },
    finishSendHelp: (state) => {
      state.loading = false;
    },
  },
});

export const { postHelpRequestSuccess, dismissHelpRequestModal, startSendHelp, finishSendHelp } =
  homeSlice.actions;
export default homeSlice.reducer;
export const showHelpRequestModalSelector = (state) =>
  state?.tempStateReducer[homeSlice.name].showHelpRequestModal;
export const isHelpLoadingSelector = (state) => state?.tempStateReducer[homeSlice.name].loading;

// Selector factory
export const makeSelectValueByKey = () => {
  return createSelector(
    [(state) => state?.tempStateReducer[homeSlice.name].values, (_state, key) => key],
    (values, key) => {
      console.log(`Output selector running: ${values[key]}`);
      return values[key];
    },
  );
};

export const valueByKeySelector = createSelector(
  [(state) => state?.tempStateReducer[homeSlice.name].values, (_state, key) => key],
  (values, key) => {
    console.log(`Output selector running: ${values[key]}`);
    return values[key];
  },
);
