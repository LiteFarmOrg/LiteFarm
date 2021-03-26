import { createSlice } from '@reduxjs/toolkit';

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
  },
});

export const {
  upsertFormData,
  setFormData,
  resetAndLockFormData,
  hookFormPersistUnMount,
  resetAndUnLockFormData,
} = hookFormPersistSlice.actions;
export default hookFormPersistSlice.reducer;
export const hookFormPersistSelector = (state) =>
  state?.tempStateReducer[hookFormPersistSlice.name].formData;
