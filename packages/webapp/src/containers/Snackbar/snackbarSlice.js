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
      state.notifications = [
        ...state.notifications,
        { message, key, options: { variant: 'common' } },
      ];
    },
    /**
     * Accept a string message directly or an object containing the message and persist.
     *
     * Examples:
     * - enqueueErrorSnackbar("Error message.")
     * - enqueueErrorSnackbar({ message: "Error message.", persist: true })
     *
     * @param {string | { message: string, persist?: boolean }} payload
     */
    enqueueErrorSnackbar: (state, { payload }) => {
      if (typeof payload === 'object' && !payload.message) {
        console.error('Invalid payload: missing message property');
        return;
      }

      const message = typeof payload === 'object' ? payload.message : payload;
      const persist = typeof payload === 'object' && payload.persist ? payload.persist : false;

      const key = `error-${new Date().getTime()}`;
      state.notifications = [
        ...state.notifications,
        { message, key, options: { variant: 'common', persist } },
      ];
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
