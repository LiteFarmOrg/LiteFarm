import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  lastActiveDatetime: undefined,
  farm_id: undefined,
};

const userLogSlice = createSlice({
  name: 'userLogReducer',
  initialState,
  reducers: {
    logUserInfoSuccess: (state, { payload: farm_id }) => {
      state.lastActiveDatetime = new Date().getTime();
      state.farm_id = farm_id;
    },
  },
});

export const { logUserInfoSuccess } = userLogSlice.actions;
export default userLogSlice.reducer;
export const lastActiveDatetimeSelector = (state) =>
  state?.persistedStateReducer[userLogSlice.name].lastActiveDatetime;
export const userLogReducerSelector = (state) => state?.persistedStateReducer[userLogSlice.name];
