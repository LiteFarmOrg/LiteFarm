import { createSelector } from 'reselect/es';

const peopleSelector = (state) => state.peopleReducer;

const peopleInfoSelector = createSelector(
  peopleSelector,
  (state) => state
);

const rolesSelector = createSelector(
  peopleSelector,
  (state) => state.roles
);

const profileFormsSelector = (state) => state.profileForms;

export { peopleInfoSelector, rolesSelector, profileFormsSelector };
