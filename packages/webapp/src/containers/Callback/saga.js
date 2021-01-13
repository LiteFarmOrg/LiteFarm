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
import { acceptInvitationSuccess, userFarmSelector } from '../userFarmSlice';
import { purgeState } from '../../index';
import jwt from 'jsonwebtoken';
import i18n from '../../lang/i18n';
import { toastr } from 'react-redux-toastr';
import { logout } from '../../util/jwt';
const axios = require('axios');
const validateResetTokenUrl = () => `${url}/password_reset/validate`;
const patchUserFarmStatusUrl = () => `${url}/user_farm/accept_invitation`;

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

export function* patchUserFarmStatusSaga({ payload: invite_token }) {
  try {
    const language_preference = localStorage.getItem('litefarm_lang');
    const result = yield call(
      axios.patch,
      patchUserFarmStatusUrl(),
      { language_preference },
      {
        headers: {
          Authorization: `Bearer ${invite_token}`,
        },
      },
    );
    const { user, id_token } = result.data;
    localStorage.setItem('id_token', id_token);
    purgeState();
    yield put(acceptInvitationSuccess(user));
    history.push('/consent', { isInvitationFlow: true, showSpotLight: false });
  } catch (e) {
    if (e?.response?.status === 404) {
      // and message === 'user does not exist
      console.log(e);
      history.push('/accept_invitation/sign_up', invite_token);
    } else if (e?.response?.status === 401) {
      const { email: currentEmail } = yield select(userFarmSelector);
      const { email } = jwt.decode(invite_token);
      currentEmail !== email && logout();
      history.push(`/?email=${encodeURIComponent(email)}`, {
        error: i18n.t('SIGNUP.EXPIRED_INVITATION_LINK_ERROR'),
      });
    } else {
      toastr.error(i18n.t('message:LOGIN.ERROR.LOGIN_FAIL'));
    }
  }
}

export default function* callbackSaga() {
  yield takeLatest(validateResetToken.type, validateResetTokenSaga);
  yield takeLatest(patchUserFarmStatus.type, patchUserFarmStatusSaga);
}
