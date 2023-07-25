import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';
import { createSelector } from 'reselect';

export const bedMethodProperties = [
  'bed_length',
  'bed_length_unit',
  'bed_spacing',
  'bed_spacing_unit',
  'bed_width',
  'bed_width_unit',
  'number_of_beds',
  'number_of_rows_in_bed',
  'plant_spacing',
  'plant_spacing_unit',
  'planting_depth',
  'planting_depth_unit',
  'planting_management_plan_id',
  'specify_beds',
];

const getBedMethod = (obj) => {
  return pick(obj, bedMethodProperties);
};

const addOneBedMethod = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  bedMethodAdapter.upsertOne(state, getBedMethod(payload));
};

const updateOneBedMethod = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  bedMethodAdapter.upsertOne(state, getBedMethod(payload));
};

const addManyBedMethod = (state, { payload: bedMethods }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  bedMethodAdapter.upsertMany(
    state,
    bedMethods.map((bedMethod) => getBedMethod(bedMethod)),
  );
};

const bedMethodAdapter = createEntityAdapter({
  selectId: (bedMethod) => bedMethod.planting_management_plan_id,
});

const bedMethodSlice = createSlice({
  name: 'bedMethodReducer',
  initialState: bedMethodAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingBedMethodStart: onLoadingStart,
    onLoadingBedMethodFail: onLoadingFail,
    getBedMethodsSuccess: addManyBedMethod,
    postBedMethodSuccess: addOneBedMethod,
    putBedMethodSuccess(state, { payload: bedMethod }) {
      bedMethodAdapter.updateOne(state, {
        changes: bedMethod,
        id: bedMethod.management_plan_id,
      });
    },
    deleteBedMethodSuccess: bedMethodAdapter.removeOne,
  },
});
export const {
  getBedMethodsSuccess,
  postBedMethodSuccess,
  putBedMethodSuccess,
  onLoadingBedMethodStart,
  onLoadingBedMethodFail,
  deleteBedMethodSuccess,
} = bedMethodSlice.actions;
export default bedMethodSlice.reducer;

export const bedMethodReducerSelector = (state) => state.entitiesReducer[bedMethodSlice.name];

export const bedMethodSelectors = bedMethodAdapter.getSelectors(
  (state) => state.entitiesReducer[bedMethodSlice.name],
);
export const bedMethodStatusSelector = createSelector(
  [bedMethodReducerSelector],
  ({ loading, error }) => {
    return { loading, error };
  },
);
