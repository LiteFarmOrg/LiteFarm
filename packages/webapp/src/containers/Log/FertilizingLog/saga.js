import { GET_FERTILIZERS, ADD_FERTILIZER_LOG, ADD_FERTILIZER, EDIT_FERTILIZER_LOG } from "./constants";
import { setFertilizersInState, getFertilizers } from './actions';
import { put, takeEvery, call } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import history from '../../../history';
import {toastr} from "react-redux-toastr";
const axios = require('axios');

export function* getFertilizerSaga() {
  let farm_id = localStorage.getItem('farm_id');
  const { fertUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  const result = yield call(axios.get, fertUrl + '/farm/' + farm_id, header);
  if (result) {
    yield put(setFertilizersInState(result.data));
  } else {
    console.log('failed to fetch fields from database')
  }
}

export function* addFertilizerToDB(payload) {
  let farm_id = localStorage.getItem('farm_id');
  const { fertUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  let fertConfig = payload.fertConfig;
  let fert = {
    fertilizer_type: 'CUSTOM - ' + fertConfig.fertilizer_type,
    farm_id: farm_id,
    moisture_percentage: parseFloat(fertConfig.moisture_percentage),
    n_percentage: parseFloat(fertConfig.n_percentage),
    p_percentage: parseFloat(fertConfig.p_percentage),
    k_percentage: parseFloat(fertConfig.k_percentage),
    nh4_n_ppm: parseFloat(fertConfig.nh4_n_ppm),
  };

  try {
    const result = yield call(axios.post, fertUrl + '/farm/' + farm_id, fert, header);
    if (result) {
      fertConfig.fertilizer_id = result.data.fertilizer_id;
      yield put(getFertilizers());
    }
  } catch(e) {
    console.log('failed to add fert');
    toastr.error('failed to add fertilizer');
  }
}

export function* addLog(payload) {
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

  let fertConfig = payload.fertConfig;
  let log = {
    activity_kind: fertConfig.activity_kind,
    date: fertConfig.date,
    user_id: user_id,
    quantity_kg: fertConfig.quantity_kg,
    crops: fertConfig.crops,
    fields: fertConfig.fields,
    fertilizer_id: parseInt(fertConfig.fertilizer_id, 10),
    notes: fertConfig.notes,
  };

  try {
    const result = yield call(axios.post, logURL, log, header);
    if (result) {
      history.push('/log');
      toastr.success('Successfully added Log!');
    }
  } catch(e) {
    console.log('failed to add log');
    toastr.error('Failed to add Log');
  }
}

export function* editLog(payload) {
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

  let fertConfig = payload.fertConfig;
  let log = {
    activity_id: fertConfig.activity_id,
    activity_kind: fertConfig.activity_kind,
    date: fertConfig.date,
    user_id: user_id,
    quantity_kg: fertConfig.quantity_kg,
    crops: fertConfig.crops,
    fields: fertConfig.fields,
    fertilizer_id: parseInt(fertConfig.fertilizer_id, 10),
    notes: fertConfig.notes,
  };

  try {
    const result = yield call(axios.put, logURL + `/${fertConfig.activity_id}`, log, header);
    if (result) {
      history.push('/log');
      toastr.success('Successfully edited Log!');
    }
  } catch(e) {
    console.log('failed to edit log');
    toastr.error('Failed to edit Log');
  }
}


export default function* fertSaga() {
  yield takeEvery(GET_FERTILIZERS, getFertilizerSaga);
  yield takeEvery(ADD_FERTILIZER, addFertilizerToDB);
  yield takeEvery(ADD_FERTILIZER_LOG, addLog);
  yield takeEvery(EDIT_FERTILIZER_LOG, editLog);
}
