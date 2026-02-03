import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  fieldWorkTypes: [],
};

const fieldWorkTypeSlice = createSlice({
  name: 'fieldWorkTypeReducer',
  initialState,
  reducers: {
    resetFieldWorkTypeStates: (state, action) => {
      Object.assign(state, {
        loading: false,
        fieldWorkTypes: [],
      });
    },
    fieldWorkTypeLoading: (state, action) => {
      Object.assign(state, {
        loading: true,
      });
    },
    fieldWorkTypeSuccess: (state, { payload }) => {
      if (state.loading && payload?.fieldWorkTypes?.length) {
        Object.assign(state, {
          loading: false,
          fieldWorkTypes: payload?.fieldWorkTypes,
        });
      }
    },
    fieldWorkTypeFailure: (state, action) => {
      state.loading = true;
    },
  },
});
export const {
  resetFieldWorkTypeStates,
  fieldWorkTypeLoading,
  fieldWorkTypeSuccess,
  fieldWorkTypeFailure,
} = fieldWorkTypeSlice.actions;
export default fieldWorkTypeSlice.reducer;
export const fieldWorkTypeSliceSelector = (state) => {
  return state?.entitiesReducer[fieldWorkTypeSlice.name];
};
