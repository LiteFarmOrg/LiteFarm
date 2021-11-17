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

import { call, put, race, select, take, takeLatest, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { loginSelector, patchFarmSuccess } from '../userFarmSlice';
import { axios, getHeader, getManagementPlanAndPlantingMethodSuccessSaga } from '../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  deleteManagementPlanSuccess,
  onLoadingManagementPlanFail,
  onLoadingManagementPlanStart,
} from '../managementPlanSlice';
import i18n from '../../locales/i18n';
import history from '../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { getTasksSuccessSaga } from '../Task/saga';
import { getCropManagementPlansSuccess } from '../cropManagementPlanSlice';

const DEC = 10;

export const getExpiredManagementPlans = createAction(`getExpiredManagementPlansSaga`);

export function* getExpiredManagementPlansSaga() {
  const { managementPlanURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingManagementPlanStart());
    const result = yield call(axios.get, managementPlanURL + '/expired/farm/' + farm_id, header);
    yield call(getManagementPlanAndPlantingMethodSuccessSaga, { payload: [result.data] });
  } catch (e) {
    yield put(onLoadingManagementPlanFail());
    console.error('failed to fetch expired crops from database');
  }
}

export const postManagementPlan = createAction(`postManagementPlanSaga`);

export function* postManagementPlanSaga({ payload: managementPlan }) {
  const { managementPlanURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.post, managementPlanURL, managementPlan, header);
    yield call(getManagementPlanAndPlantingMethodSuccessSaga, {
      payload: [result.data.management_plan],
    });
    yield call(getTasksSuccessSaga, { payload: result.data.tasks });
    const management_plan_id = result.data.management_plan.management_plan_id;
    history.push(
      `/crop/${managementPlan.crop_variety_id}/management_plan/${management_plan_id}/tasks`,
      { fromCreation: true },
    );
    yield put(enqueueSuccessSnackbar(i18n.t('message:MANAGEMENT_PLAN.SUCCESS.POST')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:MANAGEMENT_PLAN.ERROR.POST')));
  }
}

export const patchFarmDefaultInitialLocation = createAction(`patchFarmDefaultInitialLocationSaga`);

export function* patchFarmDefaultInitialLocationSaga({ payload: farm }) {
  const { url } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${url}/farm/${farm_id}/default_initial_location`,
      farm,
      header,
    );
    yield put(patchFarmSuccess({ ...farm, farm_id, user_id }));
  } catch (e) {}
}

export const patchManagementPlan = createAction(`patchManagementPlanSaga`);

export function* patchManagementPlanSaga({ payload: managementPlan }) {
  const { managementPlanURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.patch,
      managementPlanURL + `/${managementPlan.management_plan_id}`,
      managementPlan,
      header,
    );
    yield call(getManagementPlanAndPlantingMethodSuccessSaga, { payload: [managementPlan] });
    yield put(enqueueSuccessSnackbar(i18n.t('message:PLAN.SUCCESS.EDIT')));
    history.push(
      `/crop/${managementPlan.crop_variety_id}/management_plan/${managementPlan.management_plan_id}/details`,
    );
  } catch (e) {
    console.log('Failed to update managementPlan to database');
    yield put(enqueueErrorSnackbar(i18n.t('message:PLAN.ERROR.EDIT')));
  }
}

export const deleteManagementPlan = createAction(`deleteManagementPlanSaga`);

export function* deleteManagementPlanSaga({ payload: management_plan_id }) {
  const currentDate = formatDate(new Date());
  const { managementPlanURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, managementPlanURL + `/${management_plan_id}`, header);
    yield put(deleteManagementPlanSuccess(management_plan_id));
    yield put(enqueueSuccessSnackbar(i18n.t('message:CROP.SUCCESS.DELETE')));
  } catch (e) {
    console.log('Failed To Delete Field Crop Error: ', e);
    yield put(enqueueErrorSnackbar(i18n.t('message:CROP.ERROR.DELETE')));
  }
}

const formatDate = (currDate) => {
  const d = currDate;
  let year = d.getFullYear(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

export default function* managementPlanSaga() {
  yield takeLeading(postManagementPlan.type, postManagementPlanSaga);
  yield takeLeading(patchFarmDefaultInitialLocation.type, patchFarmDefaultInitialLocationSaga);
  yield takeLatest(getExpiredManagementPlans.type, getExpiredManagementPlansSaga);
  yield takeLeading(deleteManagementPlan.type, deleteManagementPlanSaga);
  yield takeLeading(patchManagementPlan.type, patchManagementPlanSaga);
}
