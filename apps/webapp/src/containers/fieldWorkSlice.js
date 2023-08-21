import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  fieldWorkTypes: [],
};

const fieldWorkSlice = createSlice({
  name: 'fieldWorkReducer',
  initialState,
  reducers: {
    resetFieldWorkStates: (state, action) => {
      Object.assign(state, {
        loading: false,
        fieldWorkTypes: [],
      });
    },
    fieldWorkLoading: (state, action) => {
      Object.assign(state, {
        loading: true,
        fieldWorkTypes: [],
      });
    },
    fieldWorkSuccess: (state, { payload }) => {
      if (state.loading && payload?.fieldWorkTypes?.length) {
        Object.assign(state, {
          loading: false,
          fieldWorkTypes: payload?.fieldWorkTypes,
        });
      }
    },
    fieldWorkFailure: (state, action) => {
      state.loading = true;
      state.fieldWorkTypes = [];
    },
  },
});
export const { resetFieldWorkStates, fieldWorkLoading, fieldWorkSuccess, fieldWorkFailure } =
  fieldWorkSlice.actions;
export default fieldWorkSlice.reducer;
export const fieldWorkSliceSliceSelector = (state) => {
  return state?.entitiesReducer[fieldWorkSlice.name];
};
