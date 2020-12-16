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
import { url } from '../../apiConfig';
import history from '../../history';
import { manualSignUpSelector, saveUserEmailSuccess, saveUserNameSuccess } from './signUpSlice';
import { ENTER_PASSWORD_PAGE, CREATE_USER_ACCOUNT } from './constants';
import { loginSuccess } from '../loginSlice';
import { toastr } from 'react-redux-toastr';

const axios = require('axios');
const loginUrl = (email) => `${url}/login/user/${email}`;
const loginWithPasswordUrl = () => `${url}/login`;
const userUrl = () => `${url}/user`;

export const customSignUp = createAction(`customSignUpSaga`);

export function* customSignUpSaga({ payload: { email, showSSOError } }) {
  try {
    const result = yield call(axios.get, loginUrl(email));
    if (result.data.exists && !result.data.sso) {
      history.push({
        pathname: '/',
        component: ENTER_PASSWORD_PAGE,
        user: {
          first_name: result.data.first_name,
          email: result.data.email,
        },
      });
    } else if (!result.data.exists && !result.data.sso) {
      yield put(saveUserEmailSuccess(email));
      history.push({
        pathname: '/',
        component: CREATE_USER_ACCOUNT,
        user: { email },
      });
    } else if (result.data.sso) {
      showSSOError();
    }
  } catch (e) {
    console.log(e);
  }
}

export const customLoginWithPassword = createAction(`customLoginWithPasswordSaga`);

export function* customLoginWithPasswordSaga({ payload: { showPasswordError, ...user } }) {
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
    if (e.response?.status === 401) {
      showPasswordError();
    } else {
      console.log(e);
      toastr.error('Unknown issue! Try again later.');
    }
  }
}

export const customCreateUser = createAction(`customCreateUserSaga`);

export function* customCreateUserSaga({ payload: data }) {
  try {
    const name = data.name;
    const full_name = name.split(' ');
    const first_name = full_name[0];
    const last_name = full_name[1] || '';
    const language_preference = localStorage.getItem('litefarm_lang');
    let email = yield select(manualSignUpSelector);
    email = email.userEmail;
    const password = data.password;

    const result = yield call(axios.post, userUrl(), { email, first_name, last_name, password, language_preference});

    if (result) {
      const {
        id_token,
        user: { user_id },
      } = result.data;
      localStorage.setItem('id_token', id_token);

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
