import { createSlice } from '@reduxjs/toolkit';

// The initial state of the HackerNews component
export const initialState = {
  interested: null,
  certifiers: [],
  survey_id: undefined,
};

function setState(state, { payload: { certifiers, interested, survey_id } }) {
  state.certifiers = certifiers;
  state.interested = interested;
  state.survey_id = survey_id;
}

const slice = createSlice({
  name: 'certifierSurveyReducer',
  initialState,
  reducers: {
    getCertifiersSuccess: setState,
    //fetchCertifiersFailure(state, action){}
    postCertifiersSuccess: setState,
    patchCertifiersSuccess(state, { payload: { certifiers } }) {
      state.certifiers = certifiers;
    },
    patchInterestedSuccess(state, { payload: { interested } }) {
      state.interested = interested;
    },
  },
});
export const { getCertifiersSuccess, postCertifiersSuccess, patchCertifiersSuccess, patchInterestedSuccess } = slice.actions;
export default slice.reducer;
export const { name } = slice;
export const certifierSurveySelector = (state) => state[slice.name] || initialState;
