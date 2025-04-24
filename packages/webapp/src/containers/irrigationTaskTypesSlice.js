import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const IrrigationTaskTypesSlice = createSlice({
  name: 'irrigationTaskTypesReducer',
  initialState: {
    loading: false,
    irrigationTaskTypes: [],
  },
  reducers: {
    resetIrrigationTaskTypes: (state) => {
      Object.assign(state, {
        loading: false,
        irrigationTaskTypes: [],
      });
    },
    irrigationTaskTypesLoading: (state) => {
      Object.assign(state, {
        loading: true,
      });
    },
    irrigationTaskTypesSuccess: (state, { payload }) => {
      if (state.loading && payload?.irrigationTaskTypes) {
        Object.assign(state, {
          loading: false,
          irrigationTaskTypes: payload?.irrigationTaskTypes,
        });
      }
    },
    irrigationTaskTypesFailure: (state) => {
      Object.assign(state, {
        loading: false,
      });
    },
  },
});

export const {
  resetIrrigationTaskTypes,
  irrigationTaskTypesFailure,
  irrigationTaskTypesLoading,
  irrigationTaskTypesSuccess,
} = IrrigationTaskTypesSlice.actions;
export default IrrigationTaskTypesSlice.reducer;
export const irrigationTaskTypesSliceSelector = (state) => {
  return state.entitiesReducer[IrrigationTaskTypesSlice.name];
};
