import { GET_FARM_DATA_SCHEDULE, SEND_FARM_DATA_REQUEST } from './constants';
import { setFarmSchedule } from './actions';
import { call, put, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { toastr } from 'react-redux-toastr';

const axios = require('axios');


export function* sendRequestSaga() {
  let farm_id = localStorage.getItem('farm_id');
  let user_id = localStorage.getItem('user_id');
  const { farmDataUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.post, farmDataUrl + '?farm_id=' + farm_id + '&user_id=' + user_id, {}, header);
    if (result) {
      toastr.success('Request success');
    }
  } catch(e) {
    console.log('failed to request')
  }
}

export function* getFarmDataScheduleSaga(){
  let farm_id = localStorage.getItem('farm_id');
  const { farmDataUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, farmDataUrl + `/${farm_id}`, header);
    if (result.data) {
      yield put(setFarmSchedule(result.data));
    }
  } catch(e) {
    console.log('failed to fetch users from database')
  }
}


export default function* farmDataSaga() {
  yield takeEvery(SEND_FARM_DATA_REQUEST, sendRequestSaga);
  yield takeEvery(GET_FARM_DATA_SCHEDULE, getFarmDataScheduleSaga);
}