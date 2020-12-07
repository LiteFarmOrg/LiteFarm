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

import { createAction } from '@reduxjs/toolkit';
import { put, takeLatest, call } from 'redux-saga/effects';
import { loginUrl as url } from '../../apiConfig';
import history from '../../history';
import { saveUserEmailSuccess, saveUserNameSuccess } from './signUpSlice';

const axios = require('axios');
const loginUrl = (email) => `${url}/user/${email}`;

export const customSignUp = createAction(`customSignUpSaga`);

export function* customSignUpSaga({ payload: email }) {
  try {
    const result = yield call(axios.get, loginUrl(email));
    if (result.data.user != null) {
      const userEmail = result.data.user[0].email;
      yield put(saveUserEmailSuccess({ userEmail }));
    }
    if (result.data.exists && !result.data.sso) {
      const userName = result.data.user[0].first_name;
      yield put(saveUserNameSuccess({ userName }));
      history.push({
        pathname: '/password',
        state: result.data.user[0].first_name,
      });
    } else if (!result.data.exists && !result.data.sso) {
      yield put(saveUserEmailSuccess({ email }));
      history.push({
        pathname: '/create-user-account',
      });
    }
  } catch (e) {
    console.log('error is');
    console.log(e);
  }
}

export default function* signUpSaga() {
  yield takeLatest(customSignUp.type, customSignUpSaga);
}
