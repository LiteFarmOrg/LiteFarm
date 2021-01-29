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

import apiConfig from '../../apiConfig';
import { put, takeEvery, call, select } from 'redux-saga/effects';
import {
  setCropsSoldNutritionInState,
  setSoilOMData,
  setLabourHappinessData,
  setBiodiversityData,
  setPricesData,
  setWaterBalanceData,
  setNitrogenBalanceData,
  setFrequencyNitrogenBalance,
  setWaterBalanceSchedule,
} from './actions';
import {
  GET_CROPS_SOLD_NUTRITION,
  GET_SOLD_OM_DATA,
  GET_LABOUR_HAPPINESS_DATA,
  GET_BIODIVERSITY_DATA,
  GET_PRICES_DATA,
  GET_WATER_BALANCE_DATA,
  GET_NITROGEN_BALANCE_DATA,
  CREATE_FREQUENCY_NITROGEN_BALANCE,
  GET_FREQUENCY_NITROGEN_BALANCE,
  DEL_FREQUENCY_NITROGEN_BALANCE,
  GET_PRICES_WITH_DISTANCE_DATA,
  GET_FREQUENCY_WATER_BALANCE,
  CREATE_FREQUENCY_WATER_BALANCE,
} from './constants';
import { loginSelector } from '../userFarmSlice';
import { getHeader, axios } from '../saga';

export function* getCropsSoldNutrition() {
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, insightUrl + '/people_fed/' + farm_id, header);
    if (result) {
      yield put(setCropsSoldNutritionInState(result.data));
    }
  } catch (e) {
    console.log('failed to fetch fields from db');
  }
}

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
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, insightUrl + '/biodiversity/' + farm_id, header);
    if (result) {
      yield put(setBiodiversityData(result.data));
    }
  } catch (e) {
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

export function* getWaterBalanceData() {
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, insightUrl + '/waterbalance/' + farm_id, header);
    if (result) {
      yield put(setWaterBalanceData(result.data));
    }
  } catch (e) {
    console.log('failed to fetch water balance data from db');
  }
}

export function* getWaterBalanceSchedule() {
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, insightUrl + '/waterbalance/schedule/' + farm_id, header);
    if (result) {
      yield put(setWaterBalanceSchedule(result.data));
    }
  } catch (e) {
    console.log('failed to fetch schedule water balance from db');
  }
}

export function* createWaterBalanceSchedule() {
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const data = {
    farm_id: farm_id,
  };
  try {
    const result = yield call(axios.post, insightUrl + '/waterbalance/schedule', data, header);
    if (result) {
      const result = yield call(
        axios.get,
        insightUrl + '/waterbalance/schedule/' + farm_id,
        header,
      );
      if (result) {
        yield put(setWaterBalanceSchedule(result.data));
      }
    }
  } catch (error) {
    console.log(error + ' Could not emit waterBalanceSchedule action');
  }
}

export function* getNitrogenBalanceData() {
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, insightUrl + '/nitrogenbalance/' + farm_id, header);
    if (result) {
      yield put(setNitrogenBalanceData(result.data));
    }
  } catch (e) {
    console.log('failed to fetch nitrogen data from db');
  }
}

export function* getNitrogenBalanceFrequency() {
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.get,
      insightUrl + '/nitrogenbalance/schedule/' + farm_id,
      header,
    );
    if (result) {
      yield put(setFrequencyNitrogenBalance(result.data));
    }
  } catch (e) {
    console.log('failed to fetch schedule nitrogen balance from db');
  }
}

export function* postNitrogenBalanceFrequency(action) {
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  const data = {
    farm_id: farm_id,
    created_at: action.nitrogenFrequency.created_at,
    scheduled_at: action.nitrogenFrequency.scheduled_at,
    frequency: action.nitrogenFrequency.frequency,
  };
  try {
    const result = yield call(axios.post, insightUrl + '/nitrogenbalance/schedule', data, header);
    if (result) {
      const result = yield call(
        axios.get,
        insightUrl + '/nitrogenbalance/schedule/' + farm_id,
        header,
      );
      if (result) {
        yield put(setFrequencyNitrogenBalance(result.data));
      }
    }
  } catch (error) {
    console.log(error + ' Could not emit postNitrogenFrequency action');
  }
}

export function* deleteNitrogenBalanceFrequency(action) {
  let frequencyID = action.nitrogenBalanceID;
  const { insightUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.delete,
      insightUrl + '/nitrogenbalance/schedule/' + frequencyID,
      header,
    );
    if (result) {
      console.log('Eyy, its deleted ' + result);
    }
  } catch (error) {
    console.log(error + ' could not emit deleteNitrogenFrequencyAction');
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
  yield takeEvery(GET_CROPS_SOLD_NUTRITION, getCropsSoldNutrition);
  yield takeEvery(GET_SOLD_OM_DATA, getSoldOMData);
  yield takeEvery(GET_LABOUR_HAPPINESS_DATA, getLabourHappinessData);
  yield takeEvery(GET_BIODIVERSITY_DATA, getBiodiversityData);
  yield takeEvery(GET_PRICES_DATA, getPricesData);
  yield takeEvery(GET_PRICES_WITH_DISTANCE_DATA, getPricesWithDistanceData);
  yield takeEvery(GET_WATER_BALANCE_DATA, getWaterBalanceData);
  yield takeEvery(GET_FREQUENCY_WATER_BALANCE, getWaterBalanceSchedule);
  yield takeEvery(GET_NITROGEN_BALANCE_DATA, getNitrogenBalanceData);
  yield takeEvery(CREATE_FREQUENCY_WATER_BALANCE, createWaterBalanceSchedule);
  yield takeEvery(GET_FREQUENCY_NITROGEN_BALANCE, getNitrogenBalanceFrequency);
  yield takeEvery(CREATE_FREQUENCY_NITROGEN_BALANCE, postNitrogenBalanceFrequency);
  yield takeEvery(DEL_FREQUENCY_NITROGEN_BALANCE, deleteNitrogenBalanceFrequency);
}
