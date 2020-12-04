/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saga.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { GET_LOGS } from './constants';
import { setLogsInState } from './actions';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import apiConfig from './../../apiConfig';
import { loginSelector } from '../loginSlice';
import { getHeader } from '../saga';

const axios = require('axios');

export function* getLogsSaga() {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, logURL + `/farm/${farm_id}`, header);
    if (result) {
      yield put(setLogsInState(result.data));
    }
  } catch (e) {
    console.log('failed to fetch logs from database');
  }
}

export default function* logSaga() {
  yield takeEvery(GET_LOGS, getLogsSaga);
}
