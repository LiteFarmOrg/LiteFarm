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

import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { loginSelector, patchFarmSuccess } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import { createAction } from '@reduxjs/toolkit';
import i18n from '../../locales/i18n';
import history from '../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';

export const patchSensor = createAction(`patchSensorSaga`);

export function* patchSensorSaga({ payload: sensorData }) {
  const { sensorUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.patch,
      sensorUrl + `/${sensorData.sensor_id}`,
      sensorData,
      header,
    );
    // yield call(getManagementPlanAndPlantingMethodSuccessSaga, { payload: [sensorData] });
    yield put(enqueueSuccessSnackbar(i18n.t('Succesfully updated sensor')));
    history.push(`/map`);
  } catch (e) {
    console.log('Failed to update sensor details to database');
    yield put(enqueueErrorSnackbar(i18n.t('message:PLAN.ERROR.EDIT')));
  }
}

export default function* managementPlanSaga() {
  yield takeLeading(patchSensor.type, patchSensorSaga);
}
