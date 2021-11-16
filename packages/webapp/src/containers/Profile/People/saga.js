import { all, call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import apiConfig, { userFarmUrl } from '../../../apiConfig';
import {
  getUserFarmSelector,
  getUserFarmsSuccess,
  invitePseudoUserSuccess,
  loginSelector,
  onLoadingUserFarmsFail,
  onLoadingUserFarmsStart,
  patchUserStatusSuccess,
  putUserSuccess,
} from '../../userFarmSlice';
import { axios, getHeader } from '../../saga';
import { createAction } from '@reduxjs/toolkit';
import i18n from '../../../locales/i18n';
import { roleIdRoleNameMapSelector } from './slice';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';

const patchRoleUrl = (farm_id, user_id) => `${userFarmUrl}/role/farm/${farm_id}/user/${user_id}`;
const patchWageUrl = (farm_id, user_id) => `${userFarmUrl}/wage/farm/${farm_id}/user/${user_id}`;

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
    yield put(onLoadingUserFarmsFail(e));
    console.log('failed to fetch users from database');
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
    const result = yield call(
      axios.patch,
      `${userFarmUrl}/status/farm/${farm_id}/user/${target_user_id}`,
      body,
      header,
    );
    yield put(patchUserStatusSuccess({ farm_id, user_id: target_user_id, ...body }));
    yield put(enqueueSuccessSnackbar(i18n.t('message:USER.SUCCESS.REVOKE')));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.REVOKE')));
  }
}

export const reactivateUser = createAction('reactivateUserSaga');

export function* reactivateUserSaga({ payload: target_user_id }) {
  const { userFarmUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const user = yield select(getUserFarmSelector(farm_id, target_user_id));
  const header = getHeader(user_id, farm_id);

  const body = {
    status: user.has_consent ? 'Active' : 'Invited',
  };

  try {
    const result = yield call(
      axios.patch,
      `${userFarmUrl}/status/farm/${farm_id}/user/${target_user_id}`,
      body,
      header,
    );
    yield put(patchUserStatusSuccess({ farm_id, user_id: target_user_id, ...body }));
    yield put(enqueueSuccessSnackbar(i18n.t('message:USER.SUCCESS.RESTORE')));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.RESTORE')));
  }
}

export const updateUserFarm = createAction('updateUserFarmSaga');

export function* updateUserFarmSaga({ payload: user }) {
  let target_user_id = user.user_id;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const patchRequests = [];
    user.wage &&
      patchRequests.push(call(axios.patch, patchWageUrl(farm_id, target_user_id), user, header));
    user.role_id &&
      patchRequests.push(call(axios.patch, patchRoleUrl(farm_id, target_user_id), user, header));
    delete user.user_id;
    const results = yield all(patchRequests);
    if (user.role_id) {
      const roleIdRoleNameMap = yield select(roleIdRoleNameMapSelector);
      user.role = roleIdRoleNameMap[user.role_id];
    }
    yield put(putUserSuccess({ ...user, farm_id, user_id: target_user_id }));
    yield put(enqueueSuccessSnackbar(i18n.t('message:USER.SUCCESS.UPDATE')));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.UPDATE')));
    console.error(e);
  }
}

export const invitePseudoUser = createAction('invitePseudoUserSaga');

export function* invitePseudoUserSaga({ payload: user }) {
  let target_user_id = user.user_id;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    delete user.user_id;
    const result = yield call(
      axios.post,
      apiConfig.userFarmUrl + '/invite/' + `farm/${farm_id}/user/${target_user_id}`,
      user,
      header,
    );
    yield put(
      invitePseudoUserSuccess({
        newUserFarm: result.data,
        pseudoUserFarm: { farm_id, user_id: target_user_id },
      }),
    );
    yield put(enqueueSuccessSnackbar(i18n.t('message:USER.SUCCESS.UPDATE')));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.UPDATE')));
    console.error(e);
  }
}

export default function* peopleSaga() {
  yield takeLatest(getAllUserFarmsByFarmId.type, getAllUserFarmsByFarmIDSaga);
  yield takeLeading(deactivateUser.type, deactivateUserSaga);
  yield takeLeading(updateUserFarm.type, updateUserFarmSaga);
  yield takeLeading(reactivateUser.type, reactivateUserSaga);
  yield takeLeading(invitePseudoUser.type, invitePseudoUserSaga);
}
