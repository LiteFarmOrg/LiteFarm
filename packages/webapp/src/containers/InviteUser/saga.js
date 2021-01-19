import { call, put, takeLatest, select } from 'redux-saga/effects';
import { toastr } from 'react-redux-toastr';
import apiConfig from '../../apiConfig';
import { loginSelector, postUserSuccess } from '../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { getHeader } from '../saga';
import i18n from '../../lang/i18n';

const axios = require('axios');

export const addUser = createAction('addUserSaga');

export function* addUserSaga({ payload: user }) {
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  user.farm_id = farm_id;
  const { inviteUserUrl } = apiConfig;

  try {
    const result = yield call(axios.post, inviteUserUrl, user, header);
    //TODO post should return id. Remove nested saga call.

    yield put(postUserSuccess(result.data));
    toastr.success(i18n.t('message:USER.SUCCESS.ADD'));
  } catch (err) {
    //console.log(err.response.status);
    if (err.response.status === 409) {
      toastr.error(i18n.t('message:USER.ERROR.EXISTS'));
    } else toastr.error(i18n.t('message:USER.ERROR.ADD'));
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
    toastr.success(i18n.t('message:USER.SUCCESS.ADD'));
  } catch (err) {
    console.error(err);
    toastr.error(i18n.t('message:USER.ERROR.ADD'));
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
    console.log('failed to fetch roles from database');
  }
}

export default function* peopleSaga() {
  yield takeLatest(addUser.type, addUserSaga);
  yield takeLatest(addPseudoWorker.type, addPseudoWorkerSaga);
  yield takeLatest(getRoles.type, getRolesSaga);
}