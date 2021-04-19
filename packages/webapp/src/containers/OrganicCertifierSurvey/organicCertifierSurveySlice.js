import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  certifierSelection: null,
};

const organicCertifierSurveyReducer = createSlice({
  name: 'organicCertifierSurveyReducer',
  initialState,
  reducers: {
    setCertificationSelection: (state, { payload: selection }) => {
      state.certifierSelection = selection;
    },
  },
});

export const { setCertificationSelection } = organicCertifierSurveyReducer.actions;
export default organicCertifierSurveyReducer.reducer;
export const setCertificationSelectionSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].certifierSelection;
