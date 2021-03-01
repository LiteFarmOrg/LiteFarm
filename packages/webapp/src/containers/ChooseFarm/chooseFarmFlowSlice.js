import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { loginSelector } from '../userFarmSlice';

const chooseFarmFlowAdapter = createEntityAdapter({
  selectId: (farmState) => farmState.farm_id,
});

const updateFarmState = (state, payload) => {
  chooseFarmFlowAdapter.upsertOne(state, payload);
};

const chooseFarmFlowSlice = createSlice({
  name: 'chooseFarmFlowReducer',
  initialState: chooseFarmFlowAdapter.getInitialState(),
  reducers: {
    startInvitationFlow: (state, { payload: farm_id }) => {
      updateFarmState(state, { farm_id, isInvitationFlow: true });
    },
    startInvitationFlowOnChooseFarmScreen: (state, { payload: farm_id }) => {
      updateFarmState(state, { farm_id, isInvitationFlow: true, skipChooseFarm: true });
    },
    endInvitationFlow: (state, { payload: farm_id }) => {
      updateFarmState(state, {
        farm_id,
        isInvitationFlow: false,
        showSpotLight: state.entities[farm_id]?.showSpotLight,
        showMapSpotlight: state.entities[farm_id]?.showMapSpotlight,
      });
    },
    startSpotLight: (state, { payload: farm_id }) => {
      updateFarmState(state, { farm_id, showSpotLight: true, showMapSpotlight: true });
    },
    endSpotLight: (state, { payload: farm_id }) => {
      updateFarmState(state, { farm_id, showSpotLight: false });
    },
    endMapSpotlight: (state, { payload: farm_id }) => {
      updateFarmState(state, { farm_id, showMapSpotlight: false });
    },
    startInvitationFlowWithSpotLight: (state, { payload: farm_id }) => {
      updateFarmState(state, {
        farm_id,
        isInvitationFlow: true,
        showSpotLight: true,
        showMapSpotlight: true,
      });
    },
    startSwitchFarmModal: (state, { payload: farm_id }) => {
      updateFarmState(state, { farm_id, showSwitchFarmModal: true });
    },
    endSwitchFarmModal: (state, { payload: farm_id }) => {
      updateFarmState(state, { farm_id, showSwitchFarmModal: false });
    },
  },
});
export const {
  startInvitationFlow,
  startInvitationFlowWithSpotLight,
  endInvitationFlow,
  startSpotLight,
  endSpotLight,
  endMapSpotlight,
  startInvitationFlowOnChooseFarmScreen,
  startSwitchFarmModal,
  endSwitchFarmModal,
} = chooseFarmFlowSlice.actions;
export default chooseFarmFlowSlice.reducer;

export const chooseFarmFlowReducerSelector = (state) =>
  state.persistedStateReducer[chooseFarmFlowSlice.name];
const chooseFarmFlowSelectors = chooseFarmFlowAdapter.getSelectors(
  (state) => state.persistedStateReducer[chooseFarmFlowSlice.name],
);
export const chooseFarmFlowSelector = createSelector(
  [chooseFarmFlowSelectors.selectEntities, loginSelector],
  (chooseFarmFlowEntities, { farm_id }) => {
    return chooseFarmFlowEntities[farm_id] || {};
  },
);
export const spotLightSelector = createSelector(
  chooseFarmFlowSelector,
  (farmState) => farmState.showSpotLight,
);
export const mapSpotlightSelector = createSelector(
  chooseFarmFlowSelector,
  (farmState) => farmState.showMapSpotlight,
);
export const switchFarmSelector = createSelector(
  chooseFarmFlowSelector,
  (farmState) => farmState.showSwitchFarmModal,
);
