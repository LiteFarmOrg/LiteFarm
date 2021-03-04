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

import { all, call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import apiConfig, { rolesUrl, url, userFarmUrl } from '../apiConfig';
import { toastr } from 'react-redux-toastr';
import history from '../history';
import {
  getUserFarmsSuccess,
  loginSelector,
  patchFarmSuccess,
  putUserSuccess,
  selectFarmSuccess,
  userFarmsByFarmSelector,
  userFarmSelector,
} from './userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { logUserInfoSuccess, userLogReducerSelector } from './userLogSlice';
import {
  addOneField,
  onLoadingFieldFail,
  onLoadingFieldStart,
  onLoadingFieldSuccess,
} from './fieldSlice';
import {
  cropStatusSelector,
  getAllCropsSuccess,
  getCropsSuccess,
  onLoadingCropFail,
  onLoadingCropStart,
} from './cropSlice';
import {
  getFieldCropsSuccess,
  onLoadingFieldCropFail,
  onLoadingFieldCropStart,
} from './fieldCropSlice';
import i18n from '../locales/i18n';
import { getLogs } from './Log/actions';
import { getAllShifts } from './Shift/actions';
import { getExpense, getSales } from './Finances/actions';
import { getRolesSuccess, rolesStatusSelector } from './Profile/People/slice';
import { logout } from '../util/jwt';

const logUserInfoUrl = () => `${url}/userLog`;
const getCropsByFarmIdUrl = (farm_id) => `${url}/crop/farm/${farm_id}`;
const getLocationsUrl = (farm_id) => `${url}/location/farm/${farm_id}`;

export const axios = require('axios');
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error?.response?.status === 401) {
      if (localStorage.getItem('id_token')) {
        logout();
      }
    }
    return Promise.reject(error);
  },
);

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
    yield put(putUserSuccess({ ...user, farm_id }));
    i18n.changeLanguage(user.language_preference);
    localStorage.setItem('litefarm_lang', user.language_preference);
    toastr.success(i18n.t('message:USER.SUCCESS.UPDATE'));
  } catch (e) {
    toastr.error(i18n.t('message:USER.ERROR.UPDATE'));
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
    yield put(getAllCropsSuccess(result.data));
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
    yield put(getLocations());
    yield put(getFieldCrops());
  } catch (e) {
    console.log(e);
    toastr.error(i18n.t('message:FARM.ERROR.FETCH'));
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
    toastr.success(i18n.t('message:FARM.SUCCESS.UPDATE'));
  } catch (e) {
    toastr.error(i18n.t('message:FARM.ERROR.UPDATE'));
  }
}

export const onLoadingLocationStart = createAction('onLoadingLocationStartSaga');

export function* onLoadingLocationStartSaga() {
  yield put(onLoadingFieldStart());
  // yield put(onLoadingBarnStart());
  // yield put(onLoadingBarnStart());
  // yield put(onLoadingBarnStart());
}

export const onLoadingLocationFail = createAction('onLoadingLocationFailSaga');

export function* onLoadingLocationFailSaga() {
  yield put(onLoadingFieldFail());
  // yield put(onLoadingBarnFail());
  // yield put(onLoadingBarnFail());
  // yield put(onLoadingBarnFail());
}

export const onLoadingLocationSuccess = createAction('onLoadingLocationSuccessSaga');

export function* onLoadingLocationSuccessSaga() {
  yield put(onLoadingFieldSuccess());
  // yield put(onLoadingBarnSuccess());
  // yield put(onLoadingBarnSuccess());
  // yield put(onLoadingBarnSuccess());
}

export const getLocations = createAction('getLocationsSaga');

export function* getLocationsSaga() {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield put(onLoadingFieldStart());
    const result = yield call(axios.get, getLocationsUrl(farm_id), header);
    yield put(getLocationsSuccess(result.data));
  } catch (e) {
    yield put(onLoadingLocationFail());
    console.log('failed to fetch fields from database');
  }
}

export const getLocationsSuccess = createAction('getLocationsSuccessSaga');

