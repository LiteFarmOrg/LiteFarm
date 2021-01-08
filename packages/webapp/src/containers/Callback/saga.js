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
import { toastr } from 'react-redux-toastr';

const axios = require('axios');
const validateResetTokenUrl = () => `${url}/password_reset/validate`;
const validateInviteTokenUrl = () => `${url}/user/invite/validate`;

const validateTokenUrlMap = {
  'invite': validateInviteTokenUrl,
  'reset': validateResetTokenUrl,
}

const redirectUrlMap = {
  'invite': '/invite',
  'reset': '/password_reset',
}

export const validateToken = createAction('validateTokenSaga');

export function* validateTokenSaga({ payload: { token, tokenType, setIsValid } }) {
  // call validation endpoint with token
  // if this is successful we proceed to PasswordResetAccount
  // otherwise we want to go with another component to show error. < -- view is not designed.
  // FOR NOW: move to main page
  console.log(tokenType);
  try {
    const result = yield call(axios.get, validateTokenUrlMap[tokenType](), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setIsValid(true);
    history.push({
      pathname: redirectUrlMap[tokenType],
      token,
    });
  } catch (e) {
    setIsValid(false);
    history.push('/');
    console.log('Token either invalid or used');
    toastr.error('Error in token validation, please contact LiteFarm for assistance.');
  }
}

export default function* callbackSaga() {
  yield takeLatest(validateToken.type, validateTokenSaga);
}
