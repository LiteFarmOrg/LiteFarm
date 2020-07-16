import { createSelector } from 'reselect/es';


const shiftSelector = (state) => state.shiftReducer;

const selectedTasksSelector = createSelector(
  shiftSelector,
  (state) => state.selectedTasks
);

const durationSelector = createSelector(
  shiftSelector,
  (state) => state.availableDuration
);

const startEndSelector = createSelector(
  shiftSelector,
  (state) => state.startEndObj
);

export { selectedTasksSelector, durationSelector, startEndSelector };
