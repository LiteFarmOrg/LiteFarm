import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector } from '../../userFarmSlice';
import { createSelector } from 'reselect';

// Generate a set of reusable reducers and selectors to manage normalized store data.
const alertAdapter = createEntityAdapter({
  selectId: (alert) => alert.farm_id,
});

// Given an initial state, object full of case reducers (for specific action types), and slice name,
// generate a slice reducer with action creators, types corresponding to the reducers and state.
const alertSlice = createSlice({
  name: 'alertReducer',
  initialState: alertAdapter.getInitialState(),
  reducers: {
    onLoadingAlertStart: (state, { payload: farm_id }) => {
      alertAdapter.upsertOne(state, { farm_id, loading: true });
    },
    onLoadingAlertFail: (state, { payload: { error, farm_id } }) => {
      alertAdapter.upsertOne(state, { farm_id, loading: false, loaded: true, error });
    },
    setAlertCount: (state, { payload }) => {
      alertAdapter.upsertOne(state, {
        loading: false,
        error: null,
        loaded: true,
        ...payload,
      });
    },
  },
});

export const { onLoadingAlertStart, onLoadingAlertFail, setAlertCount } = alertSlice.actions;

export default alertSlice.reducer;

export const alertReducerSelector = (state) => state.entitiesReducer[alertSlice.name];

const alertSelectors = alertAdapter.getSelectors((state) => state.entitiesReducer[alertSlice.name]);

// A component will re-render only when the selector's value has changed.
// Create a selector that ...
export const alertSelector = createSelector(
  // ... calls these selectors ...
  [alertSelectors.selectEntities, loginSelector],
  // ... and passes the results to this ...
  (alertEntities, { farm_id }) => {
    // ... so that we re-render when there are changes to the alert entities.
    return alertEntities[farm_id] || {};
  },
);
