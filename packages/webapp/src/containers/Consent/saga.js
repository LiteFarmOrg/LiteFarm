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
import { userFarmUrl } from '../../apiConfig';
import {
  patchConsentStepThreeSuccess,
  patchStatusConsentSuccess,
  userFarmSelector,
} from '../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { axios, fetchAllSaga, getHeader } from '../saga';
import i18n from '../../locales/i18n';
import { chooseFarmFlowSelector } from '../ChooseFarm/chooseFarmFlowSlice';
import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';
import { useNavigate } from 'react-router-dom';

export const patchConsent = createAction('patchConsentSaga');

export function* patchConsentSaga({ payload }) {
  let navigate = useNavigate();
  const userFarm = yield select(userFarmSelector);
  const { user_id, farm_id, step_three, step_three_end, status, farm_name } = userFarm;
  const patchStepUrl = (farm_id, user_id) =>
    `${userFarmUrl}/onboarding/farm/${farm_id}/user/${user_id}`;
  const header = getHeader(user_id, farm_id);
  let data = {
    has_consent: payload.has_consent,
    consent_version: payload.consent_version,
  };
  try {
    const step = {
      step_three: true,
      step_three_end: step_three_end || new Date(),
    };

    yield call(
      axios.patch,
      userFarmUrl + '/consent/farm/' + farm_id + '/user/' + user_id,
      data,
      header,
    );

    if (!step_three) yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);

    const { isInvitationFlow } = yield select(chooseFarmFlowSelector);
    if (isInvitationFlow) {
      yield put(patchStatusConsentSuccess({ ...userFarm, ...data, status: 'Active' }));
      yield call(fetchAllSaga);
      navigate('/outro', { state: { farm_id, farm_name } });
    } else if (payload.goForwardTo === '/') {
      yield put(patchStatusConsentSuccess({ ...userFarm, ...data, status: 'Active' }));
      yield call(fetchAllSaga);
      navigate(payload.goForwardTo);
    } else {
      yield put(patchConsentStepThreeSuccess({ ...userFarm, ...step, ...data }));
      navigate(payload.goForwardTo);
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.AGREEMENT')));
  }
}

export default function* consentSaga() {
  yield takeLeading(patchConsent.type, patchConsentSaga);
}
