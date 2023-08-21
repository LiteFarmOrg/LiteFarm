import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { loginSelector, postUserSuccess } from '../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { axios, getHeader } from '../saga';
import i18n from '../../locales/i18n';

import { getRolesSuccess, onLoadingRolesFail, onLoadingRolesStart } from '../Profile/People/slice';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';

export const inviteUserToFarm = createAction('inviteUserToFarmSaga');

export function* inviteUserToFarmSaga({ payload: user }) {
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  user.farm_id = farm_id;
  const { inviteUserUrl } = apiConfig;

  try {
    const result = yield call(axios.post, inviteUserUrl, user, header);
    //TODO post should return id. Remove nested saga call.

    yield put(postUserSuccess(result.data));
    yield put(enqueueSuccessSnackbar(i18n.t('message:USER.SUCCESS.ADD')));
  } catch (err) {
    if (err.response.status === 409) {
      yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.EXISTS')));
    } else {
      yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.ADD')));
    }
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
    yield put(enqueueSuccessSnackbar(i18n.t('message:USER.SUCCESS.ADD')));
  } catch (err) {
    console.error(err);
    yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.ADD')));
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

export default function* inviteUserSaga() {
  yield takeLeading(inviteUserToFarm.type, inviteUserToFarmSaga);
  yield takeLeading(addPseudoWorker.type, addPseudoWorkerSaga);
  yield takeLatest(getRoles.type, getRolesSaga);
}
