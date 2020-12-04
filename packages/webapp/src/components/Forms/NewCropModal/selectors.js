import { createSelector } from 'reselect/es';

const fieldReducer = (state) => state.fieldReducer;

const cropSelector = createSelector(fieldReducer, (state) => state.crops);

const currentFieldSelector = createSelector(fieldReducer, (state) => state.selectedField);

export { cropSelector, currentFieldSelector };
