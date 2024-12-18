/*
 *  Copyright 2019-2022 LiteFarm.org
 *  This file is part of LiteFarm.
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
import { put, call, select, takeEvery } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import { axios, getHeader } from '../saga';
import { userFarmSelector } from '../userFarmSlice';
import {
  onLoadingNotificationStart,
  getNotificationSuccess /*, clearAlerts as clearAlertsReducer*/,
} from '../notificationSlice';
import { notificationsUrl, clearAlertsUrl } from '../../apiConfig';
import { useNavigate } from 'react-router-dom';

export const getNotification = createAction('getNotificationSaga');

export function* getNotificationSaga() {
  const { user_id, farm_id } = yield select(userFarmSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield put(onLoadingNotificationStart(user_id, farm_id));
    const result = yield call(axios.get, notificationsUrl, header);
    yield put(getNotificationSuccess(result.data));
  } catch (e) {
    console.error(e);
  }
}

export const readNotification = createAction('readNotificationSaga');

export function* readNotificationSaga({ payload }) {
  let navigate = useNavigate();
  const { user_id, farm_id } = yield select(userFarmSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield call(
      axios.patch,
      notificationsUrl,
      { notification_ids: [payload], status: 'Read' },
      header,
    );
    navigate(`/notifications/${payload}/read_only`);
  } catch (e) {
    console.error(e);
  }
}

export const clearAlerts = createAction('clearAlertsSaga');

export function* clearAlertsSaga({ payload }) {
  const { user_id, farm_id } = yield select(userFarmSelector);
  const header = getHeader(user_id, farm_id);
  try {
    // TODO figure out why this patch is sometimes performed more than once for single action dispatch.
    yield call(axios.patch, clearAlertsUrl, { notification_ids: payload }, header);
  } catch (e) {
    console.error(e);
  }
}

export default function* notificationSaga() {
  yield takeEvery(getNotification.type, getNotificationSaga);
  yield takeEvery(readNotification.type, readNotificationSaga);
  yield takeEvery(clearAlerts.type, clearAlertsSaga);
}
