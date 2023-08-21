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

import apiConfig from '../../apiConfig';
import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import {
  setBiodiversityData,
  setBiodiversityError,
  setBiodiversityLoading,
  setLabourHappinessData,
  setPricesData,
  setSoilOMData,
} from './actions';
import {
  GET_BIODIVERSITY_DATA,
  GET_LABOUR_HAPPINESS_DATA,
  GET_PRICES_DATA,
  GET_PRICES_WITH_DISTANCE_DATA,
  GET_SOLD_OM_DATA,
} from './constants';
import { loginSelector } from '../userFarmSlice';
import { axios, getHeader } from '../saga';
import { biodiversitySelector } from './selectors';

export function* getSoldOMData() {
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, insightUrl + '/soil_om/' + farm_id, header);

    if (result) {
      yield put(setSoilOMData(result.data));
    }
  } catch (e) {
    console.log('failed to fetch soil om data from db');
  }
}

export function* getLabourHappinessData() {
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, insightUrl + '/labour_happiness/' + farm_id, header);
    if (result) {
      yield put(setLabourHappinessData(result.data));
    }
  } catch (e) {
    console.log('failed to fetch labour happiness data from db');
  }
}

export function* getBiodiversityData() {
  console.log('Getting biodiversity data');
  yield put(setBiodiversityLoading(true));
  yield put(setBiodiversityError(false));
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const defaultHeader = getHeader(user_id, farm_id);
  const header = {
    ...defaultHeader,
    headers: { Connection: 'Keep-Alive', 'Keep-Alive': 'timeout=60', ...defaultHeader.headers },
  };

  try {
    const result = yield call(axios.get, insightUrl + '/biodiversity/' + farm_id, header);
    if (result) {
      console.log(result);
      yield put(setBiodiversityLoading(false));
      yield put(setBiodiversityData(result.data));
    }
  } catch (e) {
    console.log(e);
    yield put(setBiodiversityLoading(false));
    yield put(setBiodiversityError(true, Date.now()));
    console.log('failed to fetch biodiversity data from db');
  }
}

export function* getPricesData() {
  let currentDate = formatDate(new Date());
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, insightUrl + '/prices/' + farm_id, header);
    if (result) {
      yield put(setPricesData(result.data));
    }
  } catch (e) {
    console.log('failed to fetch prices data from db');
  }
}

export function* getPricesWithDistanceData(data) {
  let date = new Date();
  date = new Date(date.setMonth(date.getMonth() - 6));
  let currentDate = formatDate(date);
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  header.params = {
    startdate: currentDate,
    lat: data['location']['lat'],
    long: data['location']['lng'],
    distance: data['distance'],
  };

  try {
    const result = yield call(axios.get, insightUrl + '/prices/distance/' + farm_id, header);
    if (result) {
      yield put(setPricesData(result.data));
    }
  } catch (e) {
    console.log('failed to fetch prices data from db');
  }
}

const formatDate = (date) => {
  let dd = date.getDate();
  let mm = date.getMonth() + 1;
  let yyyy = date.getFullYear() - 1; // grabbing data for past year

  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }

  return yyyy + '-' + mm + '-' + dd;
};

export default function* insightSaga() {
  yield takeLatest(GET_SOLD_OM_DATA, getSoldOMData);
  yield takeLatest(GET_LABOUR_HAPPINESS_DATA, getLabourHappinessData);
  yield takeLatest(GET_BIODIVERSITY_DATA, getBiodiversityData);
  yield takeLatest(GET_PRICES_DATA, getPricesData);
  yield takeLatest(GET_PRICES_WITH_DISTANCE_DATA, getPricesWithDistanceData);
}
