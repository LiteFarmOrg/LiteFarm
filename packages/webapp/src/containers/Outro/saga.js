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

import { call, put, select, takeLatest } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import { patchStepFiveSuccess } from '../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { loginSelector } from '../loginSlice';
import { getHeader } from '../saga';
import history from '../../history';

const axios = require('axios');

export const patchOutroStep = createAction('patchOutroStepSaga');

export function* patchOutroStepSaga() {
  const { userFarmUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  let data = {
    step_five: true,
    step_five_end: new Date(),
  };

  try {
    yield call(
      axios.patch,
      userFarmUrl + '/onboarding/farm/' + farm_id + '/user/' + user_id,
      data,
      header,
    );
    yield put(patchStepFiveSuccess({ ...data, farm_id, user_id }));
    history.push('/');
  } catch (e) {
    console.error('failed to update table');
  }
}

export default function* outroSaga() {
  yield takeLatest(patchOutroStep.type, patchOutroStepSaga);
}
