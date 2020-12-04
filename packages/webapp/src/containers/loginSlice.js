import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  farm_id: undefined,
  user_id: undefined,
};

export function onLoadingStart(state) {
  state.loading = true;
}

export function onLoadingFail(state, { payload: { error } }) {
  state.loading = false;
  state.error = error;
  state.loaded = true;
}

const loginSlice = createSlice({
  name: 'loginReducer',
  initialState,
  reducers: {
    loginSuccess: (state, { payload: { user_id } }) => {
      state.user_id = user_id;
    },
    selectFarmSuccess: (state, { payload: { farm_id } }) => {
      state.farm_id = farm_id;
    },
    logoutSuccess: (state) => {
      state.user_id = undefined;
      state.farm_id = undefined;
    },
    deselectFarmSuccess: (state) => (state.farm_id = undefined),
  },
});

export const { loginSuccess, selectFarmSuccess, deselectFarmSuccess } = loginSlice.actions;
export default loginSlice.reducer;
export const loginSelector = (state) => state?.entitiesReducer[loginSlice.name];
