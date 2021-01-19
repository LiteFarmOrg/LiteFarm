import {
  ADD_DISEASES,
  ADD_PEST_CONTROL_LOG,
  ADD_PESTICIDES,
  EDIT_PEST_CONTROL_LOG,
  GET_DISEASES,
  GET_PESTICIDES,
} from './constants';
import { getDiseases, getPesticides, setDiseaseInState, setPesticideInState } from './actions';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import history from '../../../history';
import { toastr } from 'react-redux-toastr';
import { loginSelector } from '../../userFarmSlice';
import { getHeader, handleError } from '../../saga';
import i18n from '../../../lang/i18n';

const axios = require('axios');

export function* getPesticideSaga() {
  const { pesticideUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.get, pesticideUrl + '/farm/' + farm_id, header);
    if (result) {
      yield put(setPesticideInState(result.data));
    }
  } catch (e) {
    yield put(handleError(e));
    console.error('failed to fetch diseases');
  }
}

export function* getDiseaseSaga() {
  const { diseaseUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, diseaseUrl + '/farm/' + farm_id, header);
    if (result) {
      yield put(setDiseaseInState(result.data));
    }
  } catch (e) {
    yield put(handleError(e));
    console.error('failed to fetch disease from database');
  }
}

export function* addPesticideSaga(payload) {
  const { pesticideUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  let pesticideConfig = payload.pesticideConfig;
  pesticideConfig.farm_id = farm_id;

  try {
    const result = yield call(axios.post, pesticideUrl, pesticideConfig, header);
    if (result) {
      yield put(getPesticides());
    }
  } catch (e) {
    yield put(handleError(e));
    console.error('failed to add pesticide');
  }
}

export function* addPestControlLog(payload) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  let pcLog = payload.pcConfig;
  pcLog.user_id = user_id;

  try {
    const result = yield call(axios.post, logURL, pcLog, header);
    if (result) {
      history.push('/log');
      i18n.t('message:LOG.SUCCESS.ADD');
    }
  } catch (e) {
    yield put(handleError(e));
    console.log('failed to add log');
    i18n.t('message:LOG.ERROR.ADD');
  }
}

export function* editPestControlLog(payload) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  let pcLog = payload.pcConfig;
  pcLog.user_id = user_id;

  try {
    const result = yield call(axios.put, logURL + `/${pcLog.activity_id}`, pcLog, header);
    if (result) {
      history.push('/log');
      toastr.error(i18n.t('message:LOG.SUCCESS.EDIT'));
    }
  } catch (e) {
    yield put(handleError(e));
    console.log('failed to edit log');
    toastr.error(i18n.t('message:LOG.ERROR.EDIT'));
  }
}

export function* addDiseaseSaga(payload) {
  const { diseaseUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  let diseaseConfig = payload.diseaseConfig;
  diseaseConfig.farm_id = farm_id;

  try {
    const result = yield call(axios.post, diseaseUrl, diseaseConfig, header);
    if (result) {
      yield put(getDiseases());
    }
  } catch (e) {
    yield put(handleError(e));
    console.error('failed to add pesticide');
  }
}

export default function* pestControlSaga() {
  yield takeEvery(GET_PESTICIDES, getPesticideSaga);
  yield takeEvery(GET_DISEASES, getDiseaseSaga);
  yield takeEvery(ADD_PESTICIDES, addPesticideSaga);
  yield takeEvery(ADD_DISEASES, addDiseaseSaga);
  yield takeEvery(ADD_PEST_CONTROL_LOG, addPestControlLog);
  yield takeEvery(EDIT_PEST_CONTROL_LOG, editPestControlLog);
}
