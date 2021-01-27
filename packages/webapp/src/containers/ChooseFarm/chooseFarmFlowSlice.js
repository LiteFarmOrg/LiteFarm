import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { loginSelector } from '../userFarmSlice';

const getFarmState = (payload) => {
  const { farm_id, isInvitationFlow } = payload;
  return { farm_id, isInvitationFlow };
};

const chooseFarmFlowAdapter = createEntityAdapter({
  selectId: (farmState) => farmState.farm_id,
});

const updateFarmState = (state, payload) => {
  chooseFarmFlowAdapter.upsertOne(state, getFarmState(payload));
};

const chooseFarmFlowSlice = createSlice({
  name: 'chooseFarmFlowReducer',
  initialState: chooseFarmFlowAdapter.getInitialState(),
  reducers: {
    startInvitationFlow: (state, { payload: farm_id }) => {
      updateFarmState(state, { farm_id, isInvitationFlow: true });
    },
    endInvitationFlow: (state, { payload: farm_id }) => {
      updateFarmState(state, { farm_id, isInvitationFlow: false });
    },
  },
});
export const { startInvitationFlow } = chooseFarmFlowSlice.actions;
export default chooseFarmFlowSlice.reducer;

export const chooseFarmFlowReducerSelector = (state) =>
  state.persistedStateReducer[chooseFarmFlowSlice.name];
const chooseFarmFlowSelectors = chooseFarmFlowAdapter.getSelectors(
  (state) => state.entitiesReducer[chooseFarmFlowSlice.name],
);
export const chooseFarmFlowSelector = createSelector(
  [chooseFarmFlowSelectors.selectEntities, loginSelector],
  (chooseFarmFlowEntities, { farm_id }) => {
    return chooseFarmFlowEntities[farm_id] || {};
  },
);
