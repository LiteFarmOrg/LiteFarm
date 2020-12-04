import { createSlice } from '@reduxjs/toolkit';
import { onLoadingStart, onLoadingFail } from '../../loginSlice';
import { createSelector } from 'reselect';

export const initialState = {
  roles: [],
  loading: false,
  error: undefined,
};

const roleSlice = createSlice({
  name: 'rolesReducer',
  initialState,
  reducers: {
    onLoadingRolesStart: onLoadingStart,
    onLoadingRolesFail: onLoadingFail,
    getRolesSuccess: (state, { payload: roles }) => {
      state.loading = false;
      state.error = null;
      state.roles = roles;
    },
  },
});

export const { getRolesSuccess, onLoadingRolesStart, onLoadingRolesFail } = roleSlice.actions;
export default roleSlice.reducer;

export const rolesReducerSelector = (state) => state.entitiesReducer[roleSlice.name];
export const rolesSelector = createSelector(
  rolesReducerSelector,
  (roleReducer) => roleReducer.roles,
);
export const rolesStatusSelector = createSelector(rolesReducerSelector, ({ error, loading }) => ({
  error,
  loading,
}));
