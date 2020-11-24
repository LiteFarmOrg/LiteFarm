import { call, put, takeLatest, select } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { toastr } from 'react-redux-toastr';
import { loginSelector } from '../../userFarmSlice';
import { getHeader } from '../../saga';
import {
  getUserFarmsSuccess,
  putUserSuccess,
  postUserSuccess,
  patchUserStatusSuccess,
  onLoadingUserFarmsFail,
  onLoadingUserFarmsStart,
} from '../../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { onLoadingRolesStart, onLoadingRolesFail, getRolesSuccess } from './slice';

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

export const addUser = createAction('addUserSaga');

export function* addUserSaga({ payload: user }) {
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  user.farm_id = farm_id;
  const { createUserUrl } = apiConfig;

  try {
    const result = yield call(axios.post, createUserUrl, user, header);
    //TODO post should return id. Remove nested saga call.

    yield put(postUserSuccess(result.data));
    toastr.success('Successfully added user to farm!');
  } catch (err) {
    //console.log(err.response.status);
    if (err.response.status === 409) {
      toastr.error('User already exists in LiteFarm Network');
    } else toastr.error('Failed to add user');
  }
}

export const addPseudoWorker = createAction('addPseudoWorkerSaga');

export function* addPseudoWorkerSaga({ payload: user }) {

  const { pseudoUserUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  user.farm_id = farm_id;

  try {
    const result = yield call(axios.post, pseudoUserUrl, user, header);
    yield put(postUserSuccess(result.data));
    toastr.success('Successfully added user to farm!');
  } catch (err) {
    console.error(err);
    toastr.error('Failed to add user');
  }
}

export const deactivateUser = createAction('deactivateUserSaga');

export function* deactivateUserSaga({ payload: target_user_id }) {
  const { userFarmUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const body = {
    status: 'Inactive',
  };

  try {
    const result = yield call(axios.patch, `${userFarmUrl}/status/farm/${farm_id}/user/${target_user_id}`, body, header);
    yield put(patchUserStatusSuccess({ farm_id, user_id: target_user_id, ...body }));
    toastr.success('User access revoked!');

  } catch (e) {
    toastr.error('There was an error revoking access!');
  }
}

export const reactivateUser = createAction('reactivateUserSaga');

export function* reactivateUserSaga({ payload: target_user_id }) {
  const { userFarmUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const body = {
    status: 'Active',
  };

  try {
    const result = yield call(axios.patch, `${userFarmUrl}/status/farm/${farm_id}/user/${target_user_id}`, body, header);
    yield put(patchUserStatusSuccess({ farm_id, user_id: target_user_id, ...body }));
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
    yield put(onLoadingRolesStart());
    const result = yield call(axios.get, rolesUrl, header);
    yield put(getRolesSuccess(result.data));
  } catch (e) {
    yield put(onLoadingRolesFail());
    console.log('failed to fetch roles from database')
  }
}

export default function* peopleSaga() {
  yield takeLatest(getAllUserFarmsByFarmId.type, getAllUserFarmsByFarmIDSaga);
  yield takeLatest(addUser.type, addUserSaga);
  yield takeLatest(addPseudoWorker.type, addPseudoWorkerSaga);
  yield takeLatest(deactivateUser.type, deactivateUserSaga);
  yield takeLatest(updateUserFarm.type, updateUserFarmSaga);
  yield takeLatest(getRoles.type, getRolesSaga);
  yield takeLatest(reactivateUser.type, reactivateUserSaga);
}
