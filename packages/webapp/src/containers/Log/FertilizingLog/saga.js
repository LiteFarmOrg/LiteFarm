import {
  ADD_FERTILIZER,
  ADD_FERTILIZER_LOG,
  EDIT_FERTILIZER_LOG,
  GET_FERTILIZERS,
} from './constants';
import { getFertilizers, setFertilizersInState } from './actions';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import history from '../../../history';
import { toastr } from 'react-redux-toastr';
import { loginSelector } from '../../userFarmSlice';
import { getHeader, handleError } from '../../saga';
import i18n from '../../../lang/i18n';

const axios = require('axios');

export function* getFertilizerSaga() {
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const { fertUrl } = apiConfig;
  try {
    const result = yield call(axios.get, fertUrl + '/farm/' + farm_id, header);
    if (result) {
      yield put(setFertilizersInState(result.data));
    }
  } catch (e) {
    yield put(handleError(e));
    console.log('fail to fetch fertilizers');
  }
}

export function* addFertilizerToDB(payload) {
  const { fertUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

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
  } catch (e) {
    yield put(handleError(e));
    console.log('failed to add fert');
    toastr.error(i18n.t('message:FERTILIZER.ERROR.ADD'));
  }
}

export function* addLog(payload) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

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
      toastr.success(i18n.t('message:LOG.SUCCESS.ADD'));
    }
  } catch (e) {
    yield put(handleError(e));
    console.log('failed to add log');
    toastr.error(i18n.t('message:LOG.ERROR.ADD'));
  }
}

export function* editLog(payload) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

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
      toastr.success(i18n.t('message:LOG.SUCCESS.EDIT'));
    }
  } catch (e) {
    yield put(handleError(e));
    console.log('failed to edit log');
    toastr.error(i18n.t('message:LOG.ERROR.EDIT'));
  }
}

export default function* fertSaga() {
  yield takeEvery(GET_FERTILIZERS, getFertilizerSaga);
  yield takeEvery(ADD_FERTILIZER, addFertilizerToDB);
  yield takeEvery(ADD_FERTILIZER_LOG, addLog);
  yield takeEvery(EDIT_FERTILIZER_LOG, editLog);
}
