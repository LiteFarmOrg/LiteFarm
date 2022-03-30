/*
 *  Copyright 2019-2022 LiteFarm.org
 *  This file  is part of LiteFarm.
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
import { onLoadingNotificationStart, getNotificationSuccess } from '../notificationSlice';
import { notificationsUrl } from '../../apiConfig';

export const getNotification = createAction('getNotificationSaga');

export function* getNotificationSaga() {
  const { user_id, farm_id } = yield select(userFarmSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield put(onLoadingNotificationStart(user_id, farm_id));
    const result = yield call(axios.get, notificationsUrl, header);
    yield put(getNotificationSuccess(result.data));
  } catch (e) {
    console.log(e);
  }
}

export default function* notificationSaga() {
  yield takeEvery(getNotification.type, getNotificationSaga);
}
