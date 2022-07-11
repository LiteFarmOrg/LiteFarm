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
import { axios, getHeader } from '../../../saga';
import { createAction } from '@reduxjs/toolkit';
import i18n from '../../../../locales/i18n';
import history from '../../../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../../Snackbar/snackbarSlice';
import {
  onLoadingSensorFail,
  onSensorReadingTypesSuccess,
  onSensorBrandSuccess,
} from '../../../sensorSlice';

export const patchSensor = createAction(`patchSensorSaga`);
export const getSensorReadingTypes = createAction('getSensorReadingTypesSaga');
export const getSensorBrand = createAction('getSensorBrandSaga');

export function* patchSensorSaga({ payload: sensorData }) {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.patch,
      sensorUrl + `/${sensorData.sensor_id}`,
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

export function* getSensorReadingTypesSaga({ payload: { location_id, sensor_id } }) {
  try {
    let { user_id, farm_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const sensor_reading_types_response = yield call(
      axios.get,
      `${sensorUrl}/reading_type/${sensor_id}`,
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
      `${sensorUrl}/brand_name/${partner_id}`,
      header,
    );
    const brand_name = brand_name_response.data;
    yield put(onSensorBrandSuccess({ location_id, brand_name }));
  } catch (error) {
    yield put(onLoadingSensorFail());
  }
}

export default function* sensorDetailSaga() {
  yield takeLeading(patchSensor.type, patchSensorSaga);
  yield takeLeading(getSensorReadingTypes.type, getSensorReadingTypesSaga);
  yield takeLeading(getSensorBrand.type, getSensorBrandSaga);
}
