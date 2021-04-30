import { createSelector } from 'reselect/es';

const fertilizerSelector = (state) => state.logReducer.fertReducer;

const fertSelector = createSelector(fertilizerSelector, (state) => state.fertilizers);

const fertilizerFormSelector = (state) => state.logReducer.forms;

const fertTypeSelector = createSelector(fertilizerFormSelector, (state) => state.fertLog);

const fertFormSelector  = createSelector(fertilizerFormSelector, (state) => state.forms.fertLog);

export { fertSelector, fertTypeSelector, fertFormSelector };
