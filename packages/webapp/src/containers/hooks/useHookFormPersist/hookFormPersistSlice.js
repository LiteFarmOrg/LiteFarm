import { createSlice } from '@reduxjs/toolkit';
import { bufferZoneEnum, fieldEnum, watercourseEnum, waterValveEnum } from '../../constants';
import { unitOptionMap } from '../../../components/Form/Unit';

export const initialState = {
  formData: {},
  shouldUpdateFormData: true,
};

const resetState = {
  formData: {},
  shouldUpdateFormData: false,
};

const onUploadFileSuccess = (state, { payload }) => {
  state.formData.uploadedFiles = payload.files.map(({ url, thumbnailUrl }) => ({
    fileUrl: url,
    thumbnailUrl,
  }));
};

const onDeleteUploadedFile = (state, { payload }) => {
  state.formData.uploadedFiles = state.formData.uploadedFiles.filter(
    ({ thumbnailUrl }) => payload.thumbnailUrl !== thumbnailUrl,
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
        Object.assign(state.formData, payload);
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
      formData[fieldEnum.total_area_unit] = unitOptionMap[payload[fieldEnum.total_area_unit]];
      formData[fieldEnum.perimeter_unit] = unitOptionMap[payload[fieldEnum.perimeter_unit]];
      state.formData = formData;
    },
    setLineDetailFormData: (state, { payload }) => {
      state.shouldUpdateFormData = true;
      const formData = { ...payload };
      formData[bufferZoneEnum.length_unit] = unitOptionMap[payload[bufferZoneEnum.length_unit]];
      formData[bufferZoneEnum.width_unit] = unitOptionMap[payload[bufferZoneEnum.width_unit]];
      formData[bufferZoneEnum.total_area_unit] =
        unitOptionMap[payload[bufferZoneEnum.total_area_unit]];
      formData[watercourseEnum.buffer_width_unit] =
        unitOptionMap[payload[watercourseEnum.buffer_width_unit]];
      state.formData = formData;
    },
    setPointDetailFormData: (state, { payload }) => {
      state.shouldUpdateFormData = true;
      const formData = { ...payload };
      formData[waterValveEnum.flow_rate_unit] =
        unitOptionMap[payload[waterValveEnum.flow_rate_unit]];
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
} = hookFormPersistSlice.actions;
export default hookFormPersistSlice.reducer;
export const hookFormPersistSelector = (state) =>
  state?.tempStateReducer[hookFormPersistSlice.name].formData;
