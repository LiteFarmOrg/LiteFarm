/*
 *  Copyright 2025 LiteFarm.org
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

import { createAction } from '@reduxjs/toolkit';
import i18n from '../../../../locales/i18n';
import { call, put, select, takeLeading } from 'redux-saga/effects';
import { axios, getHeader } from '../../../saga';
import apiConfig from '../../../../apiConfig';
import { loginSelector } from '../../../userFarmSlice';
import {
  deleteSoilSampleLocationSuccess,
  editSoilSampleLocationSuccess,
  getLocationObjectFromSoilSampleLocation,
  postSoilSampleLocationSuccess,
} from '../../../soilSampleLocationSlice';
import history from '../../../../history';
import { canShowSuccessHeader, setSuccessMessage } from '../../../mapSlice';
import { setMapCache } from '../../../Map/mapCacheSlice';

export const postSoilSampleLocationLocation = createAction(`postSoilSampleLocationLocationSaga`);

export function* postSoilSampleLocationLocationSaga({ payload: data }) {
  const formData = data.formData;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromSoilSampleLocation(formData);

  try {
    const result = yield call(
      axios.post,
      `${locationURL}/${locationObject.figure.type}`,
      locationObject,
      header,
    );
    yield put(setMapCache({ maxZoom: undefined, farm_id }));
    yield put(postSoilSampleLocationSuccess(result.data));

    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.SOIL_SAMPLE_LOCATION'),
        i18n.t('message:MAP.SUCCESS_POST'),
      ]),
    );
    yield put(canShowSuccessHeader(true));
    history.push('/map');
  } catch (e) {
    history.push(
      {
        pathname: history.location.pathname,
      },
      {
        error: `${i18n.t('message:MAP.FAIL_POST')} ${i18n
          .t('FARM_MAP.MAP_FILTER.SOIL_SAMPLE_LOCATION')
          .toLowerCase()}`,
      },
    );
    console.log(e);
  }
}

export const editSoilSampleLocationLocation = createAction(`editSoilSampleLocationLocationSaga`);

export function* editSoilSampleLocationLocationSaga({ payload: data }) {
  const { formData, location_id, figure_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  formData.farm_id = farm_id;
  const header = getHeader(user_id, farm_id);
  const locationObject = getLocationObjectFromSoilSampleLocation({
    ...formData,
    location_id,
    figure_id,
  });

  try {
    const result = yield call(
      axios.put,
      `${locationURL}/${locationObject.figure.type}/${location_id}`,
      locationObject,
      header,
    );
    yield put(editSoilSampleLocationSuccess(result.data));

    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.SOIL_SAMPLE_LOCATION'),
        i18n.t('message:MAP.SUCCESS_PATCH'),
      ]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push(
      {
        pathname: history.location.pathname,
      },
      {
        error: `${i18n.t('message:MAP.FAIL_PATCH')} ${i18n
          .t('FARM_MAP.MAP_FILTER.SOIL_SAMPLE_LOCATION')
          .toLowerCase()}`,
      },
    );
    console.log(e);
  }
}

export const deleteSoilSampleLocationLocation = createAction(
  `deleteSoilSampleLocationLocationSaga`,
);

export function* deleteSoilSampleLocationLocationSaga({ payload: data }) {
  const { location_id } = data;
  const { locationURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield call(axios.delete, `${locationURL}/${location_id}`, header);
    yield put(setMapCache({ maxZoom: undefined, farm_id }));
    yield put(deleteSoilSampleLocationSuccess(location_id));
    yield put(
      setSuccessMessage([
        i18n.t('FARM_MAP.MAP_FILTER.SOIL_SAMPLE_LOCATION'),
        i18n.t('message:MAP.SUCCESS_DELETE'),
      ]),
    );
    yield put(canShowSuccessHeader(true));
    history.push({ pathname: '/map' });
  } catch (e) {
    history.push(
      {
        pathname: history.location.pathname,
      },
      {
        error: {
          retire: true,
        },
      },
    );
    console.log(e);
  }
}

export default function* soilSampleLocationLocationSaga() {
  yield takeLeading(postSoilSampleLocationLocation.type, postSoilSampleLocationLocationSaga);
  yield takeLeading(editSoilSampleLocationLocation.type, editSoilSampleLocationLocationSaga);
  yield takeLeading(deleteSoilSampleLocationLocation.type, deleteSoilSampleLocationLocationSaga);
}
