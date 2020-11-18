import {
  ADD_PSEUDO_WORKER,
  ADD_USER_FROM_PEOPLE,
  DEACTIVATE_USER,
  GET_ALL_USER_BY_FARM,
  GET_ROLES,
  GET_USER_IN_PEOPLE,
  REACTIVATE_USER,
  UPDATE_USER_FARM,
  UPDATE_USER_IN_PEOPLE,
} from './constants';
import { getAllUsers, setFarmID, setRolesInState, setUsersInState } from './actions';
import { call, put, takeLatest, select } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { toastr } from 'react-redux-toastr';
import Auth from '../../../Auth/Auth';
import { setUserInState } from '../../actions';
import { getUser } from '../../ChooseFarm/saga';
import { loginSelector } from '../../loginSlice';
import { getHeader } from '../../saga';
import { getUserFarmsSuccess, putUserSuccess, postUserSuccess, patchUserStatusSuccess, onLoadingUserFarmsFail, onLoadingUserFarmsStart } from '../../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';

const axios = require('axios');

export const getAllUserFarmsByFarmId = createAction('getAllUserFarmsByFarmIDSaga');

export function* getAllUserFarmsByFarmIDSaga() {
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const { userFarmUrl } = apiConfig;
  try {
    yield put(onLoadingUserFarmsStart());
    // only non-deleted users
    const result = yield call(axios.get, userFarmUrl + '/farm/' + farm_id, header);
    yield put(getUserFarmsSuccess(result.data));
  } catch (e) {
    yield put(onLoadingUserFarmsFail());
    console.log('failed to fetch users from database')
  }
}

export const updateUser = createAction('updateUserSaga');

export function* updateUserSaga(payload) {
  const auth = new Auth();
  const { user_id, farm_id } = yield select(loginSelector);
  let user = payload.user;
  let target_user_id = user.user_id;
  let is_admin = user.is_admin;
  const { userUrl } = apiConfig;
  const header = getHeader(user_id, farm_id);

  if (user.phone_number === null) {
    delete user.phone_number;
  }
  if (user.address === null) {
    delete user.address;
  }
  try {
    const token = yield call(auth.getAPIExplorerToken);
    if (token && token.data) {
      // update the new role for the user, then delete the old role
      yield call(auth.setUserRoleInAuth0, 'auth0|' + target_user_id, token.data.access_token, is_admin);
      yield call(auth.deleteUserRoleInAuth0, 'auth0|' + target_user_id, token.data.access_token, is_admin);
      // must make api call for both auth0 and google-oauth2 accounts, since it is not currently
      // known whether user is google account
      yield call(auth.setUserRoleInAuth0, 'google-oauth2|' + target_user_id, token.data.access_token, is_admin);
      yield call(auth.deleteUserRoleInAuth0, 'google-oauth2|' + target_user_id, token.data.access_token, is_admin);
    }
    const result = yield call(axios.put, userUrl + '/' + target_user_id, user, header);
    yield put(putUserSuccess({ ...user, farm_id }));
    toastr.success('Successfully updated user!');

  } catch (err) {
    console.error('failed to update setting');
    toastr.error('Failed to update user');
  }
}

export const addUser = createAction('addUserSaga');

export function* addUserSaga(payload) {
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  let user = { ...payload.user, farm_id };
  const { createUserUrl } = apiConfig;

  try {
    const result = yield call(axios.post, createUserUrl, user, header);
    //TODO post should return id. Remove nested saga call.
    yield put(getAllUserFarmsByFarmId());
    toastr.success('Successfully added user to farm!');
  } catch (err) {
    //console.log(err.response.status);
    if (err.response.status === 409) {
      toastr.error('User already exists in LiteFarm Network');
    } else toastr.error('Failed to add user');
  }
}

export const addPseudoWorker = createAction('addPseudoWorkerSaga');

export function* addPseudoWorkerSaga(payload) {
  let user = payload.user;
  const { pseudoUserUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.post, pseudoUserUrl, user, header);
    yield put(postUserSuccess({ ...user, ...result.data, farm_id }));
    toastr.success('Successfully added user to farm!');
  } catch (err) {
    console.error(err);
    toastr.error('Failed to add user');
  }
}

export const deactivateUser = createAction('deactivateUserSaga');

export function* deactivateUserSaga(payload) {
  const { userFarmUrl } = apiConfig;
  let target_user_id = payload.user_id;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const body = {
    status: 'Inactive',
  };

  try {
    const result = yield call(axios.patch, `${userFarmUrl}/status/farm/${farm_id}/user/${target_user_id}`, body, header);

    yield put(patchUserStatusSuccess({ farm_id, user_id, ...body }));
    toastr.success('User access revoked!');

  } catch (e) {
    toastr.error('There was an error revoking access!');
  }
}

export const reactivateUser = createAction('reactivateUserSaga');

export function* reactivateUserSaga(payload) {
  const { userFarmUrl } = apiConfig;
  let target_user_id = payload.user_id;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const body = {
    status: 'Active',
  };

  try {
    const result = yield call(axios.patch, `${userFarmUrl}/status/farm/${farm_id}/user/${target_user_id}`, body, header);
    yield put(patchUserStatusSuccess({ farm_id, user_id, ...body }));
    toastr.success('User access restored!');

  } catch (e) {
    toastr.error('There was an error restoring access!');
  }
}

export const updateUserFarm = createAction('updateUserFarmSaga');

export function* updateUserFarmSaga({ payload: user }) {
  let target_user_id = user.user_id;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    delete user.user_id;
    // TODO: TO BE DEPRECATED
    const result = yield call(axios.patch, apiConfig.userFarmUrl + '/update/' + `farm/${farm_id}/user/${target_user_id}`, user, header);
    yield put(putUserSuccess({ ...user, farm_id, user_id: target_user_id }));
    toastr.success('User updated!');

  } catch (e) {
    toastr.error('There was an error updating this user!');
    console.error(e);
  }
}
export const getRoles = createAction('getRolesSaga');

export function* getRolesSaga() {
  const { rolesUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.get, rolesUrl, header);
    yield put(setRolesInState(result.data));
  } catch (e) {
    console.log('failed to fetch roles from database')
  }
}

export default function* peopleSaga() {
  yield takeLatest(getAllUserFarmsByFarmId.type, getAllUserFarmsByFarmIDSaga);
  yield takeLatest(UPDATE_USER_IN_PEOPLE, updateUserSaga);
  yield takeLatest(ADD_USER_FROM_PEOPLE, addUserSaga);
  yield takeLatest(ADD_PSEUDO_WORKER, addPseudoWorkerSaga);
  yield takeLatest(DEACTIVATE_USER, deactivateUserSaga);
  yield takeLatest(updateUserFarm.type, updateUserFarmSaga);
  yield takeLatest(GET_ROLES, getRolesSaga);
  yield takeLatest(REACTIVATE_USER, reactivateUserSaga);
}
