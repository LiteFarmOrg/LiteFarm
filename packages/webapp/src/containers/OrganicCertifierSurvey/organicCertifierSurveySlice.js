import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  certifierSelection: null,
  certificationTypes: [],
  requestedCertification: null,
  selectedCertificationType: false,
  certificationID: null,
  certifiers: [],
  isRequestingCertifier: false,
  requestedCertifier: null,
  selectedCertifier: null,
  loadSummary: false,
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
    setRequestedCertification: (state, { payload: requested }) => {
      state.requestedCertification = requested;
    },
    selectedCertificationType: (state, { payload: selected }) => {
      state.selectedCertificationType = selected;
    },
    setCertificationID: (state, { payload: id }) => {
      state.certificationID = id;
    },
    setCertifiers: (state, { payload: certifiers }) => {
      state.certifiers = certifiers;
    },
    isRequestingCertifier: (state, { payload: selected }) => {
      state.isRequestingCertifier = selected;
    },
    requestedCertifier: (state, { payload: requested }) => {
      state.requestedCertifier = requested;
    },
    selectedCertifier: (state, { payload: certifier }) => {
      state.selectedCertifier = certifier;
    },
    loadSummary: (state, { payload: loadSummary }) => {
      state.loadSummary = loadSummary;
    },
  },
});

export const {
  setCertificationSelection,
  setcertificationTypes,
  setRequestedCertification,
  selectedCertificationType,
  setCertificationID,
  setCertifiers,
  isRequestingCertifier,
  requestedCertifier,
  selectedCertifier,
  loadSummary,
  setSelectedCertifier,
} = organicCertifierSurveyReducer.actions;
export default organicCertifierSurveyReducer.reducer;
export const setCertificationSelectionSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].certifierSelection;
export const setcertificationTypesSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].certificationTypes;
export const setRequestedCertificationSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].requestedCertification;
export const selectedCertificationTypeSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].selectedCertificationType;
export const certificationIDSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].certificationID;
export const setCertifiersSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].certifiers;
export const isRequestingCertifierSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].isRequestingCertifier;
export const requestedCertifierSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].requestedCertifier;
export const selectedCertifierSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].selectedCertifier;
export const loadSummarySelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].loadSummary;
