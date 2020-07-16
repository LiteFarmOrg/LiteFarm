import { createSelector } from 'reselect/es';

const pcSelector = (state) => state.logReducer.pestControlReducer;

const diseaseSelector = createSelector(
  pcSelector,
  (state) => state.diseases
);

const pesticideSelector = createSelector(
  pcSelector,
  (state) => state.pesticides
);

const pcFormSelector = (state) => state.logReducer.forms;

const pestLogSelector = createSelector(
  pcFormSelector,
  (state) => state.pestControlLog
);

export {diseaseSelector, pesticideSelector, pestLogSelector};
