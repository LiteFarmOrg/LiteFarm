import { createSlice } from '@reduxjs/toolkit';

type SnackAction = {
  type: 'link';
  text: string;
  url: string;
};
export type SnackMessage =
  | {
      message: string;
      action?: SnackAction;
    }
  | string;
type SnackbarState = {
  notifications: { message: string | SnackMessage; key: string }[];
};
const normalizedMessage = (message: SnackMessage) => {
  if (typeof message === 'string') return message;
  if (!message.action) return message.message;
  return message;
};

const initialState: SnackbarState = {
  notifications: [],
};
const snackbarSlice = createSlice({
  name: 'snackbarReducer',
  initialState,
  reducers: {
    enqueueSuccessSnackbar: (state, { payload: message }: { payload: SnackMessage }) => {
      const key = `success-${new Date().getTime()}`;
      state.notifications = [...state.notifications, { message: normalizedMessage(message), key }];
    },
    enqueueErrorSnackbar: (state, { payload: message }: { payload: SnackMessage }) => {
      const key = `error-${new Date().getTime()}`;
      state.notifications = [...state.notifications, { message: normalizedMessage(message), key }];
    },
    closeSnackbar: (state, { payload: key }: { payload: string }) => {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        dismissed: key === undefined || key === notification.key ? true : undefined,
      }));
    },
    removeSnackbar: (state, { payload: key }: { payload: string }) => {
      state.notifications = state.notifications.filter((notification) => notification.key !== key);
    },
  },
});
export const { enqueueSuccessSnackbar, enqueueErrorSnackbar, closeSnackbar, removeSnackbar } =
  snackbarSlice.actions;
export default snackbarSlice.reducer;

export const snackbarSelector = (state: any) =>
  state.tempStateReducer[snackbarSlice.name].notifications;
