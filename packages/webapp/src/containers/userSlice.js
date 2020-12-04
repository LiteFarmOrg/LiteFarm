import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingStart, onLoadingFail, loginSelector } from './loginSlice';
import { createSelector } from 'reselect';

const userAdapter = createEntityAdapter({
  selectId: (user) => user.user_id,
});

const addOneUser = (state, { payload: user }) => {
  state.loading = false;
  state.error = null;
  userAdapter.upsertOne(state, user);
};
const addManyUsers = (state, { payload: users }) => {
  state.loading = false;
  state.error = null;
  userAdapter.upsertMany(state, users);
};

const userSlice = createSlice({
  name: 'userReducer',
  initialState: userAdapter.getInitialState({
    loading: false,
    error: undefined,
  }),
  reducers: {
    onLoadingUsersStart: onLoadingStart,
    onLoadingUsersFail: onLoadingFail,
    getUsersSuccess: addManyUsers,
    getUserSuccess: addOneUser,
  },
});
export const {
  onLoadingUsersStart,
  onLoadingUsersFail,
  getUsersSuccess,
  getUserSuccess,
} = userSlice.actions;
export default userSlice.reducer;

export const userReducerSelector = (state) => state.entitiesReducer[userSlice.name];
const userSelectors = userAdapter.getSelectors((state) => state.entitiesReducer[userSlice.name]);

export const usersSelector = userSelectors.selectAll;
export const userSelector = (state) => {
  const { user_id } = loginSelector(state);
  return user_id ? userSelectors.selectById(state, user_id) || {} : {};
};
export const userSelectorByUserId = userSelectors.selectById;
export const userStatusSelector = createSelector([userReducerSelector], ({ loading, error }) => {
  return { loading, error };
});
