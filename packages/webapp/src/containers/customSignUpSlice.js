import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customSignUpErrorKey: null,
};

const customSignUpSlice = createSlice({
  name: 'customSignUpReducer',
  initialState,
  reducers: {
    setCustomSignUpErrorKey: (state, { payload: { key } }) => {
      state.customSignUpErrorKey = key;
    },
  },
});

export const { setCustomSignUpErrorKey } = customSignUpSlice.actions;

export const customSignUpErrorKeySelector = (state) =>
  state.tempStateReducer[customSignUpSlice.name]?.customSignUpErrorKey;

export default customSignUpSlice.reducer;
