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

export const irrigationTypeByKeyAndFarmIdSelector = (translationKey, farmId) =>
  createSelector(irrigationTaskTypesSliceSelector, (types) => {
    return types.irrigationTaskTypes.find(({ farm_id, irrigation_type_translation_key }) => {
      // If farmId is provided (=custom type), match on farm_id; otherwise, match on null farm_id
      const farmMatch = farmId ? farm_id === farmId : farm_id === null;
      return farmMatch && irrigation_type_translation_key === translationKey;
    });
  });
