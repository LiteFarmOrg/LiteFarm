/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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
import { take, put, call, select, takeLatest } from 'redux-saga/effects';
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
import { notificationsUrl, alertsUrl } from '../../../apiConfig';
import { v4 as uuidv4 } from 'uuid';

let channel;
let subscribedFarmId;

function subscribeToChannel(sseUrl) {
  return eventChannel((emitter) => {
    const subscription = new EventSource(sseUrl);

    subscription.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      emitter(alert);
    };

    const unsubscribe = () => {
      subscription.close();
      channel = undefined;
    };

    return unsubscribe;
  });
}

function getNotifications(user_id, farm_id) {
  return axios.get(notificationsUrl, getHeader(user_id, farm_id));
}

function countAlerts(notifications) {
  return notifications.reduce((prev, notification) => prev + (notification.alert ? 1 : 0), 0);
}

export const getAlert = createAction('getAlertSaga');

export function* getAlertSaga() {
  let subscriberId = localStorage.getItem('subscriberId');
  if (!subscriberId) {
    subscriberId = uuidv4();
    localStorage.setItem('subscriberId', subscriberId);
  }

  let farm_id, user_id;
  try {
    while (true) {
      const userFarm = yield select(userFarmSelector);
      farm_id = userFarm.farm_id;
      user_id = userFarm.user_id;

      // Tell the store this saga is loading.
      yield put(onLoadingAlertStart(farm_id));

      // Set up subscription to server-sent events.
      if (!channel || farm_id !== subscribedFarmId) {
        if (channel) channel.close();
        subscribedFarmId = farm_id;
        channel = yield call(
          subscribeToChannel,
          `${alertsUrl}?user_id=${user_id}&farm_id=${farm_id}&subscriber_id=${subscriberId}`,
        );
      }

      // Call API to get notifications; count alerts and store result
      const notifications = yield call(getNotifications, user_id, farm_id);
      const count = countAlerts(notifications.data);
      yield put(setAlertCount({ farm_id, count }));

      try {
        while (true) {
          // For each server-sent event, update the alert count.
          const { count } = yield select(alertSelector);
          const message = yield take(channel);
          yield put(setAlertCount({ farm_id, count: Math.max(0, count + message.delta) }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    yield put(onLoadingAlertFail({ error, farm_id }));
    console.log(error);
  }
}

export default function* alertSaga() {
  yield takeLatest(getAlert.type, getAlertSaga);
}
