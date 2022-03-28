import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { getNotificationCardDate } from '../util/moment';

/**
 * Generate action creators and action types that correspond to a specified initial state and a specified set of reducers.
 * @see {@link https://redux-toolkit.js.org/api/createslice/}
 */
const notificationSlice = createSlice({
  name: 'notificationReducer',
  initialState: {
    notifications: [],
    loading: false,
    loaded: false,
    error: undefined,
  },
  reducers: {
    onLoadingNotificationStart: (state) => {
      state.loading = true;
    },
    onLoadingNotificationFail: (state, { payload: error }) => {
      state.loading = false;
      state.error = error;
      state.loaded = true;
    },
    getNotificationSuccess: (state, { payload: notifications }) => {
      state.loading = false;
      state.loaded = true;
      state.error = null;
      state.notifications = notifications;
    },
  },
});

export const { onLoadingNotificationStart, onLoadingNotificationFail, getNotificationSuccess } =
  notificationSlice.actions;
export default notificationSlice.reducer;
export const notificationReducerSelector = (state) => state.entitiesReducer[notificationSlice.name];

/**
 * Generate a memoized selector function.
 * @see {@link https://github.com/reduxjs/reselect#createselectorinputselectors--inputselectors-resultfunc-selectoroptions}
 */
export const notificationSelector = createSelector(
  // Call these selectors ...
  notificationReducerSelector,
  // ... and pass the results to this ...
  (notificationEntities) => {
    // ... so that we re-render when there are changes to the notification entities.
    return notificationEntities.notifications.map((notification) => {
      return {
        ...notification,
        ...notification.variables,
        created_at: getNotificationCardDate(notification.created_at),
      };
    });
  },
);
