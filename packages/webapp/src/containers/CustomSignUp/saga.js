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
import { loginUrl as url } from '../../apiConfig';
import history from '../../history';
import { manualSignUpSelector, saveUserEmailSuccess, saveUserNameSuccess } from './signUpSlice';
import { loginSuccess } from '../loginSlice';
import { toastr } from 'react-redux-toastr';

const axios = require('axios');
const loginUrl = (email) => `${url}/user/${email}`;
const loginWithPasswordUrl = () => `${url}`;
const userUrl = () => `${url}`;

export const customSignUp = createAction(`customSignUpSaga`);

export function* customSignUpSaga({ payload: email }) {
  try {
    const result = yield call(axios.get, loginUrl(email));
    if (result.data.exists && !result.data.sso) {
      history.push({
        pathname: '/',
        state: result.data.user,
      });
    } else if (!result.data.exists && !result.data.sso) {
      yield put(saveUserEmailSuccess(email));
      history.push({
        pathname: '/create-user-account',
      });
    }
  } catch (e) {
    console.log('error is');
    console.log(e);
  }
}

export const customLoginWithPassword = createAction(`customLoginWithPasswordSaga`);

export function* customLoginWithPasswordSaga({ payload: user }) {
  try {
    const result = yield call(axios.post, loginWithPasswordUrl(), user);

    const {
      id_token,
      user: { user_id },
    } = result.data;
    localStorage.setItem('id_token', id_token);

    yield put(loginSuccess({ user_id }));
    history.push('/farm_selection');
  } catch (e) {
    console.log(e);
    toastr.error('Failed to login, please contact LiteFarm for assistance.');
  }
}

export const customCreateUser = createAction(`customCreateUserSaga`);

export function* customCreateUserSaga({ payload: data }) {
  try {
    const name = data.name;
    const full_name = name.split(' ');
    const first_name = full_name[0];
    const last_name = full_name[1] || '';
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

export default function* signUpSaga() {
  yield takeLatest(customSignUp.type, customSignUpSaga);
  yield takeLatest(customLoginWithPassword.type, customLoginWithPasswordSaga);
  yield takeLatest(customCreateUser.type, customCreateUserSaga);
}
