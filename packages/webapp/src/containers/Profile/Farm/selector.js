import { createSelector } from 'reselect/es';

const farmReducer = (state) => state.farmReducer;

const farmDataSelector = createSelector(farmReducer, (state) => state);

export { farmDataSelector };
