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

import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { sensorUrl } from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import i18n from '../../../../locales/i18n';
import history from '../../../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../../Snackbar/snackbarSlice';
import {
  onLoadingSensorFail,
  onSensorReadingTypesSuccess,
  onSensorBrandSuccess,
  deleteSensorSuccess,
  sensorsSelector,
} from '../../../sensorSlice';

export const patchSensor = createAction(`patchSensorSaga`);
export const getSensorReadingTypes = createAction('getSensorReadingTypesSaga');
export const getSensorBrand = createAction('getSensorBrandSaga');
export const retireSensor = createAction('retireSensorSaga');

export function* patchSensorSaga({ payload: sensorData }) {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.patch,
      sensorUrl + `/${sensorData.location_id}`,
      sensorData,
      header,
    );
    yield put(enqueueSuccessSnackbar(i18n.t('message:SENSOR.SUCCESSFUL_UPDATE')));
    history.push(`/map`);
  } catch (e) {
    console.log('Failed to update sensor to database');
    yield put(enqueueErrorSnackbar(i18n.t('message:SENSOR.ERROR_UPDATE')));
  }
}

export function* getSensorReadingTypesSaga({ payload: { location_id } }) {
  try {
    let { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const sensor_reading_types_response = yield call(
      axios.get,
      `${sensorUrl}/${location_id}/reading_type`,
      header,
    );
    const sensor_reading_types = sensor_reading_types_response.data;
    yield put(onSensorReadingTypesSuccess({ location_id, sensor_reading_types }));
  } catch (error) {
    yield put(onLoadingSensorFail());
  }
}

export function* getSensorBrandSaga({ payload: { location_id, partner_id } }) {
  try {
    let { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const brand_name_response = yield call(
      axios.get,
      `${sensorUrl}/partner/${partner_id}/brand_name`,
      header,
    );
    const brand_name = brand_name_response.data;
    yield put(onSensorBrandSuccess({ location_id, brand_name }));
  } catch (error) {
    console.log(error);
    yield put(onLoadingSensorFail());
  }
}

export function* retireSensorSaga({ payload: { sensorInfo } }) {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const { location_id } = sensorInfo;
  try {
    yield call(axios.post, `${sensorUrl}/unclaim`, { location_id }, header);
    yield put(deleteSensorSuccess(location_id));
    yield put(enqueueSuccessSnackbar(i18n.t('SENSOR.RETIRE.RETIRE_SUCCESS')));
  } catch (error) {
    yield put(enqueueErrorSnackbar(i18n.t('SENSOR.RETIRE.RETIRE_FAILURE')));
    console.log(error);
  }
  history.push({ pathname: '/map' });
}

export default function* sensorDetailSaga() {
  yield takeLeading(patchSensor.type, patchSensorSaga);
  yield takeLeading(getSensorReadingTypes.type, getSensorReadingTypesSaga);
  yield takeLeading(getSensorBrand.type, getSensorBrandSaga);
  yield takeLeading(retireSensor.type, retireSensorSaga);
}
