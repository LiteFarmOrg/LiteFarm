import { createSelector } from 'reselect/es';


const shiftReducer = (state) => state.shiftReducer;

const selectedShiftSelector = createSelector(
  shiftReducer,
  (state) => state.selectedShift
);

const taskTypeSelector = createSelector(
  shiftReducer,
  (state) => state.taskTypes
);

export { selectedShiftSelector, taskTypeSelector};
