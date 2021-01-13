import { createAction } from '@reduxjs/toolkit';
import { put, takeLatest, call } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import {
  onLoadingUserFarmsStart,
  onLoadingUserFarmsFail,
  acceptInvitationSuccess,
} from '../userFarmSlice';
import history from '../../history';
import { loginSuccess } from '../userFarmSlice';
import { toastr } from 'react-redux-toastr';
import { getFirstNameLastName } from '../../util';
import { purgeState } from '../../index';
import { enterInvitationFlow } from './invitationSlice';
import i18n from '../../lang/i18n';

const axios = require('axios');
const acceptInvitationWithSSOUrl = () => `${url}/user/accept_invitation`;
const acceptInvitationWithLiteFarmUrl = () => `${url}/user/accept_invitation`;

export const acceptInvitationWithSSO = createAction(`acceptInvitationWithSSOSaga`);

export function* acceptInvitationWithSSOSaga({
  payload: { google_id_token, invite_token, user: userForm },
}) {
  try {
    yield put(onLoadingUserFarmsStart());
    const header = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + google_id_token,
      },
    };
    const user = {
      ...userForm,
      language_preference: localStorage.getItem('litefarm_lang'),
      ...getFirstNameLastName(userForm.name),
    };
    delete user.name;
    const result = yield call(
      axios.put,
      acceptInvitationWithSSOUrl(),
      { invite_token, ...user },
      header,
    );
    const { id_token, user: resUser } = result.data;
    localStorage.setItem('id_token', id_token);
    purgeState();
    yield put(acceptInvitationSuccess(resUser));
    yield put(enterInvitationFlow());
    history.push('/consent', { isInvitationFlow: true });
  } catch (e) {
    yield put(onLoadingUserFarmsFail(e));
    if (e.response.status === 401) {
      history.push(`/?email=${encodeURIComponent(userForm.email)}`, {
        error: i18n.t('SIGNUP.EXPIRED_INVITATION_LINK_ERROR'),
      });
    } else {
      toastr.error(i18n.t('message:LOGIN.ERROR.LOGIN_FAIL'));
    }
  }
}

export const acceptInvitationWithLiteFarm = createAction(`acceptInvitationWithLiteFarmSaga`);

export function* acceptInvitationWithLiteFarmSaga({ payload: { invite_token, user: userForm } }) {
  try {
    yield put(onLoadingUserFarmsStart());
    const header = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + invite_token,
      },
    };
    const user = {
      ...userForm,
      language_preference: localStorage.getItem('litefarm_lang'),
      ...getFirstNameLastName(userForm.name),
    };
    delete user.name;
    const result = yield call(axios.post, acceptInvitationWithLiteFarmUrl(), user, header);
    const { id_token, user: resUser } = result.data;
    localStorage.setItem('id_token', id_token);
    purgeState();
    yield put(acceptInvitationSuccess(resUser));
    yield put(enterInvitationFlow());
    history.push('/consent', { isInvitationFlow: true });
  } catch (e) {
    yield put(onLoadingUserFarmsFail(e));
    if (e.response.status === 401) {
      // TODO: check error message, if token is used, return token used error instead
      history.push(`/?email=${encodeURIComponent(userForm.email)}`, {
        error: i18n.t('SIGNUP.EXPIRED_INVITATION_LINK_ERROR'),
      });
    } else {
      toastr.error(i18n.t('message:LOGIN.ERROR.LOGIN_FAIL'));
    }
  }
}

export default function* inviteSaga() {
  yield takeLatest(acceptInvitationWithSSO.type, acceptInvitationWithSSOSaga);
  yield takeLatest(acceptInvitationWithLiteFarm.type, acceptInvitationWithLiteFarmSaga);
}
