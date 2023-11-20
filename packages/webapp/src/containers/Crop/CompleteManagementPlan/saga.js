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

import { call, put, select, takeLeading } from 'redux-saga/effects';
import { managementPlanURL } from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { axios, getHeader } from '../../saga';
import { createAction } from '@reduxjs/toolkit';
import { updateManagementPlanSuccess } from '../../managementPlanSlice';
import i18n from '../../../locales/i18n';
import history from '../../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import { getTasks } from '../../Task/saga';

export const completeManagementPlan = createAction(`completeManagementPlanSaga`);

export function* completeManagementPlanSaga({ payload: managementPlan }) {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${managementPlanURL}/${managementPlan.management_plan_id}/complete`,
      managementPlan,
      header,
    );
    yield put(updateManagementPlanSuccess(managementPlan));
    history.push(`/crop/${managementPlan.crop_variety_id}/management`);
    yield put(enqueueSuccessSnackbar(i18n.t('message:MANAGEMENT_PLAN.SUCCESS.COMPLETE')));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:MANAGEMENT_PLAN.ERROR.COMPLETE')));
  }
}

export const abandonManagementPlan = createAction(`abandonManagementPlanSaga`);

export function* abandonManagementPlanSaga({ payload: managementPlan }) {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${managementPlanURL}/${managementPlan.management_plan_id}/abandon`,
      managementPlan,
      header,
    );
    yield put(updateManagementPlanSuccess(managementPlan));
    history.push(`/crop/${managementPlan.crop_variety_id}/management`);
    yield put(enqueueSuccessSnackbar(i18n.t('message:MANAGEMENT_PLAN.SUCCESS.ABANDON')));
    yield put(getTasks());
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:MANAGEMENT_PLAN.ERROR.ABANDON')));
  }
}

export default function* abandonAndCompleteManagementPlanSaga() {
  yield takeLeading(abandonManagementPlan.type, abandonManagementPlanSaga);
  yield takeLeading(completeManagementPlan.type, completeManagementPlanSaga);
}
