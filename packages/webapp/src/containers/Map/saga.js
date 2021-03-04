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
import { call, select, takeLatest } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import { toastr } from 'react-redux-toastr';
import i18n from '../../locales/i18n';
import { axios } from '../saga';
import { userFarmSelector } from '../userFarmSlice';

const sendMapToEmailUrl = (farm_id) => `${url}/export/map/farm/${farm_id}`;

export const sendMapToEmail = createAction(`sendMapToEmailSaga`);

export function* sendMapToEmailSaga({ payload: fileDataURL }) {
  try {
    const { farm_name } = yield select(userFarmSelector);
    const formData = new FormData();
    const fileFetchRes = yield call(fetch, fileDataURL);
    const fileBuffer = yield fileFetchRes.arrayBuffer();
    const file = new File([fileBuffer], `${farm_name}-${new Date().toISOString()}.png`, {
      type: 'image/png',
    });
    formData.append('_file_', file);
    const { farm_id } = yield select(userFarmSelector);
    yield call(axios.post, sendMapToEmailUrl(farm_id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + localStorage.getItem('id_token'),
      },
    });
  } catch (e) {
    toastr.error(i18n.t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD'));
    console.log(e);
  }
}

export default function* supportSaga() {
  yield takeLatest(sendMapToEmail.type, sendMapToEmailSaga);
}
