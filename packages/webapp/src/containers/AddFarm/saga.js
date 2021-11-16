/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saga.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import history from '../../history';
import { all, call, put, select, takeLeading } from 'redux-saga/effects';
import apiConfig, { farmUrl, userFarmUrl } from '../../apiConfig';
import {
  loginSelector,
  patchFarmSuccess,
  patchRoleStepTwoSuccess,
  postFarmSuccess,
  selectFarmSuccess,
  setLoadingEnd,
  setLoadingStart,
  userFarmSelector,
} from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import { createAction } from '@reduxjs/toolkit';
import i18n from '../../locales/i18n';
import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';

const patchRoleUrl = (farm_id, user_id) => `${userFarmUrl}/role/farm/${farm_id}/user/${user_id}`;
const patchFarmUrl = (farm_id) => `${farmUrl}/owner_operated/${farm_id}`;
const patchStepUrl = (farm_id, user_id) =>
  `${userFarmUrl}/onboarding/farm/${farm_id}/user/${user_id}`;
export const postFarm = createAction('postFarmSaga');
export function* postFarmSaga({ payload: farm }) {
  const { user_id } = yield select(loginSelector);
  yield put(setLoadingStart());
  let addFarmData = {
    farm_name: farm.farmName,
    address: farm.address,
    grid_points: farm.gridPoints,
    country: farm.country,
  };
  const header = getHeader(user_id);
  const { userUrl, url } = apiConfig;
  try {
    const [addFarmResult, getUserResult] = yield all([
      call(axios.post, farmUrl, addFarmData, header),
      call(axios.get, userUrl + '/' + user_id, header),
    ]);
    const farm = addFarmResult.data;
    const { farm_id } = farm;
    let step = {
      step_one: true,
      step_one_end: new Date(),
    };
    yield call(axios.patch, patchStepUrl(farm_id, user_id), step, getHeader(user_id, farm_id));
    const user = getUserResult?.data;
    yield put(
      postFarmSuccess({
        ...user,
        ...farm,
        ...step,
        country: addFarmData.country,
      }),
    );
    yield put(selectFarmSuccess({ farm_id }));
    history.push('/role_selection');
    const {
      data: { farm_token },
    } = yield call(axios.get, `${url}/farm_token/farm/${farm_id}`, getHeader(user_id, farm_id));
    localStorage.setItem('farm_token', farm_token);
  } catch (e) {
    yield put(setLoadingEnd());
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:FARM.ERROR.ADD')));
  }
}

export const patchFarm = createAction('patchFarmSaga');
export function* patchFarmSaga({ payload: farm }) {
  const { user_id, farm_id, step_one } = yield select(userFarmSelector);
  const header = getHeader(user_id, farm_id);

  let patchFarmData = {
    farm_name: farm.farmName,
    address: farm.address,
    grid_points: farm.gridPoints,
    country: farm.country,
  };

  try {
    const patchedFarm = yield call(axios.patch, `${farmUrl}/${farm_id}`, patchFarmData, header);
    const farm = patchedFarm.data[0];
    if (!step_one) {
      const step = {
        step_one: true,
        step_one_end: new Date(),
      };
      yield call(axios.patch, patchStepUrl(farm_id, user_id), step, getHeader(user_id, farm_id));
    }
    yield put(patchFarmSuccess({ ...farm, user_id, step_one: true }));
    history.push('/role_selection');
  } catch (e) {
    console.error(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:FARM.ERROR.ADD')));
  }
}

export const patchRole = createAction('patchRoleSaga');
export function* patchRoleSaga({ payload }) {
  try {
    const userFarm = yield select(userFarmSelector);
    const { user_id, farm_id, step_two, step_two_end } = userFarm;
    const { role, owner_operated, role_id, callback } = payload;
    const header = getHeader(user_id, farm_id);
    //TODO set date on server
    let step = {
      step_two: true,
      step_two_end: step_two_end || new Date(),
    };
    yield all([
      call(axios.patch, patchRoleUrl(farm_id, user_id), { role_id }, header),
      !step_two && call(axios.patch, patchStepUrl(farm_id, user_id), step, header),
      owner_operated !== null &&
        call(axios.patch, patchFarmUrl(farm_id), { owner_operated }, header),
    ]);
    yield put(
      patchRoleStepTwoSuccess({ ...step, user_id, farm_id, role, role_id, owner_operated }),
    );
    callback && callback();
  } catch (e) {
    console.log('fail to update role');
  }
}

export default function* addFarmSaga() {
  yield takeLeading(postFarm.type, postFarmSaga);
  yield takeLeading(patchFarm.type, patchFarmSaga);
  yield takeLeading(patchRole.type, patchRoleSaga);
}
