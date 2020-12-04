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
import moment from 'moment';

import {
  CREATE_FIELD_CROP,
  CREATE_PRICE,
  CREATE_YIELD,
  DELETE_FIELD,
  DELETE_FIELD_CROP,
  EDIT_FIELD_CROP,
  GET_PRICE,
  GET_YIELD,
} from './constants';
import { setFieldCropsInState } from '../actions';
import { setExpiredCropsInState, setPriceInState, setYieldInState } from './actions';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { getHeader } from '../saga';
import { createAction } from '@reduxjs/toolkit';
import { getFieldCropsSuccess, onLoadingFieldCropStart, onLoadingFieldCropFail } from '../fieldCropSlice';

const axios = require('axios');
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
    console.error('failed to fetch expired crops from database')
  }
}

export function* getYieldSaga() {
  const { yieldURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, yieldURL + '/farm/' + farm_id, header);
    if (result) {
      yield put(setYieldInState(result.data));
    }
  } catch (e) {
    console.log('failed to fetch yield from db');
  }
}

export function* getPriceSaga() {
  const { priceURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, priceURL + '/farm/' + farm_id, header);
    if (result) {
      yield put(setPriceInState(result.data));
    }
  } catch (e) {
    console.log('failed to fetch prices from db');
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

export function* createFieldCropSaga(action) {
  let currentDate = formatDate(new Date());
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const data = {
    crop_id: action.cropId,
    field_id: action.fieldId,
    start_date: action.startDate,
    end_date: action.endDate,
    area_used: action.areaUsed,
    estimated_production: action.estimatedProduction,
    variety: action.variety,
    estimated_revenue: action.estimatedRevenue,
    is_by_bed: action.is_by_bed,
    bed_config: action.bed_config,
  };
  try {
    const result = yield call(axios.post, fieldCropURL, data, header);
    if (result) {
      const result = yield call(axios.get, fieldCropURL + '/farm/date/' + farm_id + '/' + currentDate, header);
      if (result) {
        yield put(setFieldCropsInState(result.data));
      }
      const expiredResult = yield call(axios.get, fieldCropURL + '/expired/farm/' + farm_id, header);
      if (expiredResult) {
        yield put(setExpiredCropsInState(expiredResult.data));
      }
    }
  } catch (e) {
    console.log('failed to add fieldCrop to database');
  }
}

export function* editFieldCropSaga(action) {
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const data = {
    field_crop_id: action.fieldCropId,
    crop_id: action.cropId,
    field_id: action.fieldId,
    start_date: action.startDate,
    end_date: action.endDate,
    area_used: action.areaUsed,
    estimated_production: action.estimatedProduction,
    variety: action.variety,
    estimated_revenue: action.estimatedRevenue,
    is_by_bed: action.is_by_bed,
    bed_config: action.bed_config,
  };
  try {
    const result = yield call(axios.put, fieldCropURL + `/${action.fieldCropId}`, data, header);
    if (result) {
      let currentDate = moment().format('YYYY-MM-DD');
      const result = yield call(axios.get, fieldCropURL + '/farm/date/' + farm_id + '/' + currentDate, header);
      if (result) {
        yield put(setFieldCropsInState(result.data));
        toastr.success('Successfully Edited Crop');
      }
      const expiredResult = yield call(axios.get, fieldCropURL + '/expired/farm/' + farm_id, header);
      if (expiredResult) {
        yield put(setExpiredCropsInState(expiredResult.data));
      }
    }
  } catch (e) {
    console.log('Failed to add fieldCrop to database');
    toastr.error('Failed To Edit Field Crop');
  }
}

export function* deleteFieldCropSaga(action) {
  const currentDate = formatDate(new Date());
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, fieldCropURL + `/${action.fieldCropId}`, header);
    if (result) {
      const result = yield call(axios.get, fieldCropURL + '/farm/date/' + farm_id + '/' + currentDate, header);
      if (result) {
        yield put(setFieldCropsInState(result.data));
      }
      const expiredResult = yield call(axios.get, fieldCropURL + '/expired/farm/' + farm_id, header);
      if (expiredResult) {
        yield put(setExpiredCropsInState(expiredResult.data));
      }
      toastr.success('Successfully Deleted Crop');
    }
  } catch (e) {
    console.log('Failed To Delete Field Crop Error: ', e);
    toastr.error('Failed To Delete Field Crop');
  }

}

export function* createYieldSaga(action) {
  const { yieldURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const yieldData = action.yieldData;
  const data = {
    crop_id: parseInt(yieldData.crop_id, DEC),
    'quantity_kg/m2': parseInt(yieldData['quantity_kg/m2'], DEC),
    date: yieldData.date,
    farm_id: farm_id,
  };

  try {
    const result = yield call(axios.post, yieldURL, data, header);
    if (result) {
      const result = yield call(axios.get, yieldURL + '/farm/' + farm_id, header);
      if (result) {
        yield put(setYieldInState(result.data));
      }
    }
  } catch (e) {
    console.log('Error: Could Not Emit Create Yield Action');
  }
}

export function* createPriceSaga(action) {
  const { priceURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const price = action.priceData;
  const data = {
    crop_id: parseInt(price.crop_id, DEC),
    'value_$/kg': parseInt(price.value, DEC),
    date: price.date,
    farm_id: farm_id,
  };
  try {
    const result = yield call(axios.post, priceURL, data, header);
    if (result) {
      const result = yield call(axios.get, priceURL + '/farm/' + farm_id, header);
      if (result) {
        yield put(setPriceInState(result.data));
      }
    }
  } catch (e) {
    console.log('Error: Could not Emit Create Price Action')
  }
}

export function* deleteFieldSaga(action) {
  const { fieldURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, fieldURL + `/${action.fieldId}`, header);
    if (result) {
      toastr.success('Successfully Deleted Field');
      history.push('/field')
    }
  } catch (e) {
    console.log('Failed To Delete Field: ', e);
    toastr.error('Failed To Delete Field');
  }
}

const formatDate = (currDate) => {
  const d = currDate;
  let
    year = d.getFullYear(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

export default function* fieldSaga() {
  yield takeEvery(CREATE_FIELD_CROP, createFieldCropSaga);
  yield takeEvery(getExpiredFieldCrops.type, getExpiredFieldCropsSaga);
  yield takeEvery(DELETE_FIELD_CROP, deleteFieldCropSaga);
  yield takeEvery(GET_YIELD, getYieldSaga);
  yield takeEvery(CREATE_YIELD, createYieldSaga);
  yield takeEvery(GET_PRICE, getPriceSaga);
  yield takeEvery(CREATE_PRICE, createPriceSaga);
  yield takeEvery(EDIT_FIELD_CROP, editFieldCropSaga);
  yield takeEvery(DELETE_FIELD, deleteFieldSaga);
}
