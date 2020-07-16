import { createSelector } from 'reselect/es';


const shiftReducer = (state) => state.shiftReducer;

const taskTypeSelector = createSelector(
  shiftReducer,
  (state) => state.taskTypes
);

const selectedShiftSelector = createSelector(
  shiftReducer,
  (state) => state.selectedShift
);

export { taskTypeSelector, selectedShiftSelector};