import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  certifierSelection: null,
  certificationTypes: [],
};

const organicCertifierSurveyReducer = createSlice({
  name: 'organicCertifierSurveyReducer',
  initialState,
  reducers: {
    setCertificationSelection: (state, { payload: selection }) => {
      state.certifierSelection = selection;
    },
    setcertificationTypes: (state, { payload: types }) => {
      state.certificationTypes = types;
    },
  },
});

export const {
  setCertificationSelection,
  setcertificationTypes,
} = organicCertifierSurveyReducer.actions;
export default organicCertifierSurveyReducer.reducer;
export const setCertificationSelectionSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].certifierSelection;
export const setcertificationTypesSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].certificationTypes;
