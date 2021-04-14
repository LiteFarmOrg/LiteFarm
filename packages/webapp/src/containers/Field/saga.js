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

import { toastr } from 'react-redux-toastr';
import history from '../../history';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import { createAction } from '@reduxjs/toolkit';
import {
  deleteFieldCropSuccess,
  getFieldCropsSuccess,
  onLoadingFieldCropFail,
  onLoadingFieldCropStart,
  postFieldCropSuccess,
  putFieldCropSuccess,
} from '../fieldCropSlice';
import { deleteFieldSuccess } from '../fieldSlice';
import i18n from '../../locales/i18n';

const DEC = 10;

export const getExpiredFieldCrops = createAction(`getExpiredFieldCropsSaga`);

export function* getExpiredFieldCropsSaga() {
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingFieldCropStart());
    const result = yield call(axios.get, fieldCropURL + '/expired/farm/' + farm_id, header);
    yield put(getFieldCropsSuccess(result.data));
  } catch (e) {
    yield put(onLoadingFieldCropFail());
    console.error('failed to fetch expired crops from database');
  }
}

export const postField = createAction(`postFieldSaga`);

export function* postFieldSaga(action) {
  const { fieldURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const fieldData = {
    farm_id: farm_id,
    field_name: action.fieldName,
    grid_points: action.gridPoints,
    area: action.area,
  };
  try {
    yield call(axios.post, fieldURL, fieldData, header);
    history.push('/field');
  } catch (e) {
    console.log('failed to add field to database');
  }
}
export const postFieldCrop = createAction(`postFieldCropSaga`);

export function* postFieldCropSaga({ payload: fieldCrop }) {
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.post, fieldCropURL, fieldCrop, header);
    console.log(result);
    yield put(postFieldCropSuccess(result.data));
  } catch (e) {
    console.log('failed to add fieldCrop to database');
  }
}

export const putFieldCrop = createAction(`putFieldCropSaga`);

export function* putFieldCropSaga({ payload: fieldCrop }) {
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.put,
      fieldCropURL + `/${fieldCrop.field_crop_id}`,
      fieldCrop,
      header,
    );

    yield put(putFieldCropSuccess(fieldCrop));
    toastr.success(i18n.t('message:CROP.SUCCESS.EDIT'));
  } catch (e) {
    console.log('Failed to add fieldCrop to database');
    toastr.error(i18n.t('message:CROP.ERROR.EDIT'));
  }
}

export const deleteFieldCrop = createAction(`deleteFieldCropSaga`);

export function* deleteFieldCropSaga({ payload: field_crop_id }) {
  const currentDate = formatDate(new Date());
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, fieldCropURL + `/${field_crop_id}`, header);
    yield put(deleteFieldCropSuccess(field_crop_id));
    toastr.success(i18n.t('message:CROP.SUCCESS.DELETE'));
  } catch (e) {
    console.log('Failed To Delete Field Crop Error: ', e);
    toastr.error(i18n.t('message:CROP.ERROR.DELETE'));
  }
}

export const createYield = createAction(`createYieldSaga`);

export function* createYieldSaga({ payload: yieldData }) {
  const { yieldURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const data = {
    crop_id: parseInt(yieldData.crop_id, DEC),
    'quantity_kg/m2': parseInt(yieldData['quantity_kg/m2'], DEC),
    date: yieldData.date,
    farm_id: farm_id,
  };

  try {
    const result = yield call(axios.post, yieldURL, data, header);
  } catch (e) {
    console.log('Error: Could Not Emit Create Yield Action');
  }
}

export const createPrice = createAction(`createPriceSaga`);

export function* createPriceSaga({ payload: price }) {
  const { priceURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const data = {
    crop_id: parseInt(price.crop_id, DEC),
    'value_$/kg': parseInt(price.value, DEC),
    date: price.date,
    farm_id: farm_id,
  };
  try {
    const result = yield call(axios.post, priceURL, data, header);
  } catch (e) {
    console.log('Error: Could not Emit Create Price Action');
  }
}
export const deleteField = createAction(`deleteFieldSaga`);

export function* deleteFieldSaga({ payload: field_id }) {
  const { fieldURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, fieldURL + `/${field_id}`, header);
    history.push('/field');
    yield put(deleteFieldSuccess(field_id));
    toastr.success(i18n.t('message:FIELD.SUCCESS.DELETE'));
  } catch (e) {
    console.log('Failed To Delete Field: ', e);
    toastr.error(i18n.t('message:FIELD.ERROR.DELETE'));
  }
}

const formatDate = (currDate) => {
  const d = currDate;
  let year = d.getFullYear(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

export default function* fieldSaga() {
  yield takeLatest(postFieldCrop.type, postFieldCropSaga);
  yield takeLatest(getExpiredFieldCrops.type, getExpiredFieldCropsSaga);
  yield takeLatest(deleteFieldCrop.type, deleteFieldCropSaga);
  yield takeLatest(createYield.type, createYieldSaga);
  yield takeLatest(createPrice.type, createPriceSaga);
  yield takeLatest(putFieldCrop.type, putFieldCropSaga);
  yield takeLatest(deleteField.type, deleteFieldSaga);
}
