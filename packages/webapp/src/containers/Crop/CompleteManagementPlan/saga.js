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

import { createAction } from '@reduxjs/toolkit';
import {
  CANNOT_ABANDON_COMPLETED_PLAN,
  CANNOT_COMPLETE_ABANDONED_PLAN,
} from '@shared/constants/error';
import { call, put, select, takeLeading } from 'redux-saga/effects';
import { managementPlanURL } from '../../../apiConfig';
import i18n from '../../../locales/i18n';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import { getTasks } from '../../Task/saga';
import { updateManagementPlanSuccess } from '../../managementPlanSlice';
import { axios, getHeader } from '../../saga';
import { loginSelector } from '../../userFarmSlice';
import { useNavigate } from 'react-router';

export const completeManagementPlan = createAction(`completeManagementPlanSaga`);

export function* completeManagementPlanSaga({ payload }) {
  let navigate = useNavigate();
  const { displayCannotCompleteModal, ...managementPlan } = payload;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield call(
      axios.patch,
      `${managementPlanURL}/${managementPlan.management_plan_id}/complete`,
      managementPlan,
      header,
    );
    yield put(updateManagementPlanSuccess(managementPlan));
    navigate(`/crop/${managementPlan.crop_variety_id}/management`);
    yield put(enqueueSuccessSnackbar(i18n.t('message:MANAGEMENT_PLAN.SUCCESS.COMPLETE')));
  } catch (e) {
    if (e.response.data === CANNOT_COMPLETE_ABANDONED_PLAN) {
      displayCannotCompleteModal();
    } else {
      yield put(enqueueErrorSnackbar(i18n.t('message:MANAGEMENT_PLAN.ERROR.COMPLETE')));
    }
  }
}

export const abandonManagementPlan = createAction(`abandonManagementPlanSaga`);

export function* abandonManagementPlanSaga({ payload }) {
  let navigate = useNavigate();
  const { displayCannotAbandonModal, ...managementPlan } = payload;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield call(
      axios.patch,
      `${managementPlanURL}/${managementPlan.management_plan_id}/abandon`,
      managementPlan,
      header,
    );
    yield put(updateManagementPlanSuccess(managementPlan));
    navigate(`/crop/${managementPlan.crop_variety_id}/management`);
    yield put(enqueueSuccessSnackbar(i18n.t('message:MANAGEMENT_PLAN.SUCCESS.ABANDON')));
    yield put(getTasks());
  } catch (e) {
    if (e.response.data === CANNOT_ABANDON_COMPLETED_PLAN) {
      displayCannotAbandonModal();
    } else {
      yield put(enqueueErrorSnackbar(i18n.t('message:MANAGEMENT_PLAN.ERROR.ABANDON')));
    }
  }
}

export default function* abandonAndCompleteManagementPlanSaga() {
  yield takeLeading(abandonManagementPlan.type, abandonManagementPlanSaga);
  yield takeLeading(completeManagementPlan.type, completeManagementPlanSaga);
}
