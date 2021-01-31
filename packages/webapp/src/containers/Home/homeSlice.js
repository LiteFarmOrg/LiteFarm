import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  showHelpRequestModal: undefined,
  loading: false,
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
    }
  },
});

export const { postHelpRequestSuccess, dismissHelpRequestModal, startSendHelp, finishSendHelp } = homeSlice.actions;
export default homeSlice.reducer;
export const showHelpRequestModalSelector = (state) =>
  state?.tempStateReducer[homeSlice.name].showHelpRequestModal;
export const isHelpLoadingSelector = (state) =>
  state?.tempStateReducer[homeSlice.name].loading;
