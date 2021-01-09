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

import {
  GET_FARM_INFO,
  // UPDATE_AGREEMENT,
  UPDATE_FARM,
} from './constants';
import { updateConsentOfFarm } from './ChooseFarm/actions.js';
import { call, put, select, takeLatest, takeLeading, takeEvery } from 'redux-saga/effects';
import apiConfig, { userFarmUrl, url } from '../apiConfig';
import { toastr } from 'react-redux-toastr';
import history from '../history';
import { loginSelector, loginSuccess } from './userFarmSlice';
import { userFarmSelector, putUserSuccess, patchFarmSuccess } from './userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { lastActiveDatetimeSelector, logUserInfoSuccess } from './userLogSlice';
import { getFieldsSuccess, onLoadingFieldStart, onLoadingFieldFail } from './fieldSlice';
import { getCropsSuccess, onLoadingCropFail, onLoadingCropStart } from './cropSlice';
import {
  getFieldCropsSuccess,
  onLoadingFieldCropFail,
  onLoadingFieldCropStart,
} from './fieldCropSlice';

const logUserInfoUrl = () => `${url}/userLog`;

const axios = require('axios');

export function getHeader(user_id, farm_id) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('id_token'),
      user_id,
      farm_id,
    },
  };
}

export const updateUser = createAction('updateUserSaga');

export function* updateUserSaga({ payload: user }) {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const { userUrl } = apiConfig;
  let data = user;
  if (data.wage === null) {
    delete data.wage;
  }
  if (data.phone_number === null) {
    delete data.phone_number;
  }
  try {
    const result = yield call(axios.put, userUrl + '/' + user_id, data, header);
    yield put(putUserSuccess(user));
    toastr.success(this.props.t('message:USER.SUCCESS.UPDATE'));
  } catch (e) {
    toastr.error(this.props.t('message:USER.ERROR.UPDATE'));
  }
}

export const getCrops = createAction(`getCropsSaga`);

export function* getCropsSaga() {
  const { cropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingCropStart());
    const result = yield call(axios.get, cropURL + '/farm/' + farm_id, header);
    yield put(getCropsSuccess(result.data));
  } catch (e) {
    yield put(onLoadingCropFail());
    console.error('failed to fetch all crops from database');
  }
}
export const getFarmInfo = createAction(`getFarmInfoSaga`);

export function* getFarmInfoSaga() {
  try {
    let userFarm = yield select(userFarmSelector);

    //TODO potential bug
    if (!userFarm.farm_id) {
      history.push('/add_farm');
      return;
    }
    localStorage.setItem('role_id', userFarm.role_id);
    yield put(getFields());
    yield put(getFieldCrops());
  } catch (e) {
    console.log(e);
    toastr.error(this.props.t('message:FARM.ERROR.FETCH'));
  }
}
export const putFarm = createAction(`putFarmSaga`);

export function* putFarmSaga({ payload: farm }) {
  const { farmUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  // OC: We should never update address information of a farm.
  let { address, grid_points, ...data } = farm;
  if (data.farm_phone_number === null) {
    delete data.farm_phone_number;
  }
  try {
    const result = yield call(axios.put, farmUrl + '/' + farm_id, data, header);
    yield put(patchFarmSuccess(data));
    toastr.success(this.props.t('message:FARM.SUCCESS.UPDATE'));
  } catch (e) {
    toastr.error(this.props.t('message:FARM.ERROR.UPDATE'));
  }
}

export const getFields = createAction('getFieldsSaga');

export function* getFieldsSaga() {
  const { fieldURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield put(onLoadingFieldStart());
    const result = yield call(axios.get, fieldURL + '/farm/' + farm_id, header);
    yield put(getFieldsSuccess(result.data));
  } catch (e) {
    yield put(onLoadingFieldFail());
    console.log('failed to fetch fields from database');
  }
}

export const getFieldCrops = createAction('getFieldCropsSaga');

export function* getFieldCropsSaga() {
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingFieldCropStart());
    const result = yield call(axios.get, fieldCropURL + '/farm/' + farm_id, header);
    yield put(getFieldCropsSuccess(result.data));
  } catch (e) {
    yield put(onLoadingFieldCropFail());
    console.log('failed to fetch field crops from db');
  }
}

