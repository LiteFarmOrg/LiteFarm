import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util';

export const cropManagementPlanProperties = [
  'estimated_revenue',
  'estimated_yield',
  'estimated_yield_unit',
  'location_id',
  'management_plan_id',
  'notes',
  'planting_type',
];

export const broadcastProperties = [
  'management_plan_id',
  'area_used',
  'area_used_unit',
  'percentage_planted',
  'required_seeds',
  'seeding_rate',
];

const getBroadcast = (obj) => {
  return pick(obj, [...cropManagementPlanProperties, ...broadcastProperties]);
};

const addOneBroadcast = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  broadcastAdapter.upsertOne(state, getBroadcast(payload));
};

const updateOneBroadcast = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  broadcastAdapter.upsertOne(state, getBroadcast(payload));
};

const addManyBroadcast = (state, { payload: broadcasts }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  broadcastAdapter.upsertMany(
    state,
    broadcasts.map((broadcast) => getBroadcast(broadcast)),
  );
};

const broadcastAdapter = createEntityAdapter({
  selectId: (broadcast) => broadcast.management_plan_id,
});

const broadcastSlice = createSlice({
  name: 'broadcastReducer',
  initialState: broadcastAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingBroadcastStart: onLoadingStart,
    onLoadingBroadcastFail: onLoadingFail,
    getBroadcastsSuccess: addManyBroadcast,
    postBroadcastSuccess: addOneBroadcast,
    putBroadcastSuccess(state, { payload: broadcast }) {
      broadcastAdapter.updateOne(state, {
        changes: broadcast,
        id: broadcast.management_plan_id,
      });
    },
    deleteBroadcastSuccess: broadcastAdapter.removeOne,
  },
});
export const {
  getBroadcastsSuccess,
  postBroadcastSuccess,
  putBroadcastSuccess,
  onLoadingBroadcastStart,
  onLoadingBroadcastFail,
  deleteBroadcastSuccess,
} = broadcastSlice.actions;
export default broadcastSlice.reducer;

export const broadcastReducerSelector = (state) => state.entitiesReducer[broadcastSlice.name];

export const broadcastSelectors = broadcastAdapter.getSelectors(
  (state) => state.entitiesReducer[broadcastSlice.name],
);
