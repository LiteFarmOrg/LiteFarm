import { createSelector } from 'reselect/es';

const notificationSelector = (state) => state.notificationReducer;

const userInfoSelector = createSelector(
  notificationSelector,
  (state) => state
);

export { userInfoSelector };
