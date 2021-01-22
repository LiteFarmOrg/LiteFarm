// saga
import { ADD_LOG, DELETE_LOG, EDIT_LOG, GET_HARVEST_USE_TYPES, ADD_HARVEST_USE_TYPE } from './constants';
import { call, select, takeEvery } from 'redux-saga/effects';
import { toastr } from 'react-redux-toastr';
import apiConfig from '../../../apiConfig';
import history from '../../../history';
import { loginSelector } from '../../userFarmSlice';
import { getHeader } from '../../saga';
import i18n from '../../../lang/i18n';

const axios = require('axios');

export function* addLog(action) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const log = { ...action.formValue, user_id, farm_id };
  try {
    const result = yield call(axios.post, logURL, log, header);
    if (result) {
      history.push('/log');
      toastr.success(i18n.t('message:LOG.SUCCESS.ADD'));
    }
  } catch (e) {
    console.log('failed to add log');
    toastr.error(i18n.t('message:LOG.ERROR.ADD'));
  }
}

export function* getHarvestUseTypes() {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, logURL + `/harvest_use_types/farm/${farm_id}`, header);
    if (result) {
      // result.data.move(8,9);
      console.log(result.data);
      history.push({
        pathname: '/harvest_use_type',
        state: result.data,
      });
    }
  } catch (e) {
    console.log('failed to get harvest use types');
    toastr.error(i18n.t('message:LOG.ERROR.DELETE'));
  }
}

export function* addCustomHarvestUseType(action) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const { typeName, closeModal } = action;

  const body = { name: typeName }

  try {
    const result = yield call(axios.post, logURL + `/harvest_use_types/farm/${farm_id}`, body, header);
    if (result) {
      closeModal();
      toastr.success('Successfully added custom harvest type');
    }
  } catch (e) {
    console.log('failed to add custom harvest use type');
    // toastr.error(i18n.t('message:LOG.ERROR.DELETE'));
    toastr.error('failed to add custom harvest use type'); // TODO: i18n
  }
}

export function* editLog(action) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const log = { ...action.formValue, user_id, farm_id };
  try {
    const result = yield call(axios.put, logURL + `/${action.formValue.activity_id}`, log, header);
    if (result) {
      history.push('/log');
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
  yield takeEvery(GET_HARVEST_USE_TYPES, getHarvestUseTypes);
  yield takeEvery(ADD_HARVEST_USE_TYPE, addCustomHarvestUseType);
}
