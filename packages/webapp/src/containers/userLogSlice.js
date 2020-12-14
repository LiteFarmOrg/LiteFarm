import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  lastActiveDatetime: undefined,
};

const userLogSlice = createSlice({
  name: 'userLogReducer',
  initialState,
  reducers: {
    logUserInfoSuccess: (state) => {
      state.lastActiveDatetime = new Date().getTime();
    },
  },
});

export const { logUserInfoSuccess } = userLogSlice.actions;
export default userLogSlice.reducer;
export const lastActiveDatetimeSelector = (state) =>
  state?.persistedStateReducer[userLogSlice.name].lastActiveDatetime;
