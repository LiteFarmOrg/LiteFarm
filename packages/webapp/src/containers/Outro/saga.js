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

import { toastr } from 'react-redux-toastr';
import history from '../../history';
import moment from 'moment';

import {
 FINISH_ONBOARDING
} from "./constants";
import {finishOnboarding} from '../actions';
import { patch, call, takeEvery } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
const axios = require('axios');
const DEC = 10;

export function* patchOutroStep(payload) {
    let user_id = localStorage.getItem('user_id');
    let farm_id = localStorage.getItem('farm_id');
  const { userFarmUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  let data = {
    step_four: true,
    step_four_end: Date.now(),
  };

  try {
    const result = yield call(axios.patch, userFarmUrl + 'onboarding/farm/' + farm_id + '/user/' + user_id, data, header);
    if (result) {
        console.log(result);
        console.log('finished onboarding');
        console.log(payload);
        console.log(data);
      yield patch(finishOnboarding(result.data));
    }
  } catch (e) {
    console.error('failed to update table');
  }
}



export default function* outroSaga() {
  yield takeEvery(FINISH_ONBOARDING, finishOnboarding);
}