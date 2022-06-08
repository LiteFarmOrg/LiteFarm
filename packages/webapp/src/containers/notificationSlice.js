import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { getNotificationCardDate } from '../util/moment';

/**
 * Generate action creators and action types that correspond to a specified initial state and a specified set of reducers.
 * @see {@link https://redux-toolkit.js.org/api/createslice/}
 */
const addManyNotifications = (state, { payload: notifications }) => {
  notificationAdapter.upsertMany(state, notifications);
};

const notificationAdapter = createEntityAdapter({
  selectId: (notification) => notification.notification_id,
});

const notificationSlice = createSlice({
  name: 'notificationReducer',
  initialState: notificationAdapter.getInitialState({
    loading: false,
    loaded: false,
    error: undefined,
  }),
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
      addManyNotifications(state, { payload: notifications });
      state.loading = false;
      state.loaded = true;
      state.error = null;
    },
  },
});

export const { onLoadingNotificationStart, onLoadingNotificationFail, getNotificationSuccess } =
  notificationSlice.actions;
export default notificationSlice.reducer;

export const notificationReducerSelector = (state) =>
  state.farmStateReducer[notificationSlice.name];

const notificationSelectors = notificationAdapter.getSelectors(
  (state) => state.farmStateReducer[notificationSlice.name],
);

export const notificationEntitiesSelector = notificationSelectors.selectEntities;

/**
 * Generate a memoized selector function.
 * @see {@link https://github.com/reduxjs/reselect#createselectorinputselectors--inputselectors-resultfunc-selectoroptions}
 */
export const notificationsSelector = createSelector(
  // Call these selectors ...
  notificationSelectors.selectAll,
  // ... and pass the results to this ...
  (notificationEntities) => {
    // ... so that we re-render when there are changes to the notification entities.
    return notificationEntities.map((notification) => {
      return {
        ...notification,
        ...notification.variables,
        created_at: getNotificationCardDate(notification.created_at),
      };
    });
  },
);

export const notificationSelector = (notification_id) => (state) => {
  return notificationSelectors.selectById(state, notification_id);
};
