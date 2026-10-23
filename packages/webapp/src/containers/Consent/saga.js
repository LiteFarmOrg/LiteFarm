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

import { call, put, select, takeLeading } from 'redux-saga/effects';
import { userUrl } from '../../apiConfig';
import { loginSelector } from '../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { patchConsentSuccess } from '../consentSlice';
import { axios, fetchAllSaga, getHeader, joinInvitedFarmSaga } from '../saga';
import history from '../../history';
import i18n from '../../locales/i18n';
import { chooseFarmFlowSelector } from '../ChooseFarm/chooseFarmFlowSlice';
import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';

export const patchConsent = createAction('patchConsentSaga');

export function* patchConsentSaga({ payload }) {
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${userUrl}/${user_id}/consent`,
      { consent_version: payload.consent_version },
      header,
    );
    yield put(patchConsentSuccess(result.data));

    const { isInvitationFlow } = yield select(chooseFarmFlowSelector);
    if (isInvitationFlow) {
      yield call(joinInvitedFarmSaga);
    } else if (payload.goForwardTo === '/') {
      yield call(fetchAllSaga);
      history.push(payload.goForwardTo);
    } else {
      history.push(payload.goForwardTo);
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.AGREEMENT')));
  }
}

export default function* consentSaga() {
  yield takeLeading(patchConsent.type, patchConsentSaga);
}
