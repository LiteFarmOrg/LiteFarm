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

import { put, takeEvery, call } from 'redux-saga/effects';
import apiConfig from './../../apiConfig';
import {
  GET_FARMS_BY_USER
} from "./constants";
import { setFarms } from "./actions";
const axios = require('axios');

export function* getFarmSaga() {
  let user_id = localStorage.getItem('user_id');
  const { userFarmUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
    },
  };

  try {
    const result = yield call(axios.get, userFarmUrl + '/user/' + user_id, header);
    if (result) {
      yield put(setFarms(result.data));
    }
  } catch(e) {
    console.log('failed to fetch task types from database')
  }
}

export default function* userFarmSaga() {
  yield takeEvery(GET_FARMS_BY_USER, getFarmSaga);
}
