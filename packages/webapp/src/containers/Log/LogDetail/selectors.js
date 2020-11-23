import { createSelector } from 'reselect/es';

const logPageSelector = (state) => state.logReducer.logReducer;

const logSelector = createSelector(
  logPageSelector,
  (state) => state.logs
);

const currentLogSelector = createSelector(
  logPageSelector,
  (state) => state.selectedLog
);

export { logSelector, currentLogSelector };
