import { createSlice } from '@reduxjs/toolkit';
import { fieldEnum } from '../../constants';
import { unitOptionMap } from '../../../components/Form/Unit';

export const initialState = {
  formData: {},
  shouldUpdateFormData: true,
};

const resetState = {
  formData: {},
  shouldUpdateFormData: false,
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
  },
});

export const {
  upsertFormData,
  setFormData,
  resetAndLockFormData,
  hookFormPersistUnMount,
  resetAndUnLockFormData,
  setAreaDetailFormData,
} = hookFormPersistSlice.actions;
export default hookFormPersistSlice.reducer;
export const hookFormPersistSelector = (state) =>
  state?.tempStateReducer[hookFormPersistSlice.name].formData;
