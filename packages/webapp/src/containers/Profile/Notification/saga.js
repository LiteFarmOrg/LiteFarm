import { GET_USER_IN_NOTIFICATION, SET_NOTIFICATION } from "./constants";
import { setUserInState } from './actions';
import { put, takeEvery, call } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
const axios = require('axios');

export function* getUserInfo() {
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
    }
  } catch(e) {
    console.log('failed to fetch user from database')
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
  if(data.address === null){
    delete data.address;
  }
  if(data.phone_number === null){
    delete data.phone_number;
  }

  try {
    const result = yield call(axios.put, userUrl + '/' + user_id, data, header);
    if (result.data[0]) {
      yield put(setUserInState(result.data[0]));
    }
  } catch(e) {
    console.error('failed to update setting');
  }
}


export default function* notificationSaga() {
  yield takeEvery(GET_USER_IN_NOTIFICATION, getUserInfo);
  yield takeEvery(SET_NOTIFICATION, updateUser);
}
