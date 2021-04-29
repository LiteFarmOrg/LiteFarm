// saga
import { ADD_LOG, DELETE_LOG, EDIT_LOG } from './constants';
import { ADD_HARVEST_USE_TYPE, GET_HARVEST_USE_TYPES } from '../constants';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { toastr } from 'react-redux-toastr';
import apiConfig from '../../../apiConfig';
import history from '../../../history';
import { loginSelector } from '../../userFarmSlice';
import { axios, getHeader } from '../../saga';
import i18n from '../../../locales/i18n';
import { getHarvestUseTypes, setAllHarvestUseTypes, setLogsInState } from '../actions';
import { harvestLogDataSelector, resetHarvestLog } from '../Utility/logSlice';
import { logSelector } from '../selectors';

export function* addLog(action) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const defaultData = yield select(harvestLogDataSelector);
  const header = getHeader(user_id, farm_id);
  const selectedUseTypes = defaultData.selectedUseTypes;

  const log = { ...action.formValue, user_id, farm_id, selectedUseTypes };
  try {
    const result = yield call(axios.post, logURL, log, header);
    if (result) {
      history.push('/log');
      yield put(resetHarvestLog());
      toastr.success(i18n.t('message:LOG.SUCCESS.ADD'));
    }
  } catch (e) {
    console.log(e);
    console.log('failed to add log');
    toastr.error(i18n.t('message:LOG.ERROR.ADD'));
  }
}

export function* getHarvestUseTypesSaga() {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, logURL + `/harvest_use_types/farm/${farm_id}`, header);
    if (result) {
      yield put(setAllHarvestUseTypes(result.data));
    }
  } catch (e) {
    console.log('failed to get harvest use types');
    toastr.error(i18n.t('message:LOG_HARVEST.ERROR.GET_TYPES'));
  }
}

export function* addCustomHarvestUseTypeSaga(action) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const { typeName } = action;

  const body = { name: typeName };

  try {
    const result = yield call(
      axios.post,
      logURL + `/harvest_use_types/farm/${farm_id}`,
      body,
      header,
    );
    if (result) {
      yield put(getHarvestUseTypes());
      history.push('/harvest_use_type', { isCustomHarvestUsePage: true });
      toastr.success(i18n.t('message:LOG_HARVEST.SUCCESS.ADD_USE_TYPE'));
    }
  } catch (e) {
    console.log('failed to add custom harvest use type');
    toastr.error(i18n.t('message:LOG_HARVEST.ERROR.ADD_USE_TYPE'));
  }
}

export function* editLog(action) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const defaultData = yield select(harvestLogDataSelector);
  const header = getHeader(user_id, farm_id);
  const selectedUseTypes = defaultData.selectedUseTypes;
  const log = { ...action.formValue, user_id, farm_id, selectedUseTypes };

  try {
    const result = yield call(axios.put, logURL + `/${action.formValue.activity_id}`, log, header);
    if (result) {
      history.push('/log');
      yield put(resetHarvestLog());
      toastr.success(i18n.t('message:LOG.SUCCESS.EDIT'));
    }
  } catch (e) {
    console.log('failed to edit log');
    toastr.error(i18n.t('message:LOG.ERROR.EDIT'));
  }
}

export function* deleteLog(action) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.delete, logURL + `/${action.id}`, header);
    if (result) {
      const logs = yield select(logSelector);
      yield put(setLogsInState(logs.filter((log) => log.activity_id !== action.id)));
      history.push('/log');
      toastr.success(i18n.t('message:LOG.SUCCESS.DELETE'));
    }
  } catch (e) {
    console.log('failed to delete log');
    toastr.error(i18n.t('message:LOG.ERROR.DELETE'));
  }
}

export default function* defaultAddLogSaga() {
  yield takeEvery(ADD_LOG, addLog);
  yield takeEvery(EDIT_LOG, editLog);
  yield takeEvery(DELETE_LOG, deleteLog);
  yield takeEvery(GET_HARVEST_USE_TYPES, getHarvestUseTypesSaga);
  yield takeEvery(ADD_HARVEST_USE_TYPE, addCustomHarvestUseTypeSaga);
}
