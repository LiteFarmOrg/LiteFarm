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
import { put, takeLatest, call, select } from 'redux-saga/effects';
import { userUrl as url } from '../../apiConfig';
import history from '../../history';
import { manualSignUpSelector } from '../../containers/CustomSignUp/signUpSlice';
import { loginSuccess } from '../../containers/loginSlice';
import { toastr } from 'react-redux-toastr';
const axios = require('axios');
const userUrl = () => `${url}`;

export const customCreateUser = createAction(`customCreateUserSaga`);

export function* customCreateUserSaga({ payload: data }) {
  try {
    const name = data.name;
    const full_name = name.split(' ');
    const first_name = full_name[0];
    const last_name = full_name[1];
    let email = yield select(manualSignUpSelector);
    email = email.userEmail;
    const password = data.password;

    const result = yield call(axios.post, userUrl(), { email, first_name, last_name, password });

    if (result) {
      const {
        token,
        user: { user_id },
      } = result.data;
      localStorage.setItem('id_token', token);

      yield put(loginSuccess({ user_id }));
      history.push('/farm_selection');
    }
  } catch (e) {
    toastr.error('Error with creating user account, please contact LiteFarm for assistance.');
  }
}

export default function* createUserSaga() {
  yield takeLatest(customCreateUser.type, customCreateUserSaga);
}
