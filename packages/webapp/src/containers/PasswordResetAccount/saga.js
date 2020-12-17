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
// import { manualSignUpSelector, saveUserEmailSuccess, saveUserNameSuccess } from './signUpSlice';
import { loginSuccess } from '../loginSlice';
import { toastr } from 'react-redux-toastr';

const axios = require('axios');
const resetPasswordUrl = () => `${url}/password_reset`;
const loginUrl = (email) => `${url}/login/user/${email}`;
// const loginWithPasswordUrl = () => `${url}/login`;
// const userUrl = () => `${url}/user`;

export const resetPassword = createAction(`resetPasswordSaga`);

export function* resetPasswordSaga() {
  try {
    // Get reset password link, which contains the encoded token
    // Decode token using reset_password_jwt_public_key
    // Get user_id from decoded token
    // Call resetPassword endpoint, pass user_id in request body
    // Endpoint will generate a new hashed password, save in password table, set created_at to today, send password reset confirmation email, return access token
    // If access token is valid, call login user endpoint, else return error message
  } catch (e) {
    console.log(e);
  }
}

export default function* resetUserPasswordSaga() {
  yield takeLatest(resetPassword.type, resetPasswordSaga);
}
