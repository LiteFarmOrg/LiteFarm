import { createSelector } from 'reselect/es';

const shiftReducer = (state) => state.shiftReducer;

const taskTypeSelector = createSelector(shiftReducer, (state) => state.taskTypes);

export { taskTypeSelector };
