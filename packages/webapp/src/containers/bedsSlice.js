import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util';
import { cropManagementPlanProperties } from './broadcastSlice';

export const bedProperties = [];

const getBed = (obj) => {
  return pick(obj, [...cropManagementPlanProperties, ...bedProperties]);
};

const addOneBed = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  bedAdapter.upsertOne(state, getBed(payload));
};

const updateOneBed = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  bedAdapter.upsertOne(state, getBed(payload));
};

const addManyBed = (state, { payload: beds }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  bedAdapter.upsertMany(
    state,
    beds.map((bed) => getBed(bed)),
  );
};

const bedAdapter = createEntityAdapter({
  selectId: (bed) => bed.management_plan_id,
});

const bedSlice = createSlice({
  name: 'bedsReducer',
  initialState: bedAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingBedStart: onLoadingStart,
    onLoadingBedFail: onLoadingFail,
    getBedsSuccess: addManyBed,
    postBedSuccess: addOneBed,
    putBedSuccess(state, { payload: bed }) {
      bedAdapter.updateOne(state, {
        changes: bed,
        id: bed.management_plan_id,
      });
    },
    deleteBedSuccess: bedAdapter.removeOne,
  },
});
export const {
  getBedsSuccess,
  postBedSuccess,
  putBedSuccess,
  onLoadingBedStart,
  onLoadingBedFail,
  deleteBedSuccess,
} = bedSlice.actions;
export default bedSlice.reducer;

export const bedReducerSelector = (state) => state.entitiesReducer[bedSlice.name];

export const bedSelectors = bedAdapter.getSelectors(
  (state) => state.entitiesReducer[bedSlice.name],
);
