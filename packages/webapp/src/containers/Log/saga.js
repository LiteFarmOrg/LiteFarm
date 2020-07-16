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

import { GET_LOGS } from "./constants";
import { setLogsInState } from './actions';
import { put, takeEvery, call } from 'redux-saga/effects';
import apiConfig from './../../apiConfig';
const axios = require('axios');

export function* getLogsSaga() {
  let farmId = localStorage.getItem('farm_id');
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
    const result = yield call(axios.get, logURL + `?farmId=${farmId}`, header);
    if (result) {
      yield put(setLogsInState(result.data));
    }
  } catch(e) {
    console.log('failed to fetch logs from database')
  }
}

export default function* logSaga() {
  yield takeEvery(GET_LOGS, getLogsSaga);
}
