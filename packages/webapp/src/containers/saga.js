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
  GET_USER_INFO,
  GET_FARM_INFO,
  GET_FIELD_CROPS,
  GET_FIELD_CROPS_BY_DATE,
  GET_FIELDS,
  UPDATE_USER_INFO,
  UPDATE_FARM,
  UPDATE_AGREEMENT,
} from "./constants";
import { setUserInState, setFarmInState, fetchFarmInfo, setFieldCropsInState, setFieldsInState, getFields, getFieldCrops } from './actions';
import { put, takeEvery, call } from 'redux-saga/effects';
import apiConfig from '../apiConfig';
import { toastr } from 'react-redux-toastr';
import history from "../history";
import Auth from '../Auth/Auth.js';

const axios = require('axios');


export function* getUserInfo(action) {
  let user_id = localStorage.getItem('user_id');
  const { userUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, userUrl + '/' + user_id, header);
    if (result.data[0]) {
      //console.log(result.data);
      yield put(setUserInState(result.data[0]));

      // if(!result.data[0].has_consent){
      //   history.push('/consent');
      // }
      yield put(fetchFarmInfo());

      // else if(action.loadFromHome){
      //   history.push('/add_farm');
      //   console.log('user has no farm at the moment');
      // }
    } else {
      console.log('failed to fetch user from database')
    }
  } catch(e) {
    toastr.error('Failed to fetch user info');
  }
}

export function* updateUser(payload){
  let user_id = localStorage.getItem('user_id');
  const { userUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  let data = payload.user;
  if(data.wage === null){
    delete data.wage;
  }
  if(data.phone_number === null){
    delete data.phone_number;
  }
  try {
    const result = yield call(axios.put, userUrl + '/' + user_id, data, header);
    if (result.data[0]) {
      yield put(setUserInState(result.data[0]));
      toastr.success("Successfully updated user info!")
    }
  } catch (e) {
    toastr.error('Failed to update user info')
  }
}

export function* getFarmInfo(action) {
  let farm_id = localStorage.getItem('farm_id');
  let user_id = localStorage.getItem('user_id');
  const { userFarmUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };
  
  if(!farm_id) {
    history.push('/add_farm');
    return;
  }

  try {
    const result = yield call(axios.get, userFarmUrl + '/farm/' + farm_id + '/user/' + user_id, header);
    if (result.data[0]) {
      //console.log(result.data);
      if(result.data[0].role_id){
        localStorage.setItem('role_id', result.data[0].role_id);
      };
      yield put(setFarmInState(result.data[0]));
      yield put(getFields());
      yield put(getFieldCrops());
    } else {
      console.log('failed to fetch farm from database')
    }
  } catch(e) {
    toastr.error('failed to fetch farm from database');
  }
}

export function* updateFarm(payload){
  let farm_id = payload.farm && payload.farm.farm_id;
  const { farm } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  let data = payload.farm;
  if(data.address === null){
    delete data.address;
  }
  if(data.phone_number.number === null || data.phone_number.country === null){
    delete data.phone_number;
  }
  try {
    const result = yield call(axios.put, farm + '/' + farm_id, data, header);
    if (result && result.data && result.data.length > 0) {
      // yield put(setFarmInState(result.data[0]));
      // TODO (refactoring): Handle the response to be sent properly in backend so we
      // don't need to do this extra API call to keep redux consistent
      yield put(fetchFarmInfo());
      toastr.success("Successfully updated farm info!");
    }
  } catch (e) {
    toastr.error("Failed to update farm info")
  }
}

export function* getFieldsSaga() {
  let farm_id = localStorage.getItem('farm_id');
  const { fieldURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, fieldURL + '/farm/' + farm_id, header);
    if (result) {
      yield put(setFieldsInState(result.data));
    }
  } catch(e) {
    console.log('failed to fetch fields from database')
  }
}

export function* getFieldCropsSaga() {
  let farm_id = localStorage.getItem('farm_id');
  const { fieldCropURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, fieldCropURL + '/farm/' + farm_id, header);
    if (result) {
      yield put(setFieldCropsInState(result.data));
    }
  } catch(e) {
    console.log('failed to fetch field crops from db');
  }
}

export function*  getFieldCropsByDateSaga() {
  let farm_id = localStorage.getItem('farm_id');
  let currentDate = formatDate(new Date());
  const { fieldCropURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, fieldCropURL + '/farm/date/' + farm_id + '/' + currentDate, header);
    if (result) {
      yield put(setFieldCropsInState(result.data));
    }
  } catch(e) {
    console.log('failed to fetch field crops by date')
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

export function* updateAgreementSaga(payload) {
  let user_id = localStorage.getItem('user_id');
  let farm_id = localStorage.getItem('farm_id');
  const { userFarmUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  let data = {
    has_consent: payload.consent_bool.consent,
    consent_version: payload.consent_version,
  };

  try {
    const result = yield call(axios.patch, userFarmUrl + '/consent/farm/' + farm_id +'/user/'+ user_id, data, header);
    if (result) {
      if (payload.consent_bool.consent) {
        console.log('user agreed to consent form/');
      history.push('/home');
      } else {

      const auth = new Auth();
      auth.logout();
      }
    }
  } catch(e) {
    toastr.error("Failed to update user agreement");
  }
}

export default function* getFarmIdSaga() {
  yield takeEvery(GET_USER_INFO, getUserInfo);
  yield takeEvery(UPDATE_USER_INFO, updateUser);
  yield takeEvery(GET_FARM_INFO, getFarmInfo);
  yield takeEvery(UPDATE_FARM, updateFarm);
  yield takeEvery(GET_FIELDS, getFieldsSaga);
  yield takeEvery(GET_FIELD_CROPS, getFieldCropsSaga);
  yield takeEvery(GET_FIELD_CROPS_BY_DATE, getFieldCropsByDateSaga);
  yield takeEvery(UPDATE_AGREEMENT, updateAgreementSaga);
}
