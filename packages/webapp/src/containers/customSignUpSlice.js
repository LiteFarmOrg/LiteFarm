import { createSlice } from '@reduxjs/toolkit';
import { CUSTOM_SIGN_UP } from './CustomSignUp/constants';

const initialState = {
  customSignUpErrorKey: null,
  passwordResetError: null,
  user: null,
  component: CUSTOM_SIGN_UP,
};

const customSignUpSlice = createSlice({
  name: 'customSignUpReducer',
  initialState,
  reducers: {
    setCustomSignUpErrorKey: (state, { payload: { key } }) => {
      state.customSignUpErrorKey = key;
    },
    setPasswordResetError: (state, { payload: error }) => {
      state.passwordResetError = error;
    },
    setCustomSignUpUser: (state, { payload: user }) => {
      state.user = user;
    },
    setCustomSignUpComponent: (state, { payload: component }) => {
      state.component = component;
    },
  },
});

export const {
  setCustomSignUpErrorKey,
  setPasswordResetError,
  setCustomSignUpUser,
  setCustomSignUpComponent,
} = customSignUpSlice.actions;

export const customSignUpErrorKeySelector = (state) =>
  state.tempStateReducer[customSignUpSlice.name]?.customSignUpErrorKey;

export const passwordResetErrorSelector = (state) =>
  state.tempStateReducer[customSignUpSlice.name]?.passwordResetError;

export const customSignUpUserSelector = (state) =>
  state.tempStateReducer[customSignUpSlice.name]?.user;

export const customSignUpComponentSelector = (state) =>
  state.tempStateReducer[customSignUpSlice.name]?.component;

export default customSignUpSlice.reducer;