export function* getLocationsSuccessSaga({ payload: locations }) {
  for (const location of locations) {
    if (figureTypeActionMap.hasOwnProperty(location.figure.type)) {
      yield put(figureTypeActionMap[location.figure.type](location));
    }
  }
  yield put(onLoadingLocationSuccess());
}

const figureTypeActionMap = {
  field: addOneField,
};

export const getFieldCrops = createAction('getFieldCropsSaga');

export function* getFieldCropsSaga() {
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingFieldCropStart());
    const result = yield call(axios.get, fieldCropURL + '/farm/' + farm_id, header);
    yield put(getFieldCropsSuccess(result.data));
    yield put(getCropsSuccess(result.data.map((fieldCrop) => fieldCrop.crop)));
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
    const { lastActiveDatetime, farm_id: prev_farm_id } = yield select(userLogReducerSelector);
    const currentDateAsNumber = new Date().getTime();
    const data = {
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      farm_id,
    };
    if (!lastActiveDatetime || currentDateAsNumber - lastActiveDatetime > hour) {
      yield put(logUserInfoSuccess(farm_id));
      yield call(axios.post, logUserInfoUrl(), data, header);
    } else if (prev_farm_id !== farm_id) {
      yield put(logUserInfoSuccess(farm_id));
      yield call(axios.post, logUserInfoUrl(), data, header);
    }
  } catch (e) {
    console.log('failed to fetch field crops by date');
  }
}

export function* fetchAllSaga({ payload: userFarmIds }) {
  try {
    const farm_id = userFarmIds.farm_id;
    const selectedUserFarmIds = yield select(loginSelector);
    const user_id = userFarmIds.user_id || selectedUserFarmIds.user_id;

    const header = getHeader(user_id, farm_id);
    if (!user_id) return;

    const tasks = [];
    const onTaskSuccess = [];

    const cropStatus = yield select(cropStatusSelector);
    if (!cropStatus.loaded) {
      tasks.push(call(axios.get, getCropsByFarmIdUrl(farm_id), header));
      onTaskSuccess.push(getAllCropsSuccess);
    }

    tasks.push(call(axios.get, getLocationsUrl(farm_id), header));
    onTaskSuccess.push(getLocationsSuccess);

    // tasks.push(call(axios.get, apiConfig.fieldCropURL + '/farm/' + farm_id, header));
    // onTaskSuccess.push(getFieldCropsSuccess);

    const roleStatus = yield select(rolesStatusSelector);
    if (!roleStatus.loaded) {
      tasks.push(call(axios.get, rolesUrl, header));
      onTaskSuccess.push(getRolesSuccess);
    }

    const userFarms = yield select(userFarmsByFarmSelector);
    if (userFarms?.length < 2) {
      tasks.push(call(axios.get, userFarmUrl + '/farm/' + farm_id, header));
      onTaskSuccess.push(getUserFarmsSuccess);
    }

    const responses = yield all(tasks);
    yield all(responses.map((response, index) => put(onTaskSuccess[index](response.data))));
    yield all([put(getLogs()), put(getAllShifts()), put(getSales()), put(getExpense())]);
  } catch (e) {
    console.error('failed to fetch farm info', e);
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
  yield takeLatest(getLocations.type, getLocationsSaga);
  yield takeLatest(getFieldCropsByDate.type, getFieldCropsSaga);
  yield takeLatest(getFieldCrops.type, getFieldCropsSaga);
  yield takeLatest(getCrops.type, getCropsSaga);
  yield takeLatest(selectFarmSuccess.type, fetchAllSaga);
  yield takeLatest(onLoadingLocationFail.type, onLoadingLocationFailSaga);
  yield takeLatest(onLoadingLocationStart.type, onLoadingLocationStartSaga);
  yield takeLatest(onLoadingLocationSuccess.type, onLoadingLocationSuccessSaga);
  yield takeLatest(getLocationsSuccess.type, getLocationsSuccessSaga);
  // yield takeLatest(UPDATE_AGREEMENT, updateAgreementSaga);
}
