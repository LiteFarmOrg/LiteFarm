import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  showHelpRequestModal: undefined,
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
  },
});

export const { postHelpRequestSuccess, dismissHelpRequestModal } = homeSlice.actions;
export default homeSlice.reducer;
export const showHelpRequestModalSelector = (state) =>
  state?.tempStateReducer[homeSlice.name].showHelpRequestModal;
