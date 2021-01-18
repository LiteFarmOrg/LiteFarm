import apiConfig from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';

const axios = require('axios');

export const getRoles = createAction('getRolesSaga');

export function* getRolesSaga() {
  const { rolesUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield put(onLoadingRolesStart());
    const result = yield call(axios.get, rolesUrl, header);
    yield put(getRolesSuccess(result.data));
  } catch (e) {
    yield put(onLoadingRolesFail());
    console.log('failed to fetch roles from database');
  }
}

export default function* peopleSaga() {
  yield takeLatest(getRoles.type, getRolesSaga);
}