import { createSlice } from '@reduxjs/toolkit';
import { bufferZoneEnum, fieldEnum, watercourseEnum, waterValveEnum } from '../../constants';
import { getUnitOptionMap } from '../../../components/Form/Unit';
import { cloneObject } from '../../../util';

export const initialState = {
  formData: {},
  shouldUpdateFormData: true,
};

const resetState = {
  formData: {},
  shouldUpdateFormData: false,
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
    setPlantingLocationIdManagementPlanFormData: (state, { payload: location_id }) => {
      state.formData.location_id = location_id;
    },
    setTransplantContainerLocationIdManagementPlanFormData: (state, { payload: location_id }) => {
      !state.formData.transplant_container && (state.formData.transplant_container = {});
      state.formData.transplant_container.location_id = location_id;
    },
    uploadFileSuccess: onUploadFileSuccess,
    deleteUploadedFile: onDeleteUploadedFile,
    initEditDocument: (state, { payload: files }) => {
      state.formData.uploadedFiles = files;
    },
  },
});

export const {
  upsertFormData,
  setFormData,
  resetAndLockFormData,
  hookFormPersistUnMount,
  resetAndUnLockFormData,
  setAreaDetailFormData,
  setLineDetailFormData,
  setPointDetailFormData,
  setPlantingLocationIdManagementPlanFormData,
  setTransplantContainerLocationIdManagementPlanFormData,
  uploadFileSuccess,
  deleteUploadedFile,
  initEditDocument,
} = hookFormPersistSlice.actions;
export default hookFormPersistSlice.reducer;
export const hookFormPersistSelector = (state) =>
  state?.tempStateReducer[hookFormPersistSlice.name].formData;
