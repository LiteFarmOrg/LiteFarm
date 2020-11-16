import { createSlice } from '@reduxjs/toolkit';
import { onLoadingStart, onLoadingFail, loginSelector } from './loginSlice';
import { createSelector } from 'reselect';
import { usersSelector } from './userSlice';

export const initialState = {
  all_farm_id: [],
  by_farm_id: {},
  loading: false,
  error: undefined,
};

const userFarmSlice = createSlice({
  name: 'userFarmReducer',
  initialState,
  reducers: {
    onLoadingUserFarmsStart: onLoadingStart,
    onLoadingUserFarmsFail: onLoadingFail,
    getUserFarmsSuccess: (state, { payload: { userFarms } }) => {
      state.loading = false;
      state.error = null;
      userFarms.forEach(userFarm => {
        state.by_farm_id[userFarm.farm_id] = userFarm;
      });
      state.all_farm_id = Object.keys(state.by_farm_id);
    },
  },
});
export const { onLoadingUserFarmsStart, onLoadingUserFarmsFail, getUserFarmsSuccess } = userFarmSlice.actions;
export default userFarmSlice.reducer;
export const userFarmsSelector = (state) => ({
  userFarms: Object.values(state.entitiesReducer[userFarmSlice.name].by_farm_id),
  ...state[userFarmSlice.name],
});
export const userFarmSelector = createSelector([loginSelector, usersSelector], ({ farm_id }, { by_farm_id, loading, error }) => {
  return { userFarm: by_farm_id[farm_id], loading, error };
});
