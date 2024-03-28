import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customSignUpErrorKey: null,
  passwordResetError: null,
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
  },
});

export const { setCustomSignUpErrorKey, setPasswordResetError } = customSignUpSlice.actions;

export const customSignUpErrorKeySelector = (state) =>
  state.tempStateReducer[customSignUpSlice.name]?.customSignUpErrorKey;

export const passwordResetErrorSelector = (state) =>
  state.tempStateReducer[customSignUpSlice.name]?.passwordResetError;

export default customSignUpSlice.reducer;
