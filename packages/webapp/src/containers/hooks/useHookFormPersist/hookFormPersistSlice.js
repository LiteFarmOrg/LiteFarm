import { createSlice } from '@reduxjs/toolkit';
import { bufferZoneEnum, fieldEnum, watercourseEnum, waterValveEnum } from '../../constants';
import { getUnitOptionMap } from '../../../components/Form/Unit';
import { cloneObject } from '../../../util';
import { createSelector } from 'reselect';

export const initialState = {
  formData: {},
  shouldUpdateFormData: true,
  persistedPaths: [],
};

const resetState = {
  formData: {},
  shouldUpdateFormData: false,
  persistedPaths: [],
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
      if (!state.shouldUpdateFormData) {
        return initialState;
      } else {
        Object.assign(state.formData, getCorrectedPayload(payload));
      }
    },
    setFormData: (state, { payload }) => {
      state.shouldUpdateFormData = true;
      state.formData = payload;
    },
    setPersistedPaths: (state, { payload: persistedPaths }) => {
      state.persistedPaths = persistedPaths;
    },
    //Prevent useHookPersistUnMount from updating formData after reset
    resetAndLockFormData: (state) => resetState,
    resetAndUnLockFormData: (state) => initialState,

    setAreaDetailFormData: (state, { payload }) => {
      state.shouldUpdateFormData = true;
      const formData = { ...payload };
      formData[fieldEnum.total_area_unit] = getUnitOptionMap()[payload[fieldEnum.total_area_unit]];
      formData[fieldEnum.perimeter_unit] = getUnitOptionMap()[payload[fieldEnum.perimeter_unit]];
      state.formData = formData;
    },
    setLineDetailFormData: (state, { payload }) => {
      state.shouldUpdateFormData = true;
      const formData = { ...payload };
      formData[bufferZoneEnum.length_unit] = getUnitOptionMap()[
        payload[bufferZoneEnum.length_unit]
      ];
      formData[bufferZoneEnum.width_unit] = getUnitOptionMap()[payload[bufferZoneEnum.width_unit]];
      formData[bufferZoneEnum.total_area_unit] = getUnitOptionMap()[
        payload[bufferZoneEnum.total_area_unit]
      ];
      formData[watercourseEnum.buffer_width_unit] = getUnitOptionMap()[
        payload[watercourseEnum.buffer_width_unit]
      ];
      state.formData = formData;
    },
    setPointDetailFormData: (state, { payload }) => {
      state.shouldUpdateFormData = true;
      const formData = { ...payload };
      formData[waterValveEnum.flow_rate_unit] = getUnitOptionMap()[
        payload[waterValveEnum.flow_rate_unit]
      ];
      state.formData = formData;
    },
    setFinalLocationIdManagementPlanFormData: (state, { payload: location_id }) => {
      !state.formData.crop_management_plan && (state.formData.crop_management_plan = {});
      !state.formData.crop_management_plan.planting_management_plans &&
        (state.formData.crop_management_plan.planting_management_plans = {});
      !state.formData.crop_management_plan.planting_management_plans.final &&
        (state.formData.crop_management_plan.planting_management_plans.final = {});
      state.formData.crop_management_plan.planting_management_plans.final.location_id = location_id;
    },
    setInitialLocationIdManagementPlanFormData: (state, { payload: location_id }) => {
      !state.formData.crop_management_plan && (state.formData.crop_management_plan = {});
      !state.formData.crop_management_plan.planting_management_plans &&
        (state.formData.crop_management_plan.planting_management_plans = {});
      !state.formData.crop_management_plan.planting_management_plans.initial &&
        (state.formData.crop_management_plan.planting_management_plans.initial = {});
      state.formData.crop_management_plan.planting_management_plans.initial.location_id = location_id;
      state?.formData?.farm?.default_initial_location_id &&
        (state.formData.farm.default_initial_location_id = location_id);
    },
    setWildCropLocation: (state, { payload }) => {
      !state.formData.crop_management_plan && (state.formData.crop_management_plan = {});
      !state.formData.crop_management_plan.planting_management_plans &&
        (state.formData.crop_management_plan.planting_management_plans = {});
      !state.formData.crop_management_plan.planting_management_plans.final &&
        (state.formData.crop_management_plan.planting_management_plans.final = {});
      state.formData.crop_management_plan.planting_management_plans.final.pin_coordinate = payload;
    },
    resetWildCropLocation: (state) => {
      if (state.formData.crop_management_plan.planting_management_plans.final.pin_coordinate) {
        delete state.formData.crop_management_plan.planting_management_plans.final.pin_coordinate;
      }
    },
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

    setDefaultInitialLocation: (state, { payload: location_id }) => {
      if (!state.formData.farm) {
        state.formData.farm = {};
      }
      state.formData.farm.default_initial_location_id = location_id;
    },
  },
});

export const {
  upsertFormData,
  setFormData,
  setPersistedPaths,
  resetAndLockFormData,
  hookFormPersistUnMount,
  resetAndUnLockFormData,
  setAreaDetailFormData,
  setLineDetailFormData,
  setPointDetailFormData,
  setFinalLocationIdManagementPlanFormData,
  setInitialLocationIdManagementPlanFormData,
  setWildCropLocation,
  setSubmissionIdCertificationFormData,
  uploadFileSuccess,
  deleteUploadedFile,
  initEditDocument,
  setCertifierId,
  setInterested,
  setDefaultInitialLocation,
  resetWildCropLocation,
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
