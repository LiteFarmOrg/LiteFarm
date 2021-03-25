import { createSlice } from '@reduxjs/toolkit';

export const initialState = {};

const hookFormPersistSlice = createSlice({
  name: 'hookFormPersistReducer',
  initialState,
  reducers: {
    upsertFormData: (state, { payload }) => {
      Object.assign(state, payload);
    },
    setFormData: (state, { payload }) => payload,
    resetFormData: (state) => initialState,
  },
});

export const { upsertFormData, setFormData, resetFormData } = hookFormPersistSlice.actions;
export default hookFormPersistSlice.reducer;
export const hookFormPersistSelector = (state) =>
  state?.tempStateReducer[hookFormPersistSlice.name];
