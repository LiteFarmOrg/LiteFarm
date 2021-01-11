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
import { acceptInvitationSuccess } from '../userFarmSlice';

const axios = require('axios');
const validateResetTokenUrl = () => `${url}/password_reset/validate`;
const patchUserFarmStatusUrl = () => `${url}/userFarm/accept_invitation`;

export const validateResetToken = createAction('validateResetTokenSaga');

export function* validateResetTokenSaga({ payload: { reset_token } }) {
  try {
    const result = yield call(axios.get, validateResetTokenUrl(), {
      headers: {
        Authorization: `Bearer ${reset_token}`,
      },
    });
    history.push('/password_reset', reset_token);
  } catch (e) {
    history.push('/expired', 'RESET_PASSWORD');
  }
}

export const patchUserFarmStatus = createAction('patchUserFarmStatusSaga');

export function* patchUserFarmStatusSaga({ payload: { invitation_token } }) {
  // call validation endpoint with token
  // if this is successful we proceed to PasswordResetAccount
  // otherwise we want to go with another component to show error. < -- view is not designed.
  // FOR NOW: move to main page
  try {
    const language_preference = localStorage.getItem('language_preference');
    const result = yield call(
      axios.patch,
      patchUserFarmStatusUrl(),
      { language_preference },
      {
        headers: {
          Authorization: `Bearer ${invitation_token}`,
        },
      },
    );
    const { user, id_token } = result.data;
    localStorage.setItem('id_token', id_token);
    yield put(acceptInvitationSuccess(user));
    history.push('/farm_selection', user);
  } catch (e) {
    console.log(e);
    if (e?.response?.status === 404) {
      // and message === 'user does not exist
      history.push('/invite_sign_up', invitation_token);
    } else {
      history.push('/expired', 'INVITATION');
    }
  }
}

export default function* callbackSaga() {
  yield takeLatest(validateResetToken.type, validateResetTokenSaga);
  yield takeLatest(patchUserFarmStatus.type, patchUserFarmStatusSaga);
}