export const getFieldCropsByDate = createAction('getFieldCropsByDateSaga');

export function* getFieldCropsByDateSaga() {
  let currentDate = formatDate(new Date());
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingFieldCropStart());
    const result = yield call(
      axios.get,
      fieldCropURL + '/farm/date/' + farm_id + '/' + currentDate,
      header,
    );
    yield put(getFieldCropsSuccess(result.data));
  } catch (e) {
    yield put(onLoadingFieldCropFail());
    console.log('failed to fetch field crops by date');
  }
}

export function* logUserInfoSaga() {
  let { user_id, farm_id } = yield select(loginSelector);
  if (!user_id) return;
  const header = getHeader(user_id, farm_id);
  try {
    const hour = 1000 * 3600;
    const lastActiveDatetimeAsNumber = yield select(lastActiveDatetimeSelector);
    const currentDateAsNumber = new Date().getTime();
    const screenSize = {
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
    };
    if (!lastActiveDatetimeAsNumber || currentDateAsNumber - lastActiveDatetimeAsNumber > hour) {
      yield put(logUserInfoSuccess());
      yield call(axios.post, logUserInfoUrl(), screenSize, header);
    }
  } catch (e) {
    console.log('failed to fetch field crops by date');
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

// export function* updateAgreementSaga(payload) {
//   const userFarm = yield select(userFarmSelector);
//   const {user_id, farm_id, step_three} = userFarm;
//   const { callback } = payload;
//   const patchStepUrl = (farm_id, user_id) => `${userFarmUrl}/onboarding/farm/${farm_id}/user/${user_id}`;
//
//   const { userFarmUrl } = apiConfig;
//   const header = {
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
//       user_id,
//       farm_id,
//     },
//   };
//
//   let data = {
//     has_consent: payload.consent_bool.consent,
//     consent_version: payload.consent_version,
//   };
//
//   try {
//     //TODO replace changed async calls with axios.all
//     const result = yield call(axios.patch, userFarmUrl + '/consent/farm/' + farm_id + '/user/' + user_id, data, header);
//     if (result) {
//       if (payload.consent_bool.consent) {
//         // TODO potential bug
//         // yield put(updateConsentOfFarm(farm_id, data));
//         // yield put(setFarmInState(data));
//         // const farms = yield select((state) => state.userFarmReducer.farms);
//         // const selectedFarm = farms.find((f) => f.farm_id === farm_id);
//         let step = {};
//         if (!step_three) {
//           step = {
//             step_three: true,
//             step_three_end: new Date(),
//           };
//           yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
//         }
//         yield put(setFarmInState({ ...userFarm, ...step, ...data }));
//         callback && callback();
//       } else {
//         //did not give consent - log user out
//         const auth = new Auth();
//         auth.logout();
//         history.push('/callback');
//       }
//     }
//   } catch (e) {
//     toastr.error('Failed to update user agreement');
//   }
// }

export default function* getFarmIdSaga() {
  yield takeLeading('*', logUserInfoSaga);
  yield takeLatest(updateUser.type, updateUserSaga);
  yield takeLatest(getFarmInfo.type, getFarmInfoSaga);
  yield takeLatest(putFarm.type, putFarmSaga);
  yield takeLatest(getFields.type, getFieldsSaga);
  yield takeLatest(getFieldCropsByDate.type, getFieldCropsSaga);
  yield takeLatest(getFieldCrops.type, getFieldCropsSaga);
  yield takeLatest(getCrops.type, getCropsSaga);
  // yield takeLatest(UPDATE_AGREEMENT, updateAgreementSaga);
}
