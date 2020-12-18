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
import { loginSuccess } from '../loginSlice';
import { toastr } from 'react-redux-toastr';
import jwt from 'jsonwebtoken';

const axios = require('axios');
const resetPasswordUrl = () => `${url}/password_reset`;
const validateTokenUrl = () => `${url}/password_reset/validate`;

export const resetPassword = createAction(`resetPasswordSaga`);

export function* resetPasswordSaga({ payload: { token, password, onPasswordResetSuccess } }) {
  try {
    const result = yield call(
      axios.put,
      resetPasswordUrl(),
      { password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          language: localStorage.getItem('litefarm_lang'),
        },
      },
    );

    const { id_token } = result.data;
    localStorage.setItem('id_token', id_token);

    const decoded = jwt.decode(id_token);
    const { user_id } = decoded;

    yield put(loginSuccess({ user_id }));
    onPasswordResetSuccess();
  } catch (e) {
    toastr.error('Error in reset password page, please contact LiteFarm for assistance.');
  }
}

export const validateToken = createAction('validateTokenSaga');

export function* validateTokenSaga({ payload: { token, setIsValid } }) {
  // call validation endpoint with token
  // if this is successful we proceed to PasswordResetAccount
  // otherwise we want to go with another component to show error. < -- view is not designed.
  // FOR NOW: move to main page
  try {
    const result = yield call(axios.get, validateTokenUrl(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setIsValid(true);
  } catch (e) {
    setIsValid(false);
    history.push('/');
    toastr.error('Error in reset password page, please contact LiteFarm for assistance.');
  }
}

export default function* resetUserPasswordSaga() {
  yield takeLatest(resetPassword.type, resetPasswordSaga);
  yield takeLatest(validateToken.type, validateTokenSaga);
}
