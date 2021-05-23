import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  allCertificationTypes: [],
  certificationName: null,
  certificationID: null,
  requestedCertification: null,
  finishedSelectingCertificationType: false,
  allCertifierTypes: [],
  certifierName: null,
  certifierID: null,
  requestedCertifier: null,
  loadSummary: false,
};

const organicCertifierSurveyReducer = createSlice({
  name: 'organicCertifierSurveyReducer',
  initialState,
  reducers: {
    allCertificationTypes: (state, { payload: types }) => {
      state.allCertificationTypes = types;
    },
    selectedCertification: (state, { payload: certification }) => {
      state.certificationName = certification.certificationName;
      state.certificationID = certification.certificationID;
      state.requestedCertification = certification.requestedCertification;
    },
    finishedSelectingCertificationType: (state, { payload: selected }) => {
      state.finishedSelectingCertificationType = selected;
    },
    allCertifierTypes: (state, { payload: allCertifierTypes }) => {
      state.allCertifierTypes = allCertifierTypes;
    },
    selectedCertifier: (state, { payload: certifier }) => {
      state.certifierName = certifier.certifierName;
      state.certifierID = certifier.certifierID;
      state.isRequestingCertifier = certifier.isRequestingCertifier;
    },

    requestedCertifier: (state, { payload: requested }) => {
      state.requestedCertifier = requested;
    },
    loadSummary: (state, { payload: loadSummary }) => {
      state.loadSummary = loadSummary;
    },
  },
});

export const {
  allCertificationTypes,
  selectedCertification,
  finishedSelectingCertificationType,
  allCertifierTypes,
  selectedCertifier,
  requestedCertifier,
  loadSummary,
} = organicCertifierSurveyReducer.actions;

export default organicCertifierSurveyReducer.reducer;

export const allCertificationTypesSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].allCertificationTypes;
export const selectedCertificationSelector = (state) => ({
  certificationName: state?.tempStateReducer[organicCertifierSurveyReducer.name].certificationName,
  certificationID: state?.tempStateReducer[organicCertifierSurveyReducer.name].certificationID,
  requestedCertification:
    state?.tempStateReducer[organicCertifierSurveyReducer.name].requestedCertification,
});
export const finishedSelectingCertificationTypeSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].finishedSelectingCertificationType;
export const allCertifierTypesSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].allCertifierTypes;
export const selectedCertifierSelector = (state) => ({
  certifierName: state?.tempStateReducer[organicCertifierSurveyReducer.name].certifierName,
  certifierID: state?.tempStateReducer[organicCertifierSurveyReducer.name].certifierID,
  isRequestingCertifier:
    state?.tempStateReducer[organicCertifierSurveyReducer.name].isRequestingCertifier,
});

export const requestedCertifierSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].requestedCertifier;
export const loadSummarySelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].loadSummary;
