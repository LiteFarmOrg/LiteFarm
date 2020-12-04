import { createSelector } from 'reselect/es';

const fieldReducer = (state) => state.fieldReducer;

const currentFieldSelector = createSelector(
  fieldReducer,
  (state) => state.selectedField
);

export { currentFieldSelector  };