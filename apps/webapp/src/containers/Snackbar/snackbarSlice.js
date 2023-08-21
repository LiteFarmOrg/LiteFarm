import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};
const snackbarSlice = createSlice({
  name: 'snackbarReducer',
  initialState,
  reducers: {
    enqueueSuccessSnackbar: (state, { payload: message }) => {
      const key = `success-${new Date().getTime()}`;
      state.notifications = [...state.notifications, { message, key }];
    },
    enqueueErrorSnackbar: (state, { payload: message }) => {
      const key = `error-${new Date().getTime()}`;
      state.notifications = [...state.notifications, { message, key }];
    },
    closeSnackbar: (state, { payload: key }) => {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        dismissed: key === undefined || key === notification.key ? true : undefined,
      }));
    },
    removeSnackbar: (state, { payload: key }) => {
      state.notifications = state.notifications.filter((notification) => notification.key !== key);
    },
  },
});
export const { enqueueSuccessSnackbar, enqueueErrorSnackbar, closeSnackbar, removeSnackbar } =
  snackbarSlice.actions;
export default snackbarSlice.reducer;

export const snackbarSelector = (state) => state.tempStateReducer[snackbarSlice.name].notifications;
