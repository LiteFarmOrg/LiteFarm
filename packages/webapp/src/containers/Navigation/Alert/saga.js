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
import { take, put, call, select, takeEvery } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import { eventChannel, END } from 'redux-saga';
import { axios, getHeader } from '../../saga';
import { userFarmSelector } from '../../userFarmSlice';
import {
  setAlertCount,
  onLoadingAlertFail,
  onLoadingAlertStart,
  alertSelector,
} from './alertSlice';
import { url, alertsUrl } from '../../../apiConfig';

function subscribeToChannel(sseUrl) {
  return eventChannel((emitter) => {
    const subscription = new EventSource(sseUrl);

    subscription.onerror = () => {
      console.log(`server event stream error; readyState = ${subscription.readyState}`);
      emitter(END);
    };

    subscription.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      emitter(alert);
    };

    const unsubscribe = () => {
      console.log('cleaning up event stream');
      subscription.close();
    };

    return unsubscribe;
  });
}

export const getAlert = createAction('getAlertSaga');

export function* getAlertSaga() {
  const { farm_id, user_id } = yield select(userFarmSelector);
  try {
    // Tell the store this saga is loading.
    yield put(onLoadingAlertStart(farm_id));

    // Set up subscription to server-sent events.
    const channel = yield call(
      subscribeToChannel,
      `${alertsUrl}?user_id=${user_id}&farm_id=${farm_id}`,
    );

    // Call API to get current alert count; initialize it in the store.
    const notifications = yield call(
      axios.get,
      `${url}/notification_user`,
      getHeader(user_id, farm_id),
    );
    const count = notifications.data.reduce(
      (prev, notification) => prev + (notification.alert ? 1 : 0),
      0,
    );
    yield put(setAlertCount({ farm_id, count }));

    try {
      while (true) {
        // For each server-sent event, update the alert count.
        const { count } = yield select(alertSelector);
        const message = yield take(channel);
        yield put(setAlertCount({ farm_id, count: count + message.delta }));
      }
    } finally {
      console.log('channel closed');
    }
  } catch (error) {
    yield put(onLoadingAlertFail({ error, farm_id }));
    console.log(error);
  }
}

export default function* alertSaga() {
  yield takeEvery(getAlert.type, getAlertSaga);
}
