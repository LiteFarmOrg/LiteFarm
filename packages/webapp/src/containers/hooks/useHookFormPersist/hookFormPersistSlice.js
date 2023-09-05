import { createSlice } from '@reduxjs/toolkit';
import { cloneObject } from '../../../util';
import { createSelector } from 'reselect';

export const initialState = {
  formData: {},
  persistedPaths: [],
  historyStack: [],
  isRedrawing: false,
};

const getCorrectedPayload = (payload) => {
  const result = cloneObject(payload);
  const removeNullValues = (object) => {
    for (const key in object) {
      if (object[key] !== null && typeof object[key] === 'object') {
        removeNullValues(object[key]);
      } else if (!object[key] && object[key] !== 0 && object[key] !== false) {
        //remove NaN, undefined, null, ''
        delete object[key];
      }
    }
    return object;
  };
  return removeNullValues(result);
};

const onUploadFileSuccess = (state, { payload: file }) => {
  state.formData.uploadedFiles = state.formData.uploadedFiles
    ? [...state.formData.uploadedFiles, file]
    : [file];
};

const onDeleteUploadedFile = (state, { payload }) => {
  state.formData.uploadedFiles = state.formData.uploadedFiles.filter(
    ({ url }) => payload.url !== url,
  );
};

const hookFormPersistSlice = createSlice({
  name: 'hookFormPersistReducer',
  initialState,
  reducers: {
    upsertFormData: (state, { payload }) => {
      Object.assign(state.formData, payload);
    },
    hookFormPersistUnMount: (state, { payload }) => {
      Object.assign(state.formData, getCorrectedPayload(payload));
    },
    setFormData: (state, { payload }) => {
      state.formData = payload;
    },
    setPersistedPaths: (state, { payload: persistedPaths }) => {
      state.persistedPaths = persistedPaths;
    },
    addPersistedPaths: (state, { payload: persistedPaths }) => {
      state.persistedPaths = [...new Set([...state.persistedPaths, ...persistedPaths])];
    },
    resetAndUnLockFormData: (state) => initialState,

    setSubmissionIdCertificationFormData: (state, { payload: submission_id }) => {
      state.formData.submission_id = submission_id;
    },
    uploadFileSuccess: onUploadFileSuccess,
    deleteUploadedFile: onDeleteUploadedFile,
    initEditDocument: (state, { payload: files }) => {
      state.formData.uploadedFiles = files;
    },
    setCertifierId: (state, { payload: certifier_id }) => {
      state.formData.certifier_id = certifier_id;
      delete state.formData.requested_certifier;
    },
    setInterested: (state, { payload: interested }) => {
      state.formData.interested = interested;
    },
    setManagementPlansData: (state, { payload: managementPlans }) => {
      state.formData.managementPlans = managementPlans;
    },
    pushHistoryStack(state, { payload: path }) {
      state.historyStack.push(path);
    },
    popHistoryStack(state) {
      state.historyStack.pop();
    },
    replaceHistoryStack(state, { payload: path }) {
      state.historyStack[state.historyStack.length - 1] = path;
    },
    setIsRedrawing: (state, { payload: isRedrawing }) => {
      state.isRedrawing = isRedrawing;
    },
  },
});

export const {
  upsertFormData,
  setFormData,
  setPersistedPaths,
  addPersistedPaths,
  hookFormPersistUnMount,
  resetAndUnLockFormData,
  setSubmissionIdCertificationFormData,
  uploadFileSuccess,
  deleteUploadedFile,
  initEditDocument,
  setCertifierId,
  setInterested,
  setManagementPlansData,
  pushHistoryStack,
  popHistoryStack,
  replaceHistoryStack,
  setIsRedrawing,
} = hookFormPersistSlice.actions;
export default hookFormPersistSlice.reducer;
const hookFormPersistReducerSelector = (state) =>
  state?.tempStateReducer[hookFormPersistSlice.name];
export const hookFormPersistSelector = (state) =>
  state?.tempStateReducer[hookFormPersistSlice.name].formData;
export const hookFormPersistedPathsSetSelector = createSelector(
  [hookFormPersistReducerSelector],
  (hookFormPersistReducer) => new Set(hookFormPersistReducer.persistedPaths),
);
export const hookFormPersistHistoryStackSelector = (state) =>
  state?.tempStateReducer[hookFormPersistSlice.name].historyStack;
export const hookFormPersistIsRedrawingSelector = (state) =>
  state?.tempStateReducer[hookFormPersistSlice.name].isRedrawing;
