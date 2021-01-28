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
import { ENTER_PASSWORD_PAGE, CREATE_USER_ACCOUNT, inlineErrors } from './constants';
import { loginSuccess } from '../userFarmSlice';
import { toastr } from 'react-redux-toastr';
import i18n from '../../lang/i18n';
import { getFirstNameLastName } from '../../util';
import { axios } from '../saga';

const loginUrl = (email) => `${url}/login/user/${email}`;
const loginWithPasswordUrl = () => `${url}/login`;
const userUrl = () => `${url}/user`;
const resetPasswordUrl = () => `${url}/password_reset/send_email`;

export const customSignUp = createAction(`customSignUpSaga`);

export function* customSignUpSaga({ payload: { email, showSSOError } }) {
  try {
    const result = yield call(axios.get, loginUrl(email));
    if (result.data.exists && !result.data.sso) {
      localStorage.setItem('litefarm_lang', result.data.language);
      history.push({
        pathname: '/',
        component: ENTER_PASSWORD_PAGE,
        user: {
          first_name: result.data.first_name,
          email: result.data.email,
        },
      });
    } else if (result.data.invited) {
      showSSOError(inlineErrors.invited);
    } else if (result.data.expired) {
      showSSOError(inlineErrors.expired);
    } else if (!result.data.exists && !result.data.sso) {
      history.push({
        pathname: '/',
        component: CREATE_USER_ACCOUNT,
        user: { email },
      });
    } else if (result.data.sso) {
      showSSOError(inlineErrors.sso);
    }
  } catch (e) {
    console.log(e);
  }
}

export const customLoginWithPassword = createAction(`customLoginWithPasswordSaga`);

export function* customLoginWithPasswordSaga({ payload: { showPasswordError, ...user } }) {
  try {
    const screenSize = {
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
    };
    const data = {
      screenSize: screenSize,
      user: user,
    };
    const result = yield call(axios.post, loginWithPasswordUrl(), data);

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
      toastr.error(i18n.t('message:USER.ERROR.SIGNUP_UNKNOWN'));
    }
  }
}

export const customCreateUser = createAction(`customCreateUserSaga`);

export function* customCreateUserSaga({ payload: data }) {
  try {
    const { name, email, password, gender, birth_year } = data;
    const { first_name, last_name } = getFirstNameLastName(name);
    const language_preference = localStorage.getItem('litefarm_lang');

    let reqBody = {
      email,
      first_name,
      last_name,
      password,
      gender,
      birth_year,
      language_preference,
    };

    !reqBody.birth_year && delete reqBody.birth_year;

    const result = yield call(axios.post, userUrl(), reqBody);

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
    toastr.error(i18n.t('message:USER.ERROR.INVITE'));
  }
}

export const sendResetPasswordEmail = createAction(`sendResetPasswordEmailSaga`);

export function* sendResetPasswordEmailSaga({ payload: email }) {
  try {
    const result = yield call(axios.post, resetPasswordUrl(), { email });
  } catch (e) {
    toastr.error(i18n.t('message:USER.ERROR.RESET_PASSWORD'));
  }
}

export default function* signUpSaga() {
  yield takeLatest(customSignUp.type, customSignUpSaga);
  yield takeLatest(customLoginWithPassword.type, customLoginWithPasswordSaga);
  yield takeLatest(customCreateUser.type, customCreateUserSaga);
  yield takeLatest(sendResetPasswordEmail.type, sendResetPasswordEmailSaga);
}
