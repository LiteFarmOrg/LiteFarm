import { createSlice } from '@reduxjs/toolkit';
import { onLoadingStart, onLoadingFail } from '../../userFarmSlice';
import { createSelector } from 'reselect';

export const initialState = {
  roles: [],
  loading: false,
  loaded: false,
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
      state.loaded = true;
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

export const roleIdRoleNameMapSelector = createSelector(rolesSelector, (roles) =>
  roles.reduce((roleIdRoleNameMap, role) => {
    roleIdRoleNameMap[role.role_id] = role.role;
    return roleIdRoleNameMap;
  }, {}),
);

export const roleNameRoleIdMapSelector = createSelector(rolesSelector, (roles) =>
  roles.reduce((roleIdRoleNameMap, role) => {
    roleIdRoleNameMap[role.role] = role.role_id;
    return roleIdRoleNameMap;
  }, {}),
);

export const rolesStatusSelector = createSelector(
  rolesReducerSelector,
  ({ error, loading, loaded }) => ({
    error,
    loaded,
    loading,
  }),
);
