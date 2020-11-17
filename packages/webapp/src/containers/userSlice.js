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

export const userReducerSelector = state => state.entitiesReducer[userSlice.name];
export const usersSelector = createSelector([userReducerSelector], ({ by_user_id, loading, error, ...rest }) => {
  return { userFarms: Object.values(by_user_id), loading, error, by_user_id, ...rest };
});
export const userSelector = createSelector([loginSelector, userReducerSelector], ({ user_id }, { by_user_id, loading, error }) => {
  return { user: by_user_id[user_id], loading, error };
});
export const userSelectorByUserId = (user_id) => createSelector([userReducerSelector], ({ by_user_id, loading, error }) => {
  return { user: by_user_id[user_id], loading, error };
})
