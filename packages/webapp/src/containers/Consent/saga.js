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

import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import { userFarmUrl } from '../../apiConfig';
import { toastr } from 'react-redux-toastr';
import {
  userFarmSelector,
  patchConsentStepThreeSuccess,
  patchStatusConsentSuccess,
} from '../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { getHeader } from '../saga';
import history from '../../history';
const axios = require('axios');

export const patchConsent = createAction('patchConsentSaga');
export function* patchConsentSaga({ payload }) {
  const userFarm = yield select(userFarmSelector);
  const { user_id, farm_id, step_three, step_three_end, status } = userFarm;
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
    yield all([
      call(
        axios.patch,
        userFarmUrl + '/consent/farm/' + farm_id + '/user/' + user_id,
        data,
        header,
      ),
      !step_three && call(axios.patch, patchStepUrl(farm_id, user_id), step, header),
    ]);
    if (status === 'Invited') {
      yield put(patchStatusConsentSuccess({ ...userFarm, ...data, status: 'Active' }));
      history.push('/');
    } else {
      yield put(patchConsentStepThreeSuccess({ ...userFarm, ...step, ...data }));
      history.push(payload.goForwardTo);
    }
  } catch (e) {
    toastr.error(this.props.t('message:USER.ERROR.AGREEMENT'));
  }
}

export default function* consentSaga() {
  yield takeLatest(patchConsent.type, patchConsentSaga);
}
