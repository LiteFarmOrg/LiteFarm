import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
// import { getDateInputFormat } from '../util/moment';

export const initialState = {
  introducingCertifications: false,
};

const navbarSliceReducer = createSlice({
  name: 'navbarReducer',
  initialState,
  reducers: {
    resetReducer: (state) => initialState,
    setIntroducingCertifications: (state, { payload: introducingCertifications }) => {
      state.introducingCertifications = introducingCertifications;
    },
  },
});

export const { resetReducer, setIntroducingCertifications } = navbarSliceReducer.actions;
export default navbarSliceReducer.reducer;

const navbarReducerSelector = (state) => {
  return state?.tempStateReducer[navbarSliceReducer.name];
};

export const isIntroducingCertificationsSelector = createSelector(
  [navbarReducerSelector],
  (navbarReducer) => navbarReducer.introducingCertifications,
);
