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

import { put, takeLatest, call, select } from 'redux-saga/effects';
import apiConfig from './../../apiConfig';
import {
  onLoadingUserFarmsStart,
  onLoadingUserFarmsFail,
  getUserFarmsSuccess,
  acceptInvitationSuccess,
  userFarmSelector,
} from '../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { loginSelector, loginSuccess } from '../userFarmSlice';
import { getHeader } from '../saga';
import { toastr } from 'react-redux-toastr';
import { purgeState } from '../../index';
import history from '../../history';
import jwt from 'jsonwebtoken';
import { logout } from '../../util/jwt';
import i18n from '../../lang/i18n';

const axios = require('axios');

export const getUserFarms = createAction('getUserFarmsSaga');
export function* getUserFarmsSaga() {
  const { userFarmUrl } = apiConfig;
  try {
    const { user_id } = yield select(loginSelector);
    const header = getHeader(user_id);
    yield put(onLoadingUserFarmsStart());
    const result = yield call(axios.get, userFarmUrl + '/user/' + user_id, header);
    yield put(getUserFarmsSuccess(result.data));
  } catch (error) {
    yield put(onLoadingUserFarmsFail(error));
    console.log('failed to fetch task types from database');
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
      const translateKey =
        e.response.data === 'Invitation link is used'
          ? 'SIGNUP.USED_INVITATION_LINK_ERROR'
          : 'SIGNUP.EXPIRED_INVITATION_LINK_ERROR';
      history.push(`/?email=${encodeURIComponent(email)}`, {
        error: i18n.t(translateKey),
      });
    } else {
      toastr.error(i18n.t('message:LOGIN.ERROR.LOGIN_FAIL'));
    }
  }
}

export default function* chooseFarmSaga() {
  yield takeLatest(getUserFarms.type, getUserFarmsSaga);
}
