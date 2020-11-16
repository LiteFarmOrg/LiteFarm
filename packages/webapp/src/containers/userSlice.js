import { createSlice } from '@reduxjs/toolkit';
import { onLoadingStart, onLoadingFail, loginSelector } from './loginSlice';
import { createSelector } from 'reselect';
export const initialState = {
  all_user_id: [],
  by_user_id: {},
  loading: false,
  error: undefined,
};

const userSlice = createSlice({
  name: 'userReducer',
  initialState,
  reducers: {
    onLoadingUsersStart: onLoadingStart,
    onLoadingUsersFail: onLoadingFail,
    getUsersSuccess: (state, { payload: { users } }) => {
      state.loading = false;
      state.error = null;
      users.forEach(user => {
        state.by_user_id[user.user_id] = user;
      });
      state.all_user_id = Object.keys(state.by_user_id);
    },
    getUserSuccess: (state, { payload: { user } }) => {
      state.loading = false;
      state.error = null;
      state.by_user_id[user.user_id] = user;
      state.all_user_id = Object.keys(state.by_user_id);
    },
  },
});
export const { onLoadingUsersStart, onLoadingUsersFail, getUsersSuccess, getUserSuccess } = userSlice.actions;
export default userSlice.reducer;

export const usersSelector = (state) => ({
  users: Object.values(state.entitiesReducer[userSlice.name].by_user_id),
  ...state.entitiesReducer[userSlice.name],
});
export const userSelector = createSelector([loginSelector, usersSelector], ({ user_id }, { by_user_id, loading, error }) => {
  return { user: by_user_id[user_id], loading, error };
});
export const userSelectorByUserId = (user_id) => createSelector([usersSelector], ({ by_user_id, loading, error }) => {
  return { user: by_user_id[user_id], loading, error };
})
