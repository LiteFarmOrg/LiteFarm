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
import { patchStatusConsentSuccess, userFarmSelector } from '../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { patchConsentSuccess } from '../consentSlice';
import { fetchAllSaga } from '../saga';
import history from '../../history';
import i18n from '../../locales/i18n';
import { chooseFarmFlowSelector } from '../ChooseFarm/chooseFarmFlowSlice';
import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';

export const patchConsent = createAction('patchConsentSaga');

export function* patchConsentSaga({ payload }) {
  const userFarm = yield select(userFarmSelector);
  const { farm_id, farm_name } = userFarm;
  try {
    yield put(
      patchConsentSuccess({
        consent_version: payload.consent_version,
        consented_at: new Date().toISOString(),
      }),
    );

    const { isInvitationFlow } = yield select(chooseFarmFlowSelector);
    if (isInvitationFlow) {
      yield put(patchStatusConsentSuccess({ ...userFarm, status: 'Active' }));
      yield call(fetchAllSaga);
      history.push('/outro', { farm_id, farm_name });
    } else if (payload.goForwardTo === '/') {
      yield put(patchStatusConsentSuccess({ ...userFarm, status: 'Active' }));
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
