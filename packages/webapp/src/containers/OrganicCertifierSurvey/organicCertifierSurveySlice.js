import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  allCertificationTypes: [],
  certificationName: null,
  certificationID: null,
  requestedCertification: null,
  finishedSelectingCertificationType: false,
  certifiers: [],

  certifierSelection: null,

  requestedCertification: null,

  certificationID: null,

  isRequestingCertifier: false,
  requestedCertifier: null,
  selectedCertifier: null,
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
    setCertifiers: (state, { payload: certifiers }) => {
      state.certifiers = certifiers;
    },

    setCertificationSelection: (state, { payload: selection }) => {
      state.certifierSelection = selection;
    },

    setRequestedCertification: (state, { payload: requested }) => {
      state.requestedCertification = requested;
    },

    setCertificationID: (state, { payload: id }) => {
      state.certificationID = id;
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
  allCertificationTypes,
  selectedCertification,
  finishedSelectingCertificationType,
  setCertifiers,

  setCertificationSelection,

  setRequestedCertification,

  setCertificationID,

  isRequestingCertifier,
  requestedCertifier,
  selectedCertifier,
  loadSummary,
  setSelectedCertifier,
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
export const setCertifiersSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].certifiers;

export const setCertificationSelectionSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].certifierSelection;

export const setRequestedCertificationSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].requestedCertification;

export const certificationIDSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].certificationID;

export const isRequestingCertifierSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].isRequestingCertifier;
export const requestedCertifierSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].requestedCertifier;
export const selectedCertifierSelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].selectedCertifier;
export const loadSummarySelector = (state) =>
  state?.tempStateReducer[organicCertifierSurveyReducer.name].loadSummary;
