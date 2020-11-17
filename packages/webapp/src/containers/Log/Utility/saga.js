// saga
import { ADD_LOG, DELETE_LOG, EDIT_LOG } from './constants';
import { call, takeEvery } from 'redux-saga/effects';
import { toastr } from 'react-redux-toastr';
import apiConfig from '../../../apiConfig';
import history from '../../../history';

const axios = require('axios');

export function* addLog(action) {
  const { logURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.post, logURL, action.formValue, header);
    if (result) {
      history.push('/log');
      toastr.success('Successfully added new Log!');
    }
  } catch(e) {
    console.log('failed to add log');
    toastr.error('Failed to add new Log');
  }
}

export function* editLog(action) {
  const { logURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.put, logURL + `/${action.formValue.activity_id}`, action.formValue, header);
    if (result) {
      history.push('/log');
      toastr.success('Successfully edited Log!');
    }
  } catch(e) {
    console.log('failed to edit log');
    toastr.error('Failed to edit Log');
  }
}

export function* deleteLog(action) {
  const { logURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.delete, logURL + `/${action.id}`, header);
    if (result) {
      history.push('/log');
      toastr.success('Successfully deleted Log!');
    }
  } catch(e) {
    console.log('failed to delete log');
    toastr.error('Failed to delete Log');
  }
}


export default function* defaultAddLogSaga() {
  yield takeEvery(ADD_LOG, addLog);
  yield takeEvery(EDIT_LOG, editLog);
  yield takeEvery(DELETE_LOG, deleteLog);
}
