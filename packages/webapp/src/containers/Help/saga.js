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
import { takeLatest, call } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import history from '../../history';
import { toastr } from 'react-redux-toastr';
const axios = require('axios');
const supportUrl = () => `${url}/support_ticket`;

export const supportFileUpload = createAction(`supportFileUploadSaga`);

export function* supportFileUploadSaga({ payload: { file, form } }) {
  try {
    const formData = new FormData();
    formData.append('_file_', file)
    formData.append('data', JSON.stringify(form));
    const result = yield call(axios.post, supportUrl(), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": 'Bearer ' + localStorage.getItem('id_token')
      }
    });
    if (result) {
      toastr.success('Request ticket sent');
      history.push('/');
    } else {
      toastr.error('Failed to upload attachments');
    }
  } catch (e) {
    toastr.error('Failed to upload attachments');
    console.log(e);
  }
}

export default function* supportSaga() {
  yield takeLatest(supportFileUpload.type, supportFileUploadSaga);
}
