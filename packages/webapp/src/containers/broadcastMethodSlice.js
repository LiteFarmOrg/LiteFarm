import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';

export const broadcastMethodProperties = [
  'area_used',
  'area_used_unit',
  'percentage_planted',
  'planting_management_plan_id',
  'seeding_rate',
];

const getBroadcastMethod = (obj) => {
  return pick(obj, broadcastMethodProperties);
};

const addOneBroadcastMethod = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  broadcastMethodAdapter.upsertOne(state, getBroadcastMethod(payload));
};

const updateOneBroadcastMethod = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  broadcastMethodAdapter.upsertOne(state, getBroadcastMethod(payload));
};

const addManyBroadcastMethod = (state, { payload: broadcastMethods }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  broadcastMethodAdapter.upsertMany(
    state,
    broadcastMethods.map((broadcastMethod) => getBroadcastMethod(broadcastMethod)),
  );
};

const broadcastMethodAdapter = createEntityAdapter({
  selectId: (broadcastMethod) => broadcastMethod.planting_management_plan_id,
});

const broadcastMethodMethodSlice = createSlice({
  name: 'broadcastMethodReducer',
  initialState: broadcastMethodAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingBroadcastMethodStart: onLoadingStart,
    onLoadingBroadcastMethodFail: onLoadingFail,
    getBroadcastMethodsSuccess: addManyBroadcastMethod,
    postBroadcastMethodSuccess: addOneBroadcastMethod,
    putBroadcastMethodSuccess(state, { payload: broadcastMethod }) {
      broadcastMethodAdapter.updateOne(state, {
        changes: broadcastMethod,
        id: broadcastMethod.planting_management_plan_id,
      });
    },
    deleteBroadcastMethodSuccess: broadcastMethodAdapter.removeOne,
  },
});
export const {
  getBroadcastMethodsSuccess,
  postBroadcastMethodSuccess,
  putBroadcastMethodSuccess,
  onLoadingBroadcastMethodStart,
  onLoadingBroadcastMethodFail,
  deleteBroadcastMethodSuccess,
} = broadcastMethodMethodSlice.actions;
export default broadcastMethodMethodSlice.reducer;

export const broadcastMethodReducerSelector = (state) =>
  state.entitiesReducer[broadcastMethodMethodSlice.name];

export const broadcastMethodSelectors = broadcastMethodAdapter.getSelectors(
  (state) => state.entitiesReducer[broadcastMethodMethodSlice.name],
);
