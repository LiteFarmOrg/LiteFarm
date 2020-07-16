import { GET_DISEASES, GET_PESTICIDES, ADD_PEST_CONTROL_LOG, ADD_DISEASES, ADD_PESTICIDES, EDIT_PEST_CONTROL_LOG } from "./constants";
import { setDiseaseInState, setPesticideInState, getPesticides, getDiseases } from './actions';
import { put, takeEvery, call } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import history from '../../../history';
import {toastr} from "react-redux-toastr";
const axios = require('axios');

export function* getPesticideSaga() {
  let farm_id = localStorage.getItem('farm_id');
  const { pesticideUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  const result = yield call(axios.get, pesticideUrl + '/farm/' + farm_id, header);
  if (result) {
    yield put(setPesticideInState(result.data));
  } else {
    console.error('failed to fetch disease from database')
  }
}

export function* getDiseaseSaga() {
  let farm_id = localStorage.getItem('farm_id');
  const { diseaseUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, diseaseUrl + '/farm/' + farm_id, header);
    if (result) {
      yield put(setDiseaseInState(result.data));
    }
  } catch(e) {
    console.error('failed to fetch disease from database')
  }
}

export function* addPesticideSaga(payload) {
  let farm_id = localStorage.getItem('farm_id');
  const { pesticideUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  let pesticideConfig = payload.pesticideConfig;
  pesticideConfig.farm_id = farm_id;

  try {
    const result = yield call(axios.post, pesticideUrl, pesticideConfig, header);
    if (result) {
      yield put(getPesticides());
    }
  } catch(e) {
    console.error('failed to add pesticide');
  }
}

export function* addPestControlLog(payload) {
  let user_id = localStorage.getItem('user_id');
  const { logURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  let pcLog = payload.pcConfig;
  pcLog.user_id = user_id;

  try {
    const result = yield call(axios.post, logURL, pcLog, header);
    if (result) {
      history.push('/log');
      toastr.success('Successfully added Log!');
    }
  } catch(e) {
    console.log('failed to add log');
    toastr.error('Failed to add Log');
  }
}

export function* editPestControlLog(payload) {
  let user_id = localStorage.getItem('user_id');
  const { logURL } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  let pcLog = payload.pcConfig;
  pcLog.user_id = user_id;

  try {
    const result = yield call(axios.put, logURL + `/${pcLog.activity_id}`, pcLog, header);
    if (result) {
      history.push('/log');
      toastr.success('Successfully edited Log!');
    }
  } catch(e) {
    console.log('failed to edit log');
    toastr.error('Failed to edit Log');
  }
}

export function* addDiseaseSaga(payload) {
  let farm_id = localStorage.getItem('farm_id');
  const { diseaseUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  let diseaseConfig = payload.diseaseConfig;
  diseaseConfig.farm_id = farm_id;

  try {
    const result = yield call(axios.post, diseaseUrl, diseaseConfig, header);
    if (result) {
      yield put(getDiseases());
    }
  } catch(e) {
    console.error('failed to add pesticide');
  }
}

export default function* pestControlSaga() {
  yield takeEvery(GET_PESTICIDES, getPesticideSaga);
  yield takeEvery(GET_DISEASES, getDiseaseSaga);
  yield takeEvery(ADD_PESTICIDES, addPesticideSaga);
  yield takeEvery(ADD_DISEASES, addDiseaseSaga);
  yield takeEvery(ADD_PEST_CONTROL_LOG, addPestControlLog);
  yield takeEvery(EDIT_PEST_CONTROL_LOG, editPestControlLog)
}
