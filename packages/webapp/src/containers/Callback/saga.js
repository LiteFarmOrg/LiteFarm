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
import { call, put, select, takeLeading } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import { acceptInvitationSuccess, userFarmSelector } from '../userFarmSlice';
import { decodeToken } from 'react-jwt';
import i18n from '../../locales/i18n';
import { logout } from '../../util/jwt';
import { axios } from '../saga';
import { startInvitationFlow } from '../ChooseFarm/chooseFarmFlowSlice';
import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';
import { purgeState } from '../../store/store';
import { useNavigate } from 'react-router';

const validateResetTokenUrl = () => `${url}/password_reset/validate`;
const patchUserFarmStatusUrl = () => `${url}/user_farm/accept_invitation`;

export const validateResetToken = createAction('validateResetTokenSaga');

export function* validateResetTokenSaga({ payload: { reset_token } }) {
  let navigate = useNavigate();
  try {
    const result = yield call(axios.get, validateResetTokenUrl(), {
      headers: {
        Authorization: `Bearer ${reset_token}`,
      },
    });
    navigate('/password_reset', { state: reset_token });
  } catch (e) {
    const { email } = decodeToken(reset_token);
    navigate('/expired', { state: { translation_key: 'RESET_PASSWORD', email } });
  }
}

export const patchUserFarmStatus = createAction('patchUserFarmStatusSaga');

export function* patchUserFarmStatusSaga({ payload }) {
  let navigate = useNavigate();
  const { invite_token, language } = payload;
  try {
    const result = yield call(
      axios.patch,
      patchUserFarmStatusUrl(),
      {},
      {
        headers: {
          Authorization: `Bearer ${invite_token}`,
        },
      },
    );
    const { user: userFarm, id_token } = result.data;
    localStorage.setItem('id_token', id_token);
    localStorage.setItem('litefarm_lang', userFarm.language_preference);
    i18n.changeLanguage(userFarm.language_preference);
    purgeState();
    yield put(acceptInvitationSuccess(userFarm));
    yield put(startInvitationFlow(userFarm.farm_id));
    navigate('/consent');
  } catch (e) {
    if (e?.response?.status === 404) {
      // and message === 'user does not exist
      console.log(e);
      localStorage.setItem('litefarm_lang', language);
      i18n.changeLanguage(language);
      navigate('/accept_invitation/sign_up', { state: invite_token });
    } else if (e?.response?.status === 401) {
      const { email: currentEmail } = yield select(userFarmSelector);
      const { email } = decodeToken(invite_token);
      currentEmail !== email && logout();
      const translateKey =
        e.response.data === 'Invitation link is used'
          ? 'SIGNUP.USED_INVITATION_LINK_ERROR'
          : 'SIGNUP.EXPIRED_INVITATION_LINK_ERROR';
      navigate(`/?email=${encodeURIComponent(email)}`, {
        state: {
          error: i18n.t(translateKey),
        },
      });
    } else {
      yield put(enqueueErrorSnackbar(i18n.t('message:LOGIN.ERROR.LOGIN_FAIL')));
    }
  }
}

export default function* callbackSaga() {
  yield takeLeading(validateResetToken.type, validateResetTokenSaga);
  yield takeLeading(patchUserFarmStatus.type, patchUserFarmStatusSaga);
}
